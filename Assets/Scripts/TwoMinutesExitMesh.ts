/** Virtual exit and hinged door. Authored position is a practice area, never a real route. */
import {TwoMinutesMesh} from "./TwoMinutesMesh";

@component
export class TwoMinutesExitMesh extends BaseScriptComponent {
  @ui.label("Two Minutes | practice exit")
  @ui.group_start("References")
  @input @hint("Vertex-color material") material!: Material;
  @input @hint("Authored frame root") frame!: SceneObject;
  @input @hint("Authored hinge anchor") doorHinge!: SceneObject;
  @input @hint("Authored direction-arrow anchor") arrow!: SceneObject;
  @ui.group_end
  private doorVisual!: SceneObject;
  private closed = false;
  private angle = .95;

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      if (!this.material || !this.frame || !this.doorHinge || !this.arrow) { print("TwoMinutesExitMesh: missing references"); return; }
      new TwoMinutesMesh().box([-43, 100, 0], [6, 200, 8], [.4, .94, .75, 1])
        .box([43, 100, 0], [6, 200, 8], [.4, .94, .75, 1])
        .box([0, 200, 0], [92, 6, 8], [.4, .94, .75, 1])
        .box([0, 1, 0], [84, 2, 30], [.4, .94, .75, 1]).attach(this.frame, "PracticeExitFrameMesh", this.material);
      this.doorVisual = new TwoMinutesMesh().box([40, 98, 0], [78, 194, 3], [.29, .58, .58, 1])
        .box([69, 100, 3], [8, 2, 3], [1, .89, .49, 1]).attach(this.doorHinge, "HingedDoorMesh", this.material);
      new TwoMinutesMesh().box([0, 0, 0], [10, 1.4, .7], [.45, 1, .77, 1])
        .attach(this.arrow, "ExitDirectionMesh", this.material);
      [-1, 1].forEach(sign => {
        const leaf = new TwoMinutesMesh().box([0, 0, 0], [5.5, 1.4, .7], [.45, 1, .77, 1])
          .attach(this.arrow, "ExitChevron_" + sign, this.material);
        leaf.getTransform().setLocalPosition(new vec3(-3.5, sign * 1.7, 0));
        leaf.getTransform().setLocalRotation(quat.angleAxis(sign * Math.PI / 4, vec3.forward()));
      });
    });
    this.createEvent("UpdateEvent").bind(() => {
      if (!this.doorVisual) return;
      const target = this.closed ? 0 : .95;
      this.angle += (target - this.angle) * Math.min(1, getDeltaTime() * 6);
      this.doorVisual.getTransform().setLocalRotation(quat.angleAxis(this.angle, vec3.up()));
    });
  }
  setClosed(closed: boolean): void { this.closed = closed; }
  setActive(active: boolean): void { if (this.arrow) this.arrow.enabled = active; }
}
