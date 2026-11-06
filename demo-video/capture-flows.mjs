// Drives the running Lens through its advertised MCP tools. The footage is
// recorded separately by Lens Studio's native Preview recorder.
import fs from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const config = JSON.parse(fs.readFileSync('.mcp.json', 'utf8')).mcpServers['lens-studio'];
const endpoint = new URL(config.url);
if (!['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)) throw new Error('Expected the local Lens Studio MCP');
const client = new Client({name:'two-minutes-demo', version:'1.0.0'});
await client.connect(new StreamableHTTPClientTransport(endpoint, {requestInit:{headers:config.headers ?? {}}}));
const started = Date.now();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function tool(name, args) {
  const result = await client.callTool({name, arguments:args}, undefined, {timeout:300000});
  if (result.isError) throw new Error(JSON.stringify(result.content));
  if (result.structuredContent) return result.structuredContent;
  const data = result.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
  try { return JSON.parse(data); } catch { return {text:data}; }
}
function log(event, extra={}) { console.log(JSON.stringify({elapsed:(Date.now()-started)/1000, event, ...extra})); }
async function object(name, interactable=false) {
  const filter = {nameContains:name, ...(interactable ? {hasComponents:['Interactable'],enabledOnly:true} : {})};
  const query = `{ sceneObjects(filter: ${JSON.stringify(filter).replace(/"([a-zA-Z]+)":/g,'$1:')}) { matches { summary transform { worldPosition } } } }`;
  const result = await tool('QueryRuntimeSceneTool', {query});
  const row = result.data?.sceneObjects?.matches?.find(x=>x.summary.name===name);
  if (!row) throw new Error('Missing visible target: '+name);
  return row;
}
async function tap(name) {
  const target=await object(name,true);
  const result=await tool('PreviewInteractTool',{action:'Pinch',uniqueId:target.summary.uniqueId,durationMs:180});
  if (!result.success) throw new Error(JSON.stringify(result));
  log('tap',{name});
}
async function camera(commands) { return tool('MovePreviewCamera',{action:commands[0].action,commands}); }
async function prepare() {
  await camera([{action:'reset'}]);
  await tool('RecompileTypeScriptTool',{});
  await tool('RunAndCollectLogsTool',{mode:'refresh',settleMinMs:800,settleMaxMs:2200});
  await camera([{action:'lookAt',x:0,y:-50,z:-130}]);
  log('ready');
}
async function containment() {
  await tap('StartDebriefUI_Primary');
  await wait(1400);
  const lid = await object('LidAnchor',true);
  const closed = await object('LidClosedAnchor');
  const burner = await object('BurnerAnchor',true);
  const from = lid.transform.worldPosition;
  const destination = closed.transform.worldPosition;
  const result = await tool('PreviewInteractTool',{action:'Batch',actions:[
    {action:'Pinch',uniqueId:lid.summary.uniqueId,hold:true},
    {action:'Drag',uniqueId:lid.summary.uniqueId,worldPosition:{x:from.x,y:destination.y,z:from.z},durationMs:600,hold:true},
    {action:'Wait',durationMs:200},
    {action:'Drag',uniqueId:lid.summary.uniqueId,worldPosition:destination,durationMs:1000,hold:true},
    {action:'Wait',durationMs:250},
    {action:'Release',handType:'right'},
    {action:'Wait',durationMs:900},
    {action:'Pinch',uniqueId:burner.summary.uniqueId,durationMs:200}
  ]});
  if (!result.success) throw new Error(JSON.stringify(result));
  log('lid-and-burner-complete');
  await wait(2200);
}
async function evacuation() {
  await tap('StartDebriefUI_Secondary');
  await wait(2200);
  const door = await object('ExitUI');
  await camera([{action:'lookAt',...door.transform.worldPosition}]);
  await wait(1800);
  // The preview hand ray remains based on the initial view when the spectator
  // camera is turned. Return to the reachable, equivalent Leave now control.
  await camera([{action:'lookAt',x:0,y:-50,z:-130}]);
  await wait(600);
  await tap('ObjectFeedbackUI_Primary');
  await tap('StartDebriefUI_Secondary');
  await wait(1500);
  await tap('StartDebriefUI_Primary');
  await wait(5000);
  log('evacuation-complete');
}
async function recovery() {
  await tap('StartDebriefUI_Primary');
  await wait(800);
  await tap('WaterAnchor');
  await wait(2200);
  await tap('ObjectFeedbackUI_Primary');
  await tap('StartDebriefUI_Primary');
  await wait(2500);
  log('water-recovery-complete');
}
try {
  const action=process.argv[2] ?? 'prepare';
  if (action==='prepare') await prepare();
  else if (action==='hero') { await tap('StartDebriefUI_Primary'); log('hero-active'); }
  else if (action==='containment') await containment();
  else if (action==='evacuation') await evacuation();
  else if (action==='recovery') await recovery();
  else if (action==='verify') {
    const cases = ['exit_both','lid_drag_containment','accessible_containment','water_recovery','spreading_rejects_containment','reset','ik_exit'];
    const results=[];
    for (const name of cases) {
      const result=await tool('run_leaf_scenario',{scenarioId:'two_minutes_'+name,onDevice:false});
      if (result.status!=='succeeded') throw new Error(JSON.stringify(result));
      results.push(result); log('test-passed',{scenario:name});
    }
    fs.writeFileSync('devpost/validation/leaf-results.json',JSON.stringify({target:'Lens Studio Preview',results},null,2)+'\n');
  }
  else if (action==='inspect') {
    const result=await tool('QueryRuntimeSceneTool',{query:'{ sceneObjects(filter:{nameContains:"StartDebriefUI_Body",hasComponents:["Text"],enabledOnly:true}) { matches { components(filter:["Text"]) { properties } } } }'});
    log('body',{data:result.data});
  } else throw new Error('Unknown flow');
} finally { await client.close(); }
