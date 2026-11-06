import {DrillEngine} from './drill-engine.js';

const engine = new DrillEngine();
const panel = document.querySelector('#practice-panel');
const scene = document.querySelector('#scene');
const status = document.querySelector('#scene-status');
const scenarioLabel = document.querySelector('#scene-number');
const hint = document.querySelector('#scene-hint');
let showHint = false;
const clock = () => performance.now() / 1000;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {cover:'Lid',heat_off:'Heat off',water:'Water',move_pan:'Pan',leave:'Left',close_door:'Door closed',call_help:'Called from outside'};

function scenarioButtons() {
  return `<div class="scenario-choices">
    <button class="scenario-button" type="button" data-scenario="contained"><i aria-hidden="true">↗</i><strong>Small pan fire</strong><span>The fire is confined to the pan.</span></button>
    <button class="scenario-button" type="button" data-scenario="spreading"><i aria-hidden="true">↗</i><strong>Beyond the pan</strong><span>The fire has already spread.</span></button>
  </div>`;
}

function readyPanel() {
  return `<p class="panel-eyebrow">01 / CHOOSE A STARTING POINT</p>
    <h2 id="panel-heading" tabindex="-1">Two situations.<br>Different decisions.</h2>
    <p class="panel-body">Start with a virtual kitchen fire. Select a prop or use the buttons. You can leave at any point.</p>
    ${scenarioButtons()}
    <p class="panel-note">No timer. No speed score. The debrief explains your choices.</p>
    <div class="step-note"><span aria-hidden="true">↗</span><div>This is a browser preview of the decisions. Watch the video below for the native SPECS interactions.</div></div>`;
}

function activePanel(s) {
  const isBeyond = s.fire === 'beyond_pan';
  const reminder = isBeyond
    ? 'The fire has spread beyond the pan. Do not approach it. Leave and stay outside.'
    : 'For a small confined pan fire only: slide a lid from the side, switch off safely reachable heat and keep it covered until cool. If in doubt, leave.';
  return `<div class="${s.feedback.tone === 'caution' ? 'caution' : ''}">
    <p class="panel-eyebrow">02 / ${s.scenario === 'contained' ? 'SMALL PAN FIRE' : 'BEYOND THE PAN'}</p>
    <h2 id="panel-heading" tabindex="-1">${escape(s.feedback.title)}</h2>
    <p class="panel-body">${escape(s.feedback.detail)}</p>
    <div class="action-grid">
      <button class="button secondary" type="button" data-action="cover" ${s.lidOn ? 'disabled' : ''}>${s.lidOn ? 'Lid in place' : 'Slide lid'}</button>
      <button class="button secondary" type="button" data-action="heat_off" ${!s.heatOn ? 'disabled' : ''}>${!s.heatOn ? 'Heat is off' : 'Turn heat off'}</button>
    </div>
    <button class="button leave-button" type="button" data-action="leave"><span aria-hidden="true">←</span><span>Leave now</span></button>
    <div class="minor-actions"><button class="link-button" type="button" data-command="hint" aria-expanded="${showHint}">${showHint ? 'Hide reminder' : 'Show a reminder'}</button><button class="link-button" type="button" data-action="water">Select water glass</button></div>
    ${showHint ? `<p class="feedback-note">${reminder}</p>` : ''}
    <p class="panel-note">The virtual pan cannot be carried. In a real fire, get out if you have any doubt.</p>
  </div>`;
}

function outsidePanel(s) {
  return `<p class="panel-eyebrow">03 / OUTSIDE IN THE DRILL</p>
    <h2 id="panel-heading" tabindex="-1">${s.doorClosed ? 'Stay outside.' : "You're outside."}</h2>
    <p class="panel-body">Leaving did not extinguish the fire. Stay out. Close the door behind you when safe, then call the fire department from outside.</p>
    <div class="outside-actions"><button class="button" type="button" data-action="call_help">Simulate calling for help</button><button class="button secondary" type="button" data-action="close_door" ${s.doorClosed ? 'disabled' : ''}>${s.doorClosed ? 'Door is closed' : 'Close door if safe'}</button></div>
    <p class="panel-note">This button does not place a real call. Closing the door is optional and does not block the call step.</p>`;
}

function debriefPanel(s) {
  const contained = s.outcome === 'contained';
  const lesson = s.waterUsed
    ? 'Water can spread burning oil. Never use water on a grease fire. You recovered by leaving.'
    : s.scenario === 'spreading' && s.unsafeAttempts
      ? 'A lid or burner action cannot solve a fire that has spread beyond the pan. You recovered by leaving.'
      : s.decisions.some(d => d.action === 'move_pan') ? 'Do not carry a burning pan. Review that choice before another try.' : '';
  const choices = s.decisions.map(d => `<li class="${d.accepted ? '' : 'rejected'}">${names[d.action]}${d.accepted ? '' : ' (not accepted)'}</li>`).join('');
  return `<p class="panel-eyebrow">04 / ${contained ? 'CONTAINED IN THIS SCENARIO' : 'LEFT + CALLED OUTSIDE'}</p>
    <h2 id="panel-heading" tabindex="-1">${contained ? 'Keep it covered.' : 'Get out. Stay out.'}</h2>
    <p class="panel-body">${escape(s.feedback.detail)}</p>
    ${lesson ? `<p class="feedback-note">${lesson}</p>` : ''}
    <p class="choice-label">YOUR CHOICES</p><ul class="choice-list" aria-label="Your choices">${choices}</ul>
    <div class="debrief-buttons"><button class="button" type="button" data-command="reset">Try another scenario</button></div>
    <p class="panel-note">This is practice, not a readiness certificate. Follow local fire-service guidance.</p>`;
}

function render(previousPhase) {
  const s = engine.snapshot();
  const isOutside = s.phase === 'outside' || s.outcome === 'evacuated';
  scene.className = ['scene',s.phase === 'ready' ? 'ready' : '',s.fire === 'pan' && s.phase !== 'ready' ? 'pan-fire' : '',s.fire === 'beyond_pan' && s.phase !== 'ready' ? 'beyond-fire' : '',s.lidOn ? 'lid-on' : '',!s.heatOn ? 'heat-off' : '',isOutside ? 'outside' : '',s.doorClosed ? 'door-closed' : '',s.phase === 'debrief' ? 'complete' : ''].join(' ');
  scene.dataset.phase = s.phase;
  document.querySelector('#outside-marker').hidden = !isOutside;
  document.querySelector('#door-leaf').setAttribute('d',s.doorClosed ? 'M47 110H143V337H47Z' : 'M47 110 130 128v209l-83 5Z');
  status.textContent = isOutside ? 'VIRTUAL OUTSIDE AREA' : s.phase === 'debrief' ? 'PRACTICE COMPLETE' : 'VIRTUAL KITCHEN';
  scenarioLabel.textContent = s.phase === 'ready' ? 'CHOOSE A SCENARIO' : s.scenario === 'contained' ? 'SCENARIO 01 / SMALL PAN FIRE' : 'SCENARIO 02 / BEYOND THE PAN';
  hint.textContent = s.phase === 'ready' ? 'Choose a scenario, then select an object or an action.' : isOutside ? 'Leaving changes your position in the drill. The fire remains.' : s.phase === 'debrief' ? 'The debrief records the actual choices in this attempt.' : 'Select a prop or use the action buttons. Leaving stays available.';
  for (const button of scene.querySelectorAll('[data-action]')) {
    button.disabled = s.phase !== 'active' || (button.dataset.action === 'cover' && s.lidOn) || (button.dataset.action === 'heat_off' && !s.heatOn);
  }
  document.querySelector('#reset-top').disabled = s.phase === 'ready';
  panel.innerHTML = s.phase === 'ready' ? readyPanel() : s.phase === 'active' ? activePanel(s) : s.phase === 'outside' ? outsidePanel(s) : debriefPanel(s);
  if (previousPhase && previousPhase !== s.phase) {
    panel.querySelector('#panel-heading')?.focus({preventScroll:true});
  }
}

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  const before = engine.snapshot();
  if (button.dataset.scenario) {
    engine.start(button.dataset.scenario,clock());
    showHint = false;
  } else if (button.dataset.command === 'reset') {
    engine.reset();
    showHint = false;
  } else if (button.dataset.command === 'hint') {
    showHint = !showHint;
  } else if (button.dataset.action) {
    engine.act(button.dataset.action,clock());
    showHint = false;
  } else return;
  render(before.phase);
  if (before.phase === engine.snapshot().phase && !button.isConnected) {
    const key = button.dataset.action ? 'action' : 'command';
    const replacement = panel.querySelector(`button[data-${key}="${button.dataset[key]}"]:not(:disabled)`);
    (replacement ?? panel.querySelector('#panel-heading'))?.focus({preventScroll:true});
  }
});

render();
