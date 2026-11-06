/** Articulated kitchen. Expects authored prop anchors and vertex-color material.
 * Builds geometry beneath those anchors, animates leaves and never changes drill state. */
import {DrillState} from "./TwoMinutesState";
import {Color4, TwoMinutesMesh} from "./TwoMinutesMesh";

@component
export class TwoMinutesKitchenMesh extends BaseScriptComponent {
  @ui.label("Two Minutes | articulated kitchen")
  @ui.group_start("References")
  @input @hint("Vertex-color material from the SimpleVertexBaseColor package") material!: Material;
  @input @hint("Authored cooktop anchor") cooktop!: SceneObject;
  @input @hint("Authored pan interaction wrapper") pan!: SceneObject;
  @input @hint("Authored movable lid interaction wrapper") lid!: SceneObject;
  @input @hint("Authored lid resting position") lidRest!: SceneObject;
  @input @hint("Authored position for the closed lid") lidClosed!: SceneObject;
  @input @hint("Authored front burner-control wrapper") burner!: SceneObject;
  @input @hint("Authored water-glass interaction wrapper") water!: SceneObject;
  @input @hint("Authored flame anchor") flames!: SceneObject;
  @ui.group_end
  @ui.group_start("Settings")
  @input @hint("Duration of the accessible side-sliding lid action, in seconds")
  @widget(new SliderWidget(.2, 1.5, .05)) slideSeconds: number = .65;
  @input @hint("Amber flame movement rate. This is an authored visual cue, not a fire model")
  @widget(new SliderWidget(.3, 3, .1)) flickerSpeed: number = 1.4;
  @ui.group_end

  private fireParts: SceneObject[] = [];
  private spreadParts: SceneObject[] = [];
  private knobVisual!: SceneObject;
  private lidVisual!: SceneObject;
  private panVisual!: SceneObject;
  private waterVisual!: SceneObject;
  private state: DrillState | null = null;
  private slideFrom: vec3 | null = null;
  private slideStarted = 0;
  private initialized = false;

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.build());
    this.createEvent("UpdateEvent").bind(() => this.update());
  }

  private build(): void {
    if (!this.material || !this.cooktop || !this.pan || !this.lid || !this.lidRest || !this.lidClosed || !this.burner || !this.water || !this.flames) {
      print("TwoMinutesKitchenMesh: missing authored reference. Check Phase B."); return;
    }
    const ivory: Color4 = [.76, .84, .86, 1], steel: Color4 = [.54, .66, .72, 1];
    new TwoMinutesMesh().box([0, -3, 0], [76, 6, 52], ivory)
      .box([0, -20, -2], [69, 30, 45], [.22, .39, .45, 1])
      .box([-31, -55, -18], [4, 70, 4], steel).box([31, -55, -18], [4, 70, 4], steel)
      .box([-31, -55, 18], [4, 70, 4], steel).box([31, -55, 18], [4, 70, 4], steel)
      .attach(this.cooktop, "CooktopBodyMesh", this.material);
    const burnerRing = new TwoMinutesMesh().lathe([[0, 0], [16, 0], [16, .5], [13, .5], [13, 1], [0, 1]], [.24, .3, .34, 1])
      .attach(this.cooktop, "BurnerRingMesh", this.material);
    burnerRing.getTransform().setLocalPosition(new vec3(-15, 0, 0));
    this.panVisual = new TwoMinutesMesh()
      .lathe([[0, 0], [12, 0], [14, 1.4], [14, 5.7], [13.5, 6.5], [12.9, 6], [12.4, 2], [0, 2]], [.34, .43, .49, 1])
      .box([0, 3, 23], [4, 3, 25], [.18, .27, .32, 1])
      .box([0, 3.2, 32], [4.4, 3.6, 8], [.75, .85, .87, 1])
      .attach(this.pan, "PanMesh", this.material);
    this.lidVisual = new TwoMinutesMesh()
      .lathe([[0, 0], [15, 0], [15.3, .5], [14, 1.4], [10, 2.8], [4, 4], [0, 4.2]], [.78, .86, .87, 1])
      .box([0, 5, 0], [6, 3, 3], [.22, .32, .37, 1])
      .attach(this.lid, "LidMesh", this.material);
    this.knobVisual = new TwoMinutesMesh()
      .lathe([[0, -1.5], [3.5, -1.5], [3.5, 1.5], [0, 1.5]], [.7, .8, .83, 1], 40)
      .box([0, 1.6, -1], [.7, .5, 3.2], [1, .66, .22, 1])
      .attach(this.burner, "BurnerKnobMesh", this.material);
    this.knobVisual.getTransform().setLocalRotation(quat.angleAxis(Math.PI / 2, vec3.right()));
    this.waterVisual = new TwoMinutesMesh()
      .lathe([[0, 0], [4, 0], [4.5, 10], [4.1, 10], [3.8, 1], [0, 1]], [.5, .85, 1, 1], 40)
      .attach(this.water, "WaterGlassMesh", this.material);
    for (let i = 0; i < 9; i++) {
      const flame = new TwoMinutesMesh()
        .lathe([[0, 0], [3, 1], [4.1, 5], [3.2, 10], [1.8, 15], [0, 21]], [1, .38 + .035 * i, .075, 1], 20)
        .attach(this.flames, "AmberFlame_" + i, this.material);
      const angle = i * Math.PI * 2 / 9;
      flame.getTransform().setLocalPosition(new vec3(Math.cos(angle) * 7, 0, Math.sin(angle) * 7));
      this.fireParts.push(flame);
    }
    const core = new TwoMinutesMesh().lathe([[0, 0], [4, 1], [5, 4], [3.8, 8], [0, 14]], [1, .91, .5, 1], 32)
      .attach(this.flames, "PaleFlameCore", this.material);
    this.fireParts.push(core);
    for (let i = 0; i < 5; i++) {
      const spread = new TwoMinutesMesh().lathe([[0, 0], [4, 2], [4.5, 6], [2, 14], [0, 24]], [1, .48, .14, 1], 20)
        .attach(this.flames, "BeyondPanFlame_" + i, this.material);
      spread.getTransform().setLocalPosition(new vec3(-28 + i * 14, -4, -15));
      this.spreadParts.push(spread);
    }
    this.initialized = true;
    this.resetPose();
    this.update();
  }

  setState(state: DrillState): void {
    const newlyCovered = state.lidOn && !this.state?.lidOn;
    this.state = state;
    if (!this.initialized) return;
    if (newlyCovered) {
      this.slideFrom = this.lid.getTransform().getWorldPosition();
      this.slideStarted = getTime();
    }
    if (state.phase === "ready" || !state.lidOn && state.decisions.length === 0) this.resetPose();
  }

  resetPose(): void {
    if (!this.initialized) return;
    this.slideFrom = null;
    this.lid.getTransform().setWorldPosition(this.lidRest.getTransform().getWorldPosition());
    this.lid.getTransform().setLocalRotation(quat.quatIdentity());
  }

  setHovered(prop: string, hovered: boolean): void {
    const object = prop === "pan" ? this.panVisual : prop === "water" ? this.waterVisual : prop === "lid" ? this.lidVisual : this.knobVisual;
    if (object) object.getTransform().setLocalScale(vec3.one().uniformScale(hovered ? 1.04 : 1));
  }

  private update(): void {
    if (!this.initialized) return;
    if (this.slideFrom) {
      const t = Math.min(1, (getTime() - this.slideStarted) / this.slideSeconds);
      const destination = this.lidClosed.getTransform().getWorldPosition();
      // Lift at the side first, then slide horizontally across the rim. Never pass through the pan wall.
      const sideAtRim = new vec3(this.slideFrom.x, destination.y, this.slideFrom.z);
      if (t < .3) {
        this.lid.getTransform().setWorldPosition(vec3.lerp(this.slideFrom, sideAtRim, t / .3));
      } else {
        const s = (t - .3) / .7, eased = s * s * (3 - 2 * s);
        this.lid.getTransform().setWorldPosition(vec3.lerp(sideAtRim, destination, eased));
      }
      if (t >= 1) this.slideFrom = null;
    }
    // Leaving changes the learner's location, not the fire. Keep the hazard alive outside.
    const hazardPresent = this.state && this.state.phase !== "ready" && this.state.fire !== "contained";
    const panFlames = hazardPresent && this.state?.fire !== "covered_hot";
    for (let i = 0; i < this.fireParts.length; i++) {
      this.fireParts[i].enabled = panFlames;
      const pulse = .86 + .14 * Math.sin(getTime() * this.flickerSpeed * 5 + i * 1.7);
      this.fireParts[i].getTransform().setLocalScale(new vec3(.85 + .1 * Math.sin(getTime() * 3 + i), pulse, .86));
    }
    for (let i = 0; i < this.spreadParts.length; i++) {
      this.spreadParts[i].enabled = hazardPresent && this.state?.fire === "beyond_pan";
      this.spreadParts[i].getTransform().setLocalScale(new vec3(1, .9 + .13 * Math.sin(getTime() * 6 + i), 1));
    }
    const off = this.state && !this.state.heatOn;
    const mount = quat.angleAxis(Math.PI / 2, vec3.right());
    const dial = quat.angleAxis(off ? Math.PI / 2 : 0, vec3.up());
    this.knobVisual.getTransform().setLocalRotation(mount.multiply(dial));
  }
}
