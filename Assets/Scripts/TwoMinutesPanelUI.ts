/** Passive UIKit panel for start, contextual feedback, accessible controls and debrief.
 * Expects no domain state. setView supplies copy, onCommand reports user intent.
 * The reusable implementation is longer because it owns all layout and text construction. */
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign, FlexAlignSelf, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";

export interface PanelView {
  eyebrow: string; title: string; body: string; note?: string;
  buttons: {label: string; command: string}[];
}
type Role = "Headline" | "Body" | "Caption" | "Button";
const ROLES: Record<Role, {size: number; weight: number}> = {
  Headline: {size: 62, weight: 700}, Body: {size: 39, weight: 500},
  Caption: {size: 38, weight: 500}, Button: {size: 39, weight: 500}
};
function applyTextRole(text: Text, role: Role, scale: number): void {
  text.size = ROLES[role].size * scale;
  text.weight = ROLES[role].weight;
}

@component
export class TwoMinutesPanelUI extends BaseScriptComponent {
  @ui.label("Two Minutes | UIKit panel")
  @ui.group_start("Settings")
  @input @hint("Panel width in centimeters")
  @widget(new SliderWidget(18, 58, 1)) panelWidth: number = 46;
  @input @hint("Space for wrapped body text, in centimeters")
  @widget(new SliderWidget(2, 14, .5)) bodyHeight: number = 8;
  @input @hint("Inner panel padding in centimeters")
  @widget(new SliderWidget(.5, 4, .25)) padding: number = 2;
  @input @hint("Gap between layout rows in centimeters")
  @widget(new SliderWidget(.2, 2, .1)) rowGap: number = .8;
  @input @hint("Text scale relative to the Specs type scale at 110 cm")
  @widget(new SliderWidget(.8, 1.4, .05)) textScale: number = 1;
  @input("vec4", "{0.5,1,0.82,1}") @hint("Eyebrow and note accent color")
  @widget(new ColorWidget()) accent!: vec4;
  @ui.group_end

  private commandEvent = new Event<string>();
  readonly onCommand = this.commandEvent.publicApi();
  private plate!: BackPlate;
  private content!: SceneObject;
  private layout!: FlexLayout;
  private eyebrow!: Text;
  private titleText!: Text;
  private bodyText!: Text;
  private noteText!: Text;
  private noteObject!: SceneObject;
  private noteItem!: FlexItem;
  private buttonObjects: SceneObject[] = [];
  private buttonItems: FlexItem[] = [];
  private buttonTexts: Text[] = [];
  private model: PanelView | null = null;
  private dirty = true;
  private frameCount = 0;

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas");
    this.plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate;
    this.plate.style = "default";
    this.content = this.obj(this.sceneObject, this.sceneObject.name + "_Content", new vec3(0, 0, .6));
    this.layout = this.content.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    // Explicitly registered rows are allowed before OnStart only with discovery disabled.
    this.layout.autoDiscoverItemsOnStart = false;
    this.layout.onInitialized.add(() => {
      this.layout.width = this.panelWidth;
      this.layout.height = -1;
      this.layout.direction = FlexDirection.Column;
      this.layout.justifyContent = FlexJustify.Start;
      this.layout.alignItems = FlexAlign.Stretch;
      this.layout.rowGap = this.rowGap;
      this.layout.paddingTop = this.padding;
      this.layout.paddingBottom = this.padding;
      this.layout.paddingLeft = this.padding;
      this.layout.paddingRight = this.padding;
      this.dirty = true;
    });
    this.layout.onLayoutComplete.add(result => {
      this.plate.size = new vec2(result.containerWidth, result.containerHeight);
    });
    this.eyebrow = this.row("Eyebrow", 2, "Caption", this.accent);
    this.titleText = this.row("Title", 4, "Headline", new vec4(1, 1, 1, 1));
    this.bodyText = this.row("Body", this.bodyHeight, "Body", new vec4(.95, .97, 1, 1));
    this.noteText = this.row("Note", 3, "Caption", this.accent);
    this.noteObject = this.noteText.getSceneObject();
    this.noteItem = this.noteObject.getComponent(FlexItem.getTypeName()) as FlexItem;
    for (let i = 0; i < 3; i++) this.addButton(i);
    // Let UIKit's OnStart initialization finish before hiding optional surfaces.
    this.createEvent("UpdateEvent").bind(() => {
      this.frameCount++;
      if (this.frameCount > 1 && this.dirty) this.applyView();
    });
  }

  setView(model: PanelView | null): void {
    this.model = model;
    this.dirty = true;
    // Calls from Main still reach this passive view while its scene root is disabled.
    // Re-enable synchronously so a hidden view does not depend on its own Update event.
    if (this.frameCount > 1) this.applyView();
  }

  private applyView(): void {
    this.dirty = false;
    const visible = this.model !== null;
    // Hide the whole initialized subtree, including UIKit interaction-plane colliders.
    // Disabling only the backing script leaves an invisible ray obstruction.
    this.sceneObject.enabled = visible;
    if (!this.model) return;
    this.eyebrow.text = this.model.eyebrow;
    this.titleText.text = this.model.title;
    this.bodyText.text = this.model.body;
    this.noteText.text = this.model.note || "";
    this.layout.removeItems([this.noteItem, ...this.buttonItems]);
    this.noteObject.enabled = !!this.model.note;
    if (this.model.note) this.layout.addItems([this.noteItem]);
    for (let i = 0; i < 3; i++) {
      const data = this.model.buttons[i];
      this.buttonObjects[i].enabled = !!data;
      if (data) {
        this.buttonTexts[i].text = data.label;
        this.layout.addItems([this.buttonItems[i]]);
      }
    }
    this.layout.markDirty();
  }

  private row(name: string, height: number, role: Role, color: vec4): Text {
    const object = this.obj(this.content, this.sceneObject.name + "_" + name);
    const item = object.createComponent(FlexItem.getTypeName()) as FlexItem;
    item.overrideHeight = height;
    item.flexGrow = 0; item.flexShrink = 0; item.alignSelf = FlexAlignSelf.Stretch;
    const text = object.createComponent("Component.Text") as Text;
    text.layoutRect = Rect.create(-.5, .5, -.5, .5);
    text.horizontalAlignment = HorizontalAlignment.Left;
    text.verticalAlignment = VerticalAlignment.Center;
    text.horizontalOverflow = HorizontalOverflow.Wrap;
    text.verticalOverflow = VerticalOverflow.Overflow;
    text.depthTest = true;
    text.textFill.color = color;
    applyTextRole(text, role, this.textScale);
    this.layout.addItems([item]);
    return text;
  }

  private addButton(index: number): void {
    const suffix = ["Primary", "Secondary", "Tertiary"][index];
    const object = this.obj(this.content, this.sceneObject.name + "_" + suffix);
    const width = this.panelWidth - this.padding * 2;
    const button = object.createComponent(Button.getTypeName()) as Button;
    button.size = new vec3(width, 6, 1);
    button.setVariant({theme: "SnapOS3", shape: "Rectangle", style: index === 0 ? "Primary" : "Secondary"});
    button.onTriggerUp.add(() => {
      const command = this.model?.buttons[index]?.command;
      if (command) this.commandEvent.invoke(command);
    });
    const item = object.createComponent(FlexItem.getTypeName()) as FlexItem;
    item.overrideWidth = width; item.overrideHeight = 6;
    item.flexGrow = 0; item.flexShrink = 0;
    const labelObject = this.obj(object, this.sceneObject.name + "_" + suffix + "_Label", new vec3(0, 0, .08));
    const text = labelObject.createComponent("Component.Text") as Text;
    text.layoutRect = Rect.create(-(width - 1) / 2, (width - 1) / 2, -2, 2);
    text.horizontalAlignment = HorizontalAlignment.Center;
    text.verticalAlignment = VerticalAlignment.Center;
    text.horizontalOverflow = HorizontalOverflow.Wrap;
    text.depthTest = true; text.textFill.color = new vec4(1, 1, 1, 1);
    applyTextRole(text, "Button", this.textScale);
    const textItem = labelObject.createComponent(FlexItem.getTypeName()) as FlexItem;
    textItem.overrideWidth = width - 1; textItem.overrideHeight = 4;
    this.buttonObjects.push(object); this.buttonItems.push(item); this.buttonTexts.push(text);
    this.layout.addItems([item]);
  }

  private obj(parent: SceneObject, name: string, position?: vec3): SceneObject {
    const object = global.scene.createSceneObject(name);
    object.setParent(parent);
    if (position) object.getTransform().setLocalPosition(position);
    return object;
  }
}
