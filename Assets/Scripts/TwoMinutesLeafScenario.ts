/** Native integration coverage. User actions go through SIK, never engine.act().
 * Direct reset is fixture setup only. Assertions read the controller's copied state. */
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {ScenarioConfig} from "Leaf.lspkg/Scenarios/scenario/ScenarioConfig";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar";
import {TwoMinutesMain} from "./TwoMinutesMain";

@component
export class TwoMinutesLeafScenario extends Scenario {
  private interactor!: DefaultLeafInteractor;
  private main!: TwoMinutesMain;

  async run(config?: ScenarioConfig): Promise<void> {
    this.interactor = new DefaultLeafInteractor();
    this.main = findSceneObjectByName("MainController").getComponent(TwoMinutesMain.getTypeName()) as TwoMinutesMain;
    expect(!!this.main).toBe(true);
    this.main.resetDrill(); await sleep(350);
    const kind = config?.get("kind") || "exit";
    if (kind === "exit") await this.exitBoth();
    else if (kind === "containment") await this.containment(true);
    else if (kind === "accessible") await this.containment(false);
    else if (kind === "water") await this.waterRecovery();
    else if (kind === "spreading") await this.spreading();
    else if (kind === "reset") await this.resetClearsAttempt();
    else if (kind === "ik") await this.ikExit();
    else throw new Error("Unknown Two Minutes test case: " + kind);
  }

  private async tap(name: string): Promise<void> {
    const target = findInteractableByName(name);
    if (!target) throw new Error("Missing native SIK target: " + name);
    if (!target.enabled) throw new Error("Disabled native SIK target: " + name);
    for (let object: SceneObject | null = target.getSceneObject(); object; object = object.getParent()) {
      if (!object.enabled) throw new Error("Hidden native SIK target: " + name + " under " + object.name);
    }
    await this.interactor.trigger(target); await sleep(230);
  }

  private async start(spreading = false): Promise<void> {
    await this.tap(spreading ? "StartDebriefUI_Secondary" : "StartDebriefUI_Primary");
    expect(this.main.getDrillState().phase).toBe("active");
    expect(this.main.getDrillState().scenario).toBe(spreading ? "spreading" : "contained");
  }

  private async finishOutside(): Promise<void> {
    await this.tap("ObjectFeedbackUI_Primary");
    expect(this.main.getDrillState().phase).toBe("outside");
    await this.tap("StartDebriefUI_Primary");
    expect(this.main.getDrillState().phase).toBe("debrief");
    expect(this.main.getDrillState().outcome).toBe("evacuated");
  }

  private async exitBoth(): Promise<void> {
    for (const spreading of [false, true]) {
      this.main.resetDrill(); await sleep(250); await this.start(spreading);
      await this.finishOutside();
      expect(this.main.getDrillState().decisions.map(d => d.action)).toEqual(["leave", "call_help"]);
      expect(this.main.getDrillState().doorClosed).toBe(false);
      const flame = findSceneObjectByName("AmberFlame_0");
      expect(flame.enabled).toBe(true); // Leaving did not extinguish the hazard.
    }
  }

  private async containment(physical: boolean): Promise<void> {
    await this.start();
    if (physical) {
      const lid = findSceneObjectByName("LidAnchor");
      const destination = findSceneObjectByName("LidClosedAnchor");
      const step = new vec3(0, 0, 0);
      const update = this.createEvent("UpdateEvent");
      // Feed a converging SIK drag vector; do not set the prop's transform in the test.
      update.bind(() => {
        const delta = destination.getTransform().getWorldPosition().sub(lid.getTransform().getWorldPosition()).uniformScale(.15);
        step.x = delta.x; step.y = delta.y; step.z = delta.z;
      });
      try { await this.interactor.drag(findInteractableByName("LidAnchor"), step, 900); }
      finally { update.enabled = false; }
      await sleep(800);
    } else {
      await this.tap("ObjectFeedbackUI_Secondary");
      await this.tap("PracticeControlsUI_Primary");
      await sleep(800);
    }
    expect(this.main.getDrillState().lidOn).toBe(true);
    expect(this.main.getDrillState().fire).toBe("covered_hot");
    expect(this.main.getDrillState().phase).toBe("active");
    await this.tap("BurnerAnchor");
    expect(this.main.getDrillState().outcome).toBe("contained");
    expect(this.main.getDrillState().heatOn).toBe(false);
    expect(this.main.getDrillState().fire).toBe("contained");
    expect(this.main.getDrillState().decisions.filter(d => d.action === "cover").length).toBe(1);
    expect(findSceneObjectByName("AmberFlame_0").enabled).toBe(false);
    await sleep(1500);
    expect(this.main.getDrillState().fire).toBe("contained");
  }

  private async waterRecovery(): Promise<void> {
    await this.start(); await this.tap("WaterAnchor");
    expect(this.main.getDrillState().waterUsed).toBe(true);
    expect(this.main.getDrillState().fire).toBe("beyond_pan");
    expect(this.main.getDrillState().unsafeAttempts).toBe(1);
    await this.tap("ObjectFeedbackUI_Primary");
    expect(this.main.getDrillState().phase).toBe("outside");
    await this.tap("StartDebriefUI_Secondary");
    expect(this.main.getDrillState().doorClosed).toBe(true);
    await this.tap("StartDebriefUI_Primary");
    const state = this.main.getDrillState();
    expect(state.outcome).toBe("evacuated");
    expect(state.decisions.map(d => d.action)).toEqual(["water", "leave", "close_door", "call_help"]);
    expect(findSceneObjectByName("AmberFlame_0").enabled).toBe(true);
    const body = findSceneObjectByName("StartDebriefUI_Body").getComponent("Component.Text") as Text;
    expect(body.text.includes("recovered by leaving")).toBe(true);
  }

  private async spreading(): Promise<void> {
    await this.start(true); await this.tap("BurnerAnchor");
    expect(this.main.getDrillState().heatOn).toBe(true);
    await this.tap("ObjectFeedbackUI_Secondary");
    await this.tap("PracticeControlsUI_Primary");
    expect(this.main.getDrillState().lidOn).toBe(false);
    expect(this.main.getDrillState().fire).toBe("beyond_pan");
    expect(this.main.getDrillState().phase).toBe("active");
    expect(this.main.getDrillState().unsafeAttempts).toBe(2);
    await this.tap("ObjectFeedbackUI_Secondary");
    await this.tap("PracticeControlsUI_Tertiary");
    expect(this.main.getDrillState().phase).toBe("outside");
    await this.tap("StartDebriefUI_Primary");
    expect(this.main.getDrillState().outcome).toBe("evacuated");
  }

  private async resetClearsAttempt(): Promise<void> {
    await this.waterRecovery(); await this.tap("StartDebriefUI_Tertiary");
    expect(this.main.getDrillState().phase).toBe("ready");
    await this.start(true);
    const state = this.main.getDrillState();
    expect(state.decisions.length).toBe(0); expect(state.unsafeAttempts).toBe(0);
    expect(state.waterUsed).toBe(false); expect(state.helpCalled).toBe(false);
    expect(state.doorClosed).toBe(false); expect(state.lidOn).toBe(false);
    expect(state.heatOn).toBe(true);
    await this.finishOutside();
  }

  private async ikExit(): Promise<void> {
    const ik = createIKInteractor();
    await ik.trigger(findInteractableByName("StartDebriefUI_Primary"));
    await sleep(300); expect(this.main.getDrillState().phase).toBe("active");
    await ik.trigger(findInteractableByName("ObjectFeedbackUI_Primary"));
    await sleep(300); expect(this.main.getDrillState().phase).toBe("outside");
  }
}
