import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs');
const assets = path.join(out, 'assets');
fs.mkdirSync(assets, {recursive:true});
const input = fs.readFileSync(path.join(root, 'Assets/Scripts/TwoMinutesState.ts'), 'utf8');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(),'two-minutes-web-'));
try {
  execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'--project','tsconfig.web.json','--outDir',temporary],{cwd:root,stdio:'inherit'});
  const compiled = fs.readFileSync(path.join(temporary,'TwoMinutesState.js'),'utf8');
  fs.writeFileSync(path.join(out,'drill-engine.js'),`// Generated from Assets/Scripts/TwoMinutesState.ts. Run npm run web:build.\n${compiled}`);
} finally { fs.rmSync(temporary,{recursive:true,force:true}); }
fs.copyFileSync(path.join(root,'devpost/screenshots/00-cover.jpg'),path.join(assets,'cover.jpg'));
const video = path.join(root,'artifacts/media/TwoMinutes-demo.mp4');
const publicVideo = path.join(assets,'demo.mp4');
if (fs.existsSync(video)) fs.copyFileSync(video, publicVideo);
if (!fs.existsSync(publicVideo)) throw new Error('The published native demo MP4 is missing.');
const srt = fs.readFileSync(path.join(root,'demo-video/TwoMinutes-English.srt'),'utf8');
fs.writeFileSync(path.join(assets,'english.vtt'),'WEBVTT\n\n'+srt.replace(/\r/g,'').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g,'$1.$2'));
const info = {nativeEngineSource:'Assets/Scripts/TwoMinutesState.ts',nativeEngineSha256:sha256(input),videoSha256:sha256(fs.readFileSync(publicVideo)),companion:'Browser controls over the native decision engine; not the SIK/AR runtime.'};
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify(info,null,2)+'\n');
console.log('Built browser engine, native demo, cover and English captions in docs/.');
