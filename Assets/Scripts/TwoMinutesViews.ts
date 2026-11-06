/** Copy and passive view models. These describe the engine's actual decisions. */
import type {DrillState} from "./TwoMinutesState";
import type {PanelView} from "./TwoMinutesPanelUI";

export function startView(): PanelView {
  return {
    eyebrow: "TWO MINUTES / PRACTICE DRILL", title: "Know when to leave",
    body: "A virtual kitchen. Look down toward the cooktop. Start with a small pan fire or one that has already spread. Leaving is always valid.",
    note: "No real fire. No emergency calls. The title is not a safe escape allowance.",
    buttons: [{label: "Small pan fire", command: "start_contained"}, {label: "Beyond the pan", command: "start_spreading"}]
  };
}
export function feedbackView(state: DrillState, hint: boolean, controls: boolean): PanelView {
  const detail = hint ? (state.fire === "beyond_pan"
    ? "The fire has spread beyond the pan. Do not approach it. Leave and stay outside."
    : "For a small confined pan fire only: slide a lid over it from the side, switch off the heat if safely reachable and keep it covered until cool. If in doubt, leave.")
    : state.feedback.detail;
  return {
    eyebrow: "PRACTICE / " + (state.scenario === "contained" ? "SMALL PAN FIRE" : "BEYOND THE PAN"),
    title: hint ? "A reminder" : state.feedback.title, body: detail,
    buttons: [
      {label: "Leave now", command: "leave"},
      {label: "Hint + practice controls", command: "controls"}
    ]
  };
}
export function controlsView(state: DrillState): PanelView {
  return {eyebrow: "ACCESSIBLE CONTROLS", title: "Choose an action",
    body: state.fire === "beyond_pan"
      ? "Fire beyond the pan: do not approach. Leave. The lid and burner cannot solve this scenario."
      : "Small confined pan fire only: slide a lid from the side, turn off heat if safely reachable and keep covered until cool. If in doubt, leave.",
    buttons: [{label: "Slide the lid", command: "cover"}, {label: "Turn heat off", command: "heat_off"}, {label: "Leave now", command: "leave"}]};
}
export function exitView(): PanelView {
  return {eyebrow: "VIRTUAL PRACTICE EXIT", title: "Leave the area",
    body: "This door marks the drill's exit. It does not map your real room.",
    buttons: [{label: "Leave now", command: "leave"}]};
}
export function outsideView(state: DrillState): PanelView {
  return {eyebrow: "PRACTICE / OUTSIDE", title: state.doorClosed ? "Stay outside" : "You're outside",
    body: "Leaving did not extinguish the fire. Stay out. Close the door behind you when safe, then call the fire department from outside.",
    note: "The call below is simulated. No real call is placed.",
    buttons: [{label: "Simulate calling for help", command: "call_help"}, {label: state.doorClosed ? "Door is closed" : "Close door if safe", command: "close_door"}]};
}
export function debriefView(state: DrillState): PanelView {
  const names: {[key: string]: string} = {cover: "lid", heat_off: "heat off", water: "water", move_pan: "pan", leave: "left", close_door: "door", call_help: "called outside"};
  const recent = state.decisions.slice(-6);
  const earlier = state.decisions.length > recent.length ? (state.decisions.length - recent.length) + " earlier choices; " : "";
  const actions = earlier + recent.map(d => names[d.action] + (d.accepted ? "" : " (rejected)")).join(" > ");
  const recovery = !state.unsafeAttempts ? "" : state.outcome === "evacuated"
    ? "You recovered by leaving. Review the unsafe choice before another try. "
    : "You contained this scenario after an unsafe attempt. Review that choice before another try. ";
  const lesson = state.waterUsed ? "Water can spread burning oil. Never use water on a grease fire. "
    : state.scenario === "spreading" && state.unsafeAttempts ? "Do not approach a fire that has spread beyond the pan. "
    : state.decisions.some(d => d.action === "move_pan") ? "Do not carry a burning pan. " : "";
  return {
    eyebrow: "PRACTICE COMPLETE / " + (state.outcome === "contained" ? "CONTAINED" : "LEFT + CALLED OUTSIDE"),
    title: state.outcome === "contained" ? "Keep it covered" : "Get out. Stay out.",
    body: state.feedback.detail + "\n\n" + lesson + recovery + "Your choices: " + actions,
    note: "This is practice, not a readiness certificate. Follow local fire-service guidance.",
    buttons: [{label: "Try small pan fire", command: "start_contained"}, {label: "Try beyond the pan", command: "start_spreading"}, {label: "Back to start", command: "reset"}]
  };
}
