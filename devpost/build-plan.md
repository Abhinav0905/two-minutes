# Two Minutes build plan

Experience tier: interactive. The state machine in `Assets/Scripts/TwoMinutesState.ts` owns every decision. The scene and UI display that state and send actions back to it.

## Scene and asset choices

- KitchenRig: a deliberately stylised, articulated cooktop with a smooth lathed pan, a side-sliding lid and a rotating front burner knob. Code-authored MeshBuilder geometry through Snap's CLAD mesh-builder-scripting skill. The lid and knob animate independently.
- FlameRig: animated MeshBuilder flame ribbons. Pale cores and amber outer ribbons. This is an authored hazard cue, not a combustion model.
- ExitRig: an articulated door frame, hinged door and a small directional arrow. A virtual exit region is explicit in the scene. It does not inspect the real room.
- StartDebriefUI: UIKit BackPlate, FlexLayout and large UIKit buttons. Select either scenario, read the debrief and restart.
- ObjectFeedbackUI: a compact UIKit surface near the cooktop. It shows only the current feedback and an on-demand hint.
- All labels and buttons live in UI modules. The controller holds no hand-authored text components.
- Audio: Alarm, LidSlide, ControlTap, ExitCue and Caution, generated with CLAD build-sfx. No background music for this practice utility.
- No external images or generated 3D model service is required by this chosen art direction.

## Authored roots

TwoMinutes
- MainController
- KitchenRig
  - CooktopAnchor
  - PanAnchor
  - LidRestAnchor
  - LidClosedAnchor
  - BurnerAnchor
  - FlameRig
- ExitRig
  - DoorAnchor
  - ExitRegion
  - OutsideAnchor
  - ExitDirectionCue
- StartDebriefUI
- ObjectFeedbackUI
- AudioRig

The bootstrap creates these semantic roots in the editor. Mesh scripts generate only geometry beneath them. All positions use centimetres. The brief starts with the kitchen 110 cm ahead and the work surface below eye level. The measured preview adjustments are recorded below.

## Adjustments after viewing the preview

- KitchenRig now sits 130 cm ahead, 20 cm beyond the brief's default. The worktop stays 90 cm above the authored floor. This lets the pan, lid and front burner control fit together in the downward preview view.
- Active feedback sits above and to the right of the cooktop. Its default actions are **Leave now** and **Hint + practice controls**.
- The optional controls replace feedback in the same area. They offer the lid and heat actions plus **Leave now**. Water remains a direct interaction with the virtual glass.
- The left direction cue appears only during the active drill. It stays out of the intro and debrief.
- The demonstrated interactive environment is Evening Room. Real-glasses visibility remains unproven.

## Verification boundaries

1. Node tests establish the portable state transitions.
2. Lens Studio compilation must establish that runtime scripts use the installed API and package versions correctly.
3. LEAF must establish that the SIK interactions drive the expected state and debrief.
4. Preview screenshots must establish the layout, readable labels and visible objects.
5. Real glasses and a fire educator remain outside the evidence gathered here unless tested later.

These checks must be reported separately. A passing Node suite is not a passing Lens.
