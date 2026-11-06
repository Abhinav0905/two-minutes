/** Authored practice scenarios. This model does not predict a real fire. */
export type Scenario = "contained" | "spreading";
export type Phase = "ready" | "active" | "outside" | "debrief";
export type Action = "cover" | "heat_off" | "water" | "move_pan" | "leave" | "close_door" | "call_help";
export type FireState = "pan" | "beyond_pan" | "covered_hot" | "contained";
export type Outcome = "contained" | "evacuated";
export interface Feedback { title: string; detail: string; tone: "neutral" | "positive" | "caution"; }
export interface Decision { action: Action; atSeconds: number; accepted: boolean; reason: string; }
export interface DrillState {
  scenario: Scenario;
  phase: Phase;
  fire: FireState;
  lidOn: boolean;
  heatOn: boolean;
  doorClosed: boolean;
  helpCalled: boolean;
  waterUsed: boolean;
  unsafeAttempts: number;
  outcome: Outcome | null;
  elapsedSeconds: number;
  decisions: Decision[];
  feedback: Feedback;
}

const READY: Feedback = {
  title: "Know when to leave",
  detail: "A practice drill. Leaving is always a valid choice. Two Minutes is the drill name, not a safe escape allowance.",
  tone: "neutral"
};

export class DrillEngine {
  private state: DrillState;
  private startedAt = 0;
  private lastTime = 0;

  constructor(scenario: Scenario = "contained") {
    this.state = this.initial(scenario);
  }

  private initial(scenario: Scenario): DrillState {
    return {
      scenario, phase: "ready", fire: scenario === "contained" ? "pan" : "beyond_pan",
      lidOn: false, heatOn: true, doorClosed: false, helpCalled: false,
      waterUsed: false, unsafeAttempts: 0, outcome: null, elapsedSeconds: 0,
      decisions: [], feedback: { ...READY }
    };
  }

  /** Return copies so renderers cannot mutate the safety state. */
  snapshot(): DrillState {
    return { ...this.state, feedback: { ...this.state.feedback }, decisions: this.state.decisions.map(d => ({ ...d })) };
  }

  start(scenario: Scenario, now: number): DrillState {
    if (!Number.isFinite(now)) throw new Error("The drill clock must be finite.");
    this.state = this.initial(scenario);
    this.startedAt = now;
    this.lastTime = now;
    this.state.phase = "active";
    this.state.feedback = scenario === "contained"
      ? { title: "A small pan fire", detail: "The fire is confined to the pan. If you have any doubt, leave.", tone: "neutral" }
      : { title: "Beyond the pan", detail: "The fire has spread beyond the pan. Leave now. Do not approach the stove.", tone: "caution" };
    return this.snapshot();
  }

  reset(scenario: Scenario = this.state.scenario): DrillState {
    this.state = this.initial(scenario);
    this.startedAt = 0;
    this.lastTime = 0;
    return this.snapshot();
  }

  private tick(now: number): void {
    if (!Number.isFinite(now)) throw new Error("The drill clock must be finite.");
    this.lastTime = Math.max(this.lastTime, now);
    this.state.elapsedSeconds = Math.max(0, this.lastTime - this.startedAt);
  }

  private record(action: Action, accepted: boolean, reason: string, feedback: Feedback): void {
    this.state.decisions.push({ action, accepted, reason, atSeconds: this.state.elapsedSeconds });
    this.state.feedback = feedback;
  }

  act(action: Action, now: number): DrillState {
    // Finished results cannot be changed by a late pinch or repeated event.
    if (this.state.phase === "ready" || this.state.phase === "debrief") return this.snapshot();
    this.tick(now);

    if (this.state.phase === "outside") {
      if (action === "close_door") {
        this.state.doorClosed = true;
        this.record(action, true, "closed_from_outside", {
          title: "Door closed", detail: "Stay outside. Call the fire department from a safe place.", tone: "positive"
        });
      } else if (action === "call_help") {
        this.state.helpCalled = true;
        this.state.outcome = "evacuated";
        this.state.phase = "debrief";
        this.record(action, true, "called_from_outside", {
          title: "You chose to leave", detail: "Get out, stay out and call for help from outside. Close the door behind you when safe to do so.", tone: "positive"
        });
      } else {
        this.record(action, false, "stay_outside", {
          title: "Stay outside", detail: "Do not go back inside for the pan, the lid or any belongings.", tone: "caution"
        });
      }
      return this.snapshot();
    }

    if (action === "leave") {
      this.state.phase = "outside";
      this.record(action, true, "leaving_is_valid", {
        title: "Outside", detail: "Stay out. Close the door behind you if safe, then call the fire department.", tone: "positive"
      });
      return this.snapshot();
    }

    if (action === "call_help") {
      this.record(action, false, "learner_should_leave", {
        title: "Get outside", detail: "This drill's next step is to leave and call from outside. Do not stay inside to finish the drill.", tone: "caution"
      });
      return this.snapshot();
    }

    if (action === "close_door") {
      this.record(action, false, "exit_is_not_a_locked_step", {
        title: "Leave first", detail: "The exit is available now. Do not delay leaving to complete another action.", tone: "neutral"
      });
      return this.snapshot();
    }

    if (action === "water" || action === "move_pan") {
      this.state.unsafeAttempts += 1;
      if (action === "water") {
        this.state.waterUsed = true;
        this.state.fire = "beyond_pan";
        this.state.lidOn = false;
      }
      this.record(action, false, action === "water" ? "never_water_on_grease" : "do_not_move_burning_pan", {
        title: action === "water" ? "Water can spread burning oil" : "Leave the pan where it is",
        detail: action === "water" ? "Never put water on a grease fire. This practice scenario now requires evacuation." : "Do not carry a burning pan. If you have any doubt, leave.",
        tone: "caution"
      });
      return this.snapshot();
    }

    if (this.state.fire === "beyond_pan") {
      this.state.unsafeAttempts += 1;
      this.record(action, false, "fire_beyond_pan_leave", {
        title: "Do not approach", detail: "The fire is beyond the pan. Leave now. The exit remains available.", tone: "caution"
      });
      return this.snapshot();
    }

    if (action === "cover") {
      this.state.lidOn = true;
      this.state.fire = "covered_hot";
      this.record(action, true, "lid_slid_over_pan", {
        title: "Keep the lid in place", detail: "Turn off the burner if safe to do so. Do not move the pan or lift the lid.", tone: "neutral"
      });
    } else if (action === "heat_off") {
      this.state.heatOn = false;
      this.record(action, true, "heat_off", {
        title: "Heat off", detail: "Turning off the heat alone does not smother a grease fire. If you have any doubt, leave.", tone: "neutral"
      });
    }

    if (this.state.lidOn && !this.state.heatOn) {
      this.state.fire = "contained";
      this.state.outcome = "contained";
      this.state.phase = "debrief";
      this.state.feedback = {
        title: "Contained in this practice scenario",
        detail: "Keep the lid on until the pan is completely cool. Do not move it. In a real fire, get out if you have any doubt and contact the fire department.",
        tone: "positive"
      };
    }
    return this.snapshot();
  }
}
