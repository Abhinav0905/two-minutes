/** Coordinates the authored scene, pure state engine, SIK interactions and passive UI.
 * Required references are wired in Phase B. No text, materials or calls are authored here. */
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import {InteractableManipulation} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";
import {Action, DrillEngine, DrillState, Scenario} from "./TwoMinutesState";
import {TwoMinutesPanelUI} from "./TwoMinutesPanelUI";
import {TwoMinutesKitchenMesh} from "./TwoMinutesKitchenMesh";
import {TwoMinutesExitMesh} from "./TwoMinutesExitMesh";
import {TwoMinutesAudioController} from "./TwoMinutesAudioController";
import {startView, feedbackView, controlsView, exitView, outsideView, debriefView} from "./TwoMinutesViews";

@component
export class TwoMinutesMain extends BaseScriptComponent {
  @ui.label("Two Minutes | practice controller")
  @ui.group_start("References")
  @input @hint("Authored movable experience root") stage!: SceneObject;
  @input @hint("Tracked world camera") camera!: Camera;
  @input @hint("Start and debrief UIKit panel") startPanel!: TwoMinutesPanelUI;
  @input @hint("Contextual feedback UIKit panel") feedbackPanel!: TwoMinutesPanelUI;
  @input @hint("Optional accessible action controls") controlsPanel!: TwoMinutesPanelUI;
  @input @hint("UIKit affordance at the virtual exit") exitPanel!: TwoMinutesPanelUI;
  @input @hint("Kitchen geometry and animation component") kitchen!: TwoMinutesKitchenMesh;
  @input @hint("Practice exit and hinged door component") exitMesh!: TwoMinutesExitMesh;
  @input @hint("Practice sound component") audio!: TwoMinutesAudioController;
  @input @hint("Authored pan interaction wrapper") pan!: SceneObject;
  @input @hint("Authored movable lid interaction wrapper") lid!: SceneObject;
  @input @hint("Authored position for lid placement") lidClosed!: SceneObject;
  @input @hint("Authored front burner interaction wrapper") burner!: SceneObject;
  @input @hint("Authored water-glass interaction wrapper") water!: SceneObject;
  @input @hint("Authored practice exit region") exitRegion!: SceneObject;
  @ui.group_end
  @ui.group_start("Settings")
  @input @hint("Place the scene around the initial camera position at Lens start") placeAtStart: boolean = true;
  @input @hint("Maximum lid release distance from the pan anchor, in centimeters")
  @widget(new SliderWidget(4, 18, .5)) lidSnapDistance: number = 11;
  @input @hint("Horizontal radius of the explicitly authored exit region")
  @widget(new SliderWidget(12, 45, 1)) exitRadius: number = 28;
  @input @hint("Draw collider outlines for interaction diagnosis on preview restart") debugColliders: boolean = false;
  @ui.group_end

  private engine = new DrillEngine();
  private showHint = false;
  private showControls = false;
  private ready = false;
  private lidManipulation!: InteractableManipulation;
  private interactables: Interactable[] = [];
  private firstPanelPosition!: vec3;
  private firstPanelRotation!: quat;

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.initialize());
    this.createEvent("UpdateEvent").bind(() => this.updateExit());
  }

  private initialize(): void {
    if (!this.stage || !this.camera || !this.startPanel || !this.feedbackPanel || !this.controlsPanel || !this.exitPanel || !this.kitchen || !this.exitMesh || !this.audio || !this.pan || !this.lid || !this.lidClosed || !this.burner || !this.water || !this.exitRegion) {
      print("TwoMinutesMain: required reference missing. Check bootstrap Phase B."); return;
    }
    if (this.placeAtStart) {
      const transform = this.camera.getTransform();
      this.stage.getTransform().setWorldPosition(transform.getWorldPosition());
      const yaw = transform.getWorldRotation().toEulerAngles().y;
      this.stage.getTransform().setWorldRotation(quat.angleAxis(yaw, vec3.up()));
    }
    if (!this.camera.getSceneObject().getComponent("Component.AudioListenerComponent")) {
      this.camera.getSceneObject().createComponent("Component.AudioListenerComponent");
    }
    this.firstPanelPosition = this.startPanel.getSceneObject().getTransform().getLocalPosition();
    this.firstPanelRotation = this.startPanel.getSceneObject().getTransform().getLocalRotation();
    [this.startPanel, this.feedbackPanel, this.controlsPanel, this.exitPanel].forEach(panel => panel.onCommand.add(command => this.command(command)));
    this.bindProp(this.pan, "pan", new vec3(28, 9, 28), "move_pan");
    this.bindProp(this.burner, "burner", new vec3(9, 9, 9), "heat_off");
    this.bindProp(this.water, "water", new vec3(10, 12, 10), "water");
    const lidInteractable = this.bindProp(this.lid, "lid", new vec3(31, 9, 31));
    this.lidManipulation = this.lid.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
    this.lidManipulation.setCanTranslate(true);
    this.lidManipulation.setCanRotate(false);
    this.lidManipulation.setCanScale(false);
    this.lidManipulation.setManipulateRoot(this.lid.getTransform());
    this.lidManipulation.onManipulationEnd.add(() => {
      const state = this.engine.snapshot();
      // Disabling a completed manipulation can emit a second end callback.
      if (state.phase !== "active" || state.lidOn) return;
      const distance = this.lid.getTransform().getWorldPosition().distance(this.lidClosed.getTransform().getWorldPosition());
      if (distance <= this.lidSnapDistance) this.perform("cover");
      else this.kitchen.resetPose();
    });
    lidInteractable.allowMultipleInteractors = false;
    this.ready = true;
    this.render();
    print("TwoMinutes: ready. Start either authored scenario.");
  }

  private bindProp(object: SceneObject, name: string, size: vec3, action?: Action): Interactable {
    const collider = object.createComponent("Physics.ColliderComponent") as ColliderComponent;
    const shape = Shape.createBoxShape(); shape.size = size;
    collider.shape = shape; collider.fitVisual = false; collider.debugDrawEnabled = this.debugColliders;
    const interactable = object.createComponent(Interactable.getTypeName()) as Interactable;
    interactable.onHoverEnter.add(() => this.kitchen.setHovered(name, true));
    interactable.onHoverExit.add(() => this.kitchen.setHovered(name, false));
    if (action) interactable.onTriggerEnd.add(() => this.perform(action));
    this.interactables.push(interactable);
    return interactable;
  }

  private command(command: string): void {
    if (!this.ready) return;
    if (command === "start_contained" || command === "start_spreading") {
      this.startScenario(command === "start_contained" ? "contained" : "spreading"); return;
    }
    if (command === "reset") { this.resetDrill(); return; }
    if (command === "hint") { this.showHint = !this.showHint; this.render(); return; }
    if (command === "controls") { this.showControls = !this.showControls; this.render(); return; }
    this.perform(command as Action);
  }

  startScenario(scenario: Scenario): void {
    this.audio.stop(); this.showHint = false; this.showControls = false;
    this.engine.start(scenario, getTime());
    this.kitchen.resetPose(); this.audio.start(); this.render(); this.logState();
  }
  resetDrill(): void {
    this.audio.stop(); this.showHint = false; this.showControls = false;
    this.engine.reset();
    const transform = this.startPanel.getSceneObject().getTransform();
    transform.setLocalPosition(this.firstPanelPosition); transform.setLocalRotation(this.firstPanelRotation);
    this.render(); this.logState();
  }
  getDrillState(): DrillState { return this.engine.snapshot(); }

  private perform(action: Action): void {
    if (!this.ready) return;
    const before = this.engine.snapshot();
    const state = this.engine.act(action, getTime());
    this.showControls = false;
    this.audio.action(action, state);
    if (state.phase !== before.phase && (state.phase === "outside" || state.phase === "debrief")) this.placeResultPanel();
    this.render(); this.logState();
  }

  private render(): void {
    const state = this.engine.snapshot();
    this.kitchen.setState(state); this.exitMesh.setClosed(state.doorClosed); this.exitMesh.setActive(state.phase === "active");
    this.startPanel.setView(state.phase === "ready" ? startView() : state.phase === "outside" ? outsideView(state) : state.phase === "debrief" ? debriefView(state) : null);
    this.feedbackPanel.setView(state.phase === "active" && !this.showControls ? feedbackView(state, this.showHint, this.showControls) : null);
    this.controlsPanel.setView(state.phase === "active" && this.showControls ? controlsView(state) : null);
    this.exitPanel.setView(state.phase === "active" ? exitView() : null);
    this.interactables.forEach(interactable => interactable.enabled = state.phase === "active");
    if (this.lidManipulation) this.lidManipulation.enabled = state.phase === "active" && !state.lidOn;
  }

  private placeResultPanel(): void {
    const camera = this.camera.getTransform();
    const rotation = camera.getWorldRotation();
    this.startPanel.getSceneObject().getTransform().setWorldPosition(camera.getWorldPosition().add(rotation.multiplyVec3(new vec3(0, 0, -110))));
    this.startPanel.getSceneObject().getTransform().setWorldRotation(rotation);
  }

  private updateExit(): void {
    if (!this.ready || this.engine.snapshot().phase !== "active") return;
    const camera = this.camera.getTransform().getWorldPosition();
    const region = this.exitRegion.getTransform().getWorldPosition();
    const dx = camera.x - region.x, dz = camera.z - region.z;
    if (dx * dx + dz * dz < this.exitRadius * this.exitRadius) this.perform("leave");
  }
  private logState(): void {
    const state = this.engine.snapshot();
    print("TwoMinutes state " + JSON.stringify({scenario: state.scenario, phase: state.phase, fire: state.fire, outcome: state.outcome, actions: state.decisions.map(d => d.action), unsafeAttempts: state.unsafeAttempts}));
  }
}
