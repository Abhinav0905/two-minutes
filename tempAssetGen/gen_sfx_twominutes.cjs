// Two Minutes audio recipe. Uses Snap CLAD's Apache-2.0 synthesis tools.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PROJECT_ASSETS_SFX = path.join(PROJECT_ROOT, 'Assets', 'GeneratedSFX');
const cladRoot = process.argv[2] || path.join(os.homedir(), '.codex/plugins/cache/ls-extensions/ls-clad/local');
const audio = require(path.resolve(cladRoot, 'skills/build-sfx/tools'));
fs.mkdirSync(PROJECT_ASSETS_SFX, { recursive: true });

function alarm() {
  // Three pulses, a pause, then a repeat. Authored practice cue, not a certified alarm.
  const out = new Float32Array(audio.SAMPLE_RATE * 8);
  for (const start of [0, 1, 2, 4, 5, 6]) {
    const body = audio.sine(3100, 0.5, 0.65);
    const edge = audio.sine(6200, 0.5, 0.1);
    audio.fadeIn(body, 0.008);
    audio.fadeOut(body, 0.012);
    audio.fadeIn(edge, 0.008);
    audio.fadeOut(edge, 0.012);
    audio.addInto(out, body, Math.floor(start * audio.SAMPLE_RATE), 0.8);
    audio.addInto(out, edge, Math.floor(start * audio.SAMPLE_RATE), 0.2);
  }
  return out;
}

const sounds = {
  Alarm: alarm,
  LidSlide: () => audio.sfx_presets.impact({ material: 'metal', size: 0.2, seed: 6401 }),
  ControlTap: () => audio.sfx_presets.uiToggle({ on: false, seed: 6402 }),
  ExitCue: () => audio.sfx_presets.uiNotify({ seed: 6403 }),
  Caution: () => audio.sfx_presets.uiError({ pitch: -4, seed: 6404 })
};

const manifest = [];
for (const [name, make] of Object.entries(sounds)) {
  const buffer = make();
  audio.mix_bus.masterChain(buffer, { normalize: 'peak', peakCeiling: name === 'Alarm' ? 0.36 : 0.65 });
  const channels = buffer.left ? [buffer.left, buffer.right] : [buffer];
  const tail = Math.floor(0.008 * audio.SAMPLE_RATE);
  for (const channel of channels) {
    for (let i = 0; i < tail; i++) channel[channel.length - tail + i] *= 1 - i / tail;
  }
  const file = path.join(PROJECT_ASSETS_SFX, name + '.wav');
  audio.WavBuilder.write(buffer, file);
  manifest.push({ name, file: path.relative(PROJECT_ROOT, file), sampleRate: audio.SAMPLE_RATE, channels: channels.length, durationSeconds: channels[0].length / audio.SAMPLE_RATE, bytes: fs.statSync(file).size });
}
fs.writeFileSync(path.join(PROJECT_ASSETS_SFX, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
