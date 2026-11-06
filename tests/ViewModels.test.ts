import assert from "node:assert/strict";
import test from "node:test";
import { DrillEngine } from "../Assets/Scripts/TwoMinutesState.ts";
import { controlsView, debriefView, feedbackView } from "../Assets/Scripts/TwoMinutesViews.ts";

test("containment after a rejected pan move does not claim the learner left", () => {
  const engine = new DrillEngine();
  engine.start("contained", 0);
  engine.act("move_pan", 1);
  engine.act("cover", 2);
  const state = engine.act("heat_off", 3);
  const view = debriefView(state);
  assert.equal(state.outcome, "contained");
  assert.doesNotMatch(view.body, /recovered by leaving|called outside/);
  assert.match(view.body, /unsafe attempt/);
  assert.match(view.body, /Do not carry a burning pan/);
  assert.match(view.body, /pan \(rejected\)/);
});

test("water followed by evacuation is described as recovery after a mistake", () => {
  const engine = new DrillEngine();
  engine.start("contained", 0);
  engine.act("water", 1);
  engine.act("leave", 2);
  const state = engine.act("call_help", 3);
  const view = debriefView(state);
  assert.equal(state.outcome, "evacuated");
  assert.match(view.body, /recovered by leaving/);
  assert.match(view.body, /Water can spread burning oil/);
  assert.match(view.body, /water/);
  assert.match(view.body, /left/);
  assert.match(view.body, /called outside/);
});

test("a long attempt produces a bounded debrief without deleting the action record", () => {
  const engine = new DrillEngine();
  engine.start("contained", 0);
  for (let index = 0; index < 1000; index++) engine.act("move_pan", index + 1);
  engine.act("leave", 1001);
  const state = engine.act("call_help", 1002);
  const view = debriefView(state);
  assert.ok(view.body.length < 600, `Debrief was ${view.body.length} characters`);
  assert.match(view.body, /earlier choices/);
  assert.match(view.body, /left/);
  assert.match(view.body, /called outside/);
  assert.equal(engine.snapshot().decisions.length, 1002);
});

test("the reminder follows the current hazard after water and keeps leave available", () => {
  const engine = new DrillEngine();
  engine.start("contained", 0);
  const state = engine.act("water", 1);
  const view = controlsView(state);
  assert.match(view.body, /do not approach/i);
  assert.doesNotMatch(view.body, /Small confined pan fire only/);
  assert.ok(view.buttons.some(button => button.command === "leave"));
  assert.ok(feedbackView(state, false, false).buttons.some(button => button.command === "leave"));
});
