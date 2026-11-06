import { test } from "node:test";
import assert from "node:assert/strict";
import { DrillEngine } from "../Assets/Scripts/TwoMinutesState.ts";
import type { Action, Scenario } from "../Assets/Scripts/TwoMinutesState.ts";

function run(scenario: Scenario, actions: Action[]) {
  const engine = new DrillEngine(scenario);
  engine.start(scenario, 100);
  actions.forEach((action, index) => engine.act(action, 101 + index));
  return engine.snapshot();
}

test("leaving immediately succeeds in both authored scenarios", () => {
  for (const scenario of ["contained", "spreading"] as Scenario[]) {
    const s = run(scenario, ["leave", "call_help"]);
    assert.equal(s.phase, "debrief");
    assert.equal(s.outcome, "evacuated");
    assert.equal(s.unsafeAttempts, 0);
  }
});

test("covering and switching off the heat ends the contained branch without forced spread", () => {
  const s = run("contained", ["cover", "heat_off"]);
  assert.equal(s.outcome, "contained");
  assert.equal(s.fire, "contained");
  assert.equal(s.lidOn, true);
  assert.equal(s.heatOn, false);
  assert.match(s.feedback.detail, /completely cool/);
});

test("turning off a safely reachable burner before covering also permits containment", () => {
  assert.equal(run("contained", ["heat_off", "cover"]).outcome, "contained");
});

test("heat off alone is not represented as an extinguished grease fire", () => {
  const s = run("contained", ["heat_off"]);
  assert.equal(s.phase, "active");
  assert.equal(s.fire, "pan");
  assert.equal(s.outcome, null);
});

test("cover alone does not end the branch while the heat remains on", () => {
  const s = run("contained", ["cover"]);
  assert.equal(s.fire, "covered_hot");
  assert.equal(s.phase, "active");
});

test("spreading fire cannot be solved by approaching the lid and burner", () => {
  const s = run("spreading", ["cover", "heat_off"]);
  assert.equal(s.phase, "active");
  assert.equal(s.fire, "beyond_pan");
  assert.equal(s.lidOn, false);
  assert.equal(s.heatOn, true);
  assert.equal(s.unsafeAttempts, 2);
});

test("water starts the authored evacuation branch and cannot earn a containment result", () => {
  const s = run("contained", ["water", "cover", "heat_off", "leave", "call_help"]);
  assert.equal(s.waterUsed, true);
  assert.equal(s.fire, "beyond_pan");
  assert.equal(s.outcome, "evacuated");
  assert.equal(s.unsafeAttempts, 3);
});

test("moving the pan is rejected without moving or extinguishing it", () => {
  const s = run("contained", ["move_pan"]);
  assert.equal(s.decisions[0].accepted, false);
  assert.equal(s.fire, "pan");
});

test("calling from inside does not bypass evacuation", () => {
  const s = run("spreading", ["call_help"]);
  assert.equal(s.phase, "active");
  assert.equal(s.helpCalled, false);
});

test("door closing is available after exit and is not a prerequisite for calling", () => {
  const closed = run("spreading", ["leave", "close_door", "call_help"]);
  const direct = run("spreading", ["leave", "call_help"]);
  assert.equal(closed.doorClosed, true);
  assert.equal(closed.outcome, "evacuated");
  assert.equal(direct.doorClosed, false);
  assert.equal(direct.outcome, "evacuated");
});

test("outside interaction cannot return the learner to the fire", () => {
  const s = run("spreading", ["leave", "cover", "heat_off", "water", "call_help"]);
  assert.equal(s.outcome, "evacuated");
  assert.equal(s.waterUsed, false);
  assert.equal(s.lidOn, false);
});

test("every active action leaves an evacuation path available", () => {
  for (const scenario of ["contained", "spreading"] as Scenario[]) {
    for (const action of ["cover", "heat_off", "water", "move_pan", "close_door", "call_help"] as Action[]) {
      const s = run(scenario, [action, "leave", "call_help"]);
      assert.equal(s.outcome, "evacuated", `${scenario}: ${action}`);
    }
  }
});

test("completed results ignore repeated or late interaction events", () => {
  const engine = new DrillEngine();
  engine.start("contained", 10);
  engine.act("cover", 11);
  const finished = engine.act("heat_off", 12);
  assert.deepEqual(engine.act("water", 99), finished);
  assert.deepEqual(engine.act("leave", 100), finished);
});

test("reset removes decisions and flags from the previous run", () => {
  const engine = new DrillEngine();
  engine.start("contained", 0);
  engine.act("water", 1);
  engine.act("leave", 2);
  engine.act("call_help", 3);
  const s = engine.reset("spreading");
  assert.equal(s.phase, "ready");
  assert.equal(s.scenario, "spreading");
  assert.equal(s.waterUsed, false);
  assert.equal(s.helpCalled, false);
  assert.deepEqual(s.decisions, []);
});

test("snapshot changes cannot mutate engine state", () => {
  const engine = new DrillEngine();
  engine.start("contained", 0);
  const s = engine.act("cover", 1);
  s.lidOn = false;
  s.decisions[0].accepted = false;
  s.feedback.title = "changed";
  assert.equal(engine.snapshot().lidOn, true);
  assert.equal(engine.snapshot().decisions[0].accepted, true);
  assert.notEqual(engine.snapshot().feedback.title, "changed");
});

test("clock rollback does not produce negative or decreasing elapsed times", () => {
  const engine = new DrillEngine();
  engine.start("contained", 100);
  engine.act("cover", 110);
  const s = engine.act("leave", 105);
  assert.equal(s.elapsedSeconds, 10);
  assert.equal(s.decisions[1].atSeconds, 10);
});

test("invalid clock input fails explicitly", () => {
  assert.throws(() => new DrillEngine().start("contained", NaN), /finite/);
});
