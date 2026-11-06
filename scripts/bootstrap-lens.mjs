// Writes the two declarative native scene operations, without talking to the editor.
// Apply through scripts/lens-mcp.mjs. This file never writes .scene or .esproj data.
import fs from 'node:fs';
const create = [];
function obj(name, parent, position = [0, 0, 0], script, rotation = [0, 0, 0]) {
  const item = {id: '$temp:' + name, name, transform: {position, rotation, scale: [1, 1, 1]}};
  if (parent) item.parentId = '$temp:' + parent;
  if (script) item.components = [{type: 'ScriptComponent', properties: {scriptAsset: '@asset:Scripts/' + script + '.ts'}}];
  create.push(item);
}
obj('TwoMinutes');
obj('MainController', 'TwoMinutes', undefined, 'TwoMinutesMain');
obj('KitchenRig', 'TwoMinutes', [0, -70, -130], 'TwoMinutesKitchenMesh');
obj('CooktopAnchor', 'KitchenRig');
obj('PanAnchor', 'KitchenRig', [-15, 1, 0]);
obj('LidRestAnchor', 'KitchenRig', [20, 0, 14]);
obj('LidAnchor', 'KitchenRig', [20, 0, 14]);
obj('LidClosedAnchor', 'KitchenRig', [-15, 7.6, 0]);
obj('BurnerAnchor', 'KitchenRig', [-15, -7, 28]);
obj('WaterAnchor', 'KitchenRig', [30, 0, -14]);
obj('FlameRig', 'KitchenRig', [-15, 4, 0]);
obj('ExitRig', 'TwoMinutes', [-160, -160, -45], 'TwoMinutesExitMesh', [0, 65, 0]);
obj('DoorAnchor', 'ExitRig', [-40, 0, 0]);
obj('ExitRegion', 'ExitRig', [0, 160, -28]);
obj('OutsideAnchor', 'ExitRig', [0, 160, -65]);
obj('ExitDirectionCue', 'TwoMinutes', [-25, -38, -130]);
obj('StartDebriefUI', 'TwoMinutes', [0, -28, -140], 'TwoMinutesPanelUI');
obj('ObjectFeedbackUI', 'TwoMinutes', [24, -38, -145], 'TwoMinutesPanelUI');
obj('PracticeControlsUI', 'TwoMinutes', [24, -38, -145], 'TwoMinutesPanelUI');
obj('ExitUI', 'ExitRig', [0, 155, 10], 'TwoMinutesPanelUI');
obj('AudioRig', 'TwoMinutes', undefined, 'TwoMinutesAudioController');
obj('AlarmSource', 'AudioRig', [-15, -65, -130]);
obj('CueSource', 'AudioRig', [0, -30, -90]);
obj('TwoMinutesLEAF', 'TwoMinutes', undefined, 'TwoMinutesLeafIndex');
const modify = {};
const ref = n => '@sceneObject:' + n;
const comp = (n, c) => '@component:' + n + '/' + c;
function wire(name, props) {
  modify[ref(name)] = Object.fromEntries(Object.entries(props).map(([k, v]) => ['components.ScriptComponent.' + k, v]));
}
wire('MainController', {
  stage: ref('TwoMinutes'), camera: '@component:Camera Object.Camera',
  startPanel: comp('StartDebriefUI', 'TwoMinutesPanelUI'), feedbackPanel: comp('ObjectFeedbackUI', 'TwoMinutesPanelUI'),
  controlsPanel: comp('PracticeControlsUI', 'TwoMinutesPanelUI'), exitPanel: comp('ExitUI', 'TwoMinutesPanelUI'),
  kitchen: comp('KitchenRig', 'TwoMinutesKitchenMesh'), exitMesh: comp('ExitRig', 'TwoMinutesExitMesh'),
  audio: comp('AudioRig', 'TwoMinutesAudioController'),
  pan: ref('PanAnchor'), lid: ref('LidAnchor'), lidClosed: ref('LidClosedAnchor'),
  burner: ref('BurnerAnchor'), water: ref('WaterAnchor'), exitRegion: ref('ExitRegion'),
  placeAtStart: true, lidSnapDistance: 11, exitRadius: 28, debugColliders: false
});
wire('KitchenRig', {
  material: '@id:70d03593-c7b4-410a-ae5c-75cb82ee32dc', cooktop: ref('CooktopAnchor'), pan: ref('PanAnchor'),
  lid: ref('LidAnchor'), lidRest: ref('LidRestAnchor'), lidClosed: ref('LidClosedAnchor'), burner: ref('BurnerAnchor'),
  water: ref('WaterAnchor'), flames: ref('FlameRig'), slideSeconds: .65, flickerSpeed: 1.4
});
wire('ExitRig', {material: '@id:70d03593-c7b4-410a-ae5c-75cb82ee32dc', frame: ref('ExitRig'), doorHinge: ref('DoorAnchor'), arrow: ref('ExitDirectionCue')});
wire('AudioRig', {alarmSource: ref('AlarmSource'), cueSource: ref('CueSource'), alarmVolume: .3, cueVolume: .55});
wire('StartDebriefUI', {panelWidth: 46, bodyHeight: 8, padding: 2, rowGap: .8, textScale: 1.15});
wire('ObjectFeedbackUI', {panelWidth: 34, bodyHeight: 5, padding: 1.5, rowGap: .6, textScale: 1.15});
wire('PracticeControlsUI', {panelWidth: 34, bodyHeight: 5, padding: 1.5, rowGap: .6, textScale: 1.15});
wire('ExitUI', {panelWidth: 38, bodyHeight: 5, padding: 1.5, rowGap: .7, textScale: 1});
fs.mkdirSync('artifacts/native', {recursive:true});
fs.writeFileSync('artifacts/native/phase-a.json', JSON.stringify({command:'apply', instructions:{create}}, null, 2));
fs.writeFileSync('artifacts/native/phase-b.json', JSON.stringify({command:'apply', instructions:{modify}}, null, 2));
console.log('Prepared Phase A (24 authored roots) and Phase B (component and asset references).');
