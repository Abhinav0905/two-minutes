import assert from "node:assert/strict";
import test from "node:test";
import { DrillEngine, type Action, type DrillState, type Scenario } from "../Assets/Scripts/TwoMinutesState.ts";

const actions: Action[] = ["cover", "heat_off", "water", "move_pan", "leave", "close_door", "call_help"];

function replay(scenario: Scenario, history: Action[]): DrillEngine {
  const engine = new DrillEngine(scenario);
  engine.start(scenario, 100);
  history.forEach((action, index) => engine.act(action, 101 + index));
  return engine;
}

function checkState(state: DrillState, history: Action[]): void {
  const context = `${state.scenario}: ${history.join(" -> ") || "start"}`;
  if (state.outcome === "contained") {
    assert.equal(state.phase, "debrief", context);
    assert.equal(state.lidOn, true, context);
    assert.equal(state.heatOn, false, context);
    assert.equal(state.waterUsed, false, context);
    assert.equal(state.scenario, "contained", context);
  }
  if (state.outcome === "evacuated") {
    assert.equal(state.phase, "debrief", context);
    assert.equal(state.helpCalled, true, context);
    assert.ok(state.decisions.some(d => d.action === "leave" && d.accepted), context);
  }
  if (state.waterUsed) assert.notEqual(state.outcome, "contained", context);
  if (state.phase === "debrief") assert.ok(state.outcome !== null, context);
  assert.ok(state.elapsedSeconds >= 0 && Number.isFinite(state.elapsedSeconds), context);
  state.decisions.forEach((decision, index) => {
    assert.ok(decision.atSeconds >= 0, context);
    if (index > 0) assert.ok(decision.atSeconds >= state.decisions[index - 1].atSeconds, context);
  });
}

for (const scenario of ["contained", "spreading"] as const) {
  test(`${scenario}: safety invariants across every choice sequence up to five actions`, t => {
    let checked = 0;
    const walk = (history: Action[]): void => {
      const engine = replay(scenario, history);
      const state = engine.snapshot();
      checkState(state, history);
      checked++;

      if (state.phase === "active") {
        const recovery = replay(scenario, history);
        assert.equal(recovery.act("leave", 200).phase, "outside", history.join(" -> "));
        const result = recovery.act("call_help", 201);
        assert.equal(result.outcome, "evacuated", history.join(" -> "));
        checkState(result, [...history, "leave", "call_help"]);
      } else if (state.phase === "outside") {
        // The optional door step must never become a hidden gate to asking for help.
        assert.equal(engine.act("call_help", 200).outcome, "evacuated", history.join(" -> "));
      } else if (state.phase === "debrief") {
        for (const action of actions) assert.deepEqual(engine.act(action, 200), state);
        return;
      }

      if (history.length < 5) actions.forEach(action => walk([...history, action]));
    };
    walk([]);
    t.diagnostic(`Checked ${checked} action prefixes, with terminal branches pruned.`);
  });
}
