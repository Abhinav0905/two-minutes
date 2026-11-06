// Use the standard MCP client with the endpoint written by Lens Studio itself.
import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const root = path.resolve(import.meta.dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8'));
const entry = config.mcpServers?.['lens-studio'];
if (!entry?.url) throw new Error('Open TwoMinutes.esproj in Lens Studio first; its .mcp.json is missing.');
const endpoint = new URL(entry.url);
if (!['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)) throw new Error('Expected a local Lens Studio MCP endpoint.');
const client = new Client({ name: 'two-minutes-build', version: '0.1.0' });
// Keep the editor's project-scoped token local; never print or commit it.
const transport = new StreamableHTTPClientTransport(endpoint, { requestInit: { headers: entry.headers ?? {} } });

function output(result) {
  const images = [];
  for (const [index, item] of (result.content ?? []).entries()) {
    if (item.type === 'image') {
      const dir = path.join(root, 'artifacts', 'screenshots');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${Date.now()}-${index}.${item.mimeType === 'image/jpeg' ? 'jpg' : 'png'}`);
      fs.writeFileSync(file, Buffer.from(item.data, 'base64'));
      images.push(file);
    } else if (item.type === 'text') console.log(item.text);
  }
  if (result.structuredContent) console.log(JSON.stringify(result.structuredContent, null, 2));
  if (images.length) console.log(JSON.stringify({ images }));
  if (result.isError) process.exitCode = 1;
}

try {
  await client.connect(transport);
  const [operation, name, input = '{}'] = process.argv.slice(2);
  if (operation === 'list' || operation === 'schema') {
    const list = await client.listTools();
    if (operation === 'schema') {
      const tool = list.tools.find(t => t.name === name);
      if (!tool) throw new Error(`Tool not advertised by Lens Studio: ${name}`);
      console.log(JSON.stringify(tool, null, 2));
    } else console.log(JSON.stringify(list.tools.map(t => ({ name: t.name, description: t.description?.slice(0, 130) })), null, 2));
  } else if (operation === 'call') {
    const args = JSON.parse(input.startsWith('@') ? fs.readFileSync(path.resolve(root, input.slice(1)), 'utf8') : input);
    output(await client.callTool({ name, arguments: args }, undefined, { timeout: 300000 }));
  } else throw new Error('Usage: node scripts/lens-mcp.mjs list | schema NAME | call NAME JSON_OR_@FILE');
} finally { await client.close(); }
