# Native build verification

Verified locally on November 6, 2026 in Lens Studio 5.23.2. The saved Lens name is **Two Minutes**. The project is `TwoMinutes.esproj`.

The native Lens is built, saved and running. This report covers Preview evidence. No physical Specs device was available.

## Checks and evidence

- Native TypeScript compilation succeeded: [compile.json](validation/compile.json).
- Lens startup reached `TwoMinutes: ready`. No Lens runtime error was reported. The editor's LEAF plugin emitted one state-save warning during its reset lifecycle; it is preserved in [startup.json](validation/startup.json).
- All seven LEAF cases succeeded after the panel-visibility fix and again after the completed-lid manipulation guard. [Results](validation/leaf-results.json) and earlier matching [Lens-side PASSED lines](validation/leaf-passed.txt) are saved.
- The LEAF tap helper rejects disabled targets and disabled ancestors. The spreading case leaves through the visible controls panel.
- A PreviewInteractTool ray flow also completed start, visible controls, lid slide and burner operation. [Containment interaction](validation/real-interaction-containment-final.json).
- A second ray flow selected water, left, closed the door and completed the simulated outside call. [Water action](validation/real-interaction-water-start.json), [outside actions](validation/real-interaction-water-finish.json).
- Moving the preview camera through the authored exit region changed the live title to `You're outside`. [Observed region](validation/exit-region-target.json), [result](validation/exit-region-result.json).
- The portable tests passed 23/23, including 33,476 action prefixes and bounded debrief text. Core TypeScript checking passed.

## Done-criteria coverage

| Criterion | Native case | Result |
| --- | --- | --- |
| Both scenarios start and reset | `two_minutes_reset`, `two_minutes_exit_both` | Passed |
| Immediate leaving is valid in both scenarios | `two_minutes_exit_both` | Passed |
| Lid plus heat off contains, without forced spread | `two_minutes_lid_drag_containment`, `two_minutes_accessible_containment` | Passed |
| Water enters evacuation and preserves exit | `two_minutes_water_recovery` | Passed |
| Spreading fire rejects lid/burner containment | `two_minutes_spreading_rejects_containment` | Passed |
| Debrief reports actions and reset clears flags | `two_minutes_water_recovery`, `two_minutes_reset` | Passed |
| Synthetic arm/head start and leave targeting | `two_minutes_ik_exit`, fail-fast diagnostics | Passed |

The IK result establishes the synthetic interaction flow. It does not establish physical arm reach, hand tracking or comfort on glasses. Far-field interaction is part of this layout.

Automated input came from LEAF and PreviewInteractTool's synthetic interactor. Human usability checks and physical-device tests remain future work.

## Independent final check

After the builder handed back the saved project, a fresh native compile succeeded and startup reached the ready state. An independent pointer-driven run selected the small-pan scenario, selected water, left, called for help and reset through the visible buttons. The live debrief recorded `water (rejected) > left > called outside` and included the burning-oil explanation. Skipping the optional door step did not block completion. The final interaction log tail had no errors, and the live title returned to `Know when to leave`.

Two fresh active-preview captures were reviewed at different timestamps. The flame shapes changed while the pan, lid, front knob and labels remained in frame.

Recording exposed a duplicate lid-end callback when completed manipulation was disabled. The controller now ignores a manipulation-end event after the lid is already on. The native containment assertion checks that only one cover action is recorded. All seven native cases passed again. The new containment recording's live debrief reads `lid > heat off`.

The recorded spreading-fire run completed `left > door > called outside`. The recorded water run completed `water (rejected) > left > called outside`.

The preview camera can stop inside the door mesh during region traversal and obscure the outside panel until the camera continues through. Synthetic targeting after a large spectator-camera turn also timed out. The demo turns toward the marked exit, returns to the equivalent visible Leave now control and completes the outside actions there. Region state transition and fully turned hand targeting are separate checks; the latter remains a preview limitation to investigate on physical glasses.

## Visual checks

The four [screenshots](screenshots/) are actual Preview captures. They show the start, active drill, containment and recovery after water. The active capture includes the entire lid, pan, front burner knob and left-pointing cue. Both debriefs were inspected for readable text and clipping. The containment capture was refreshed after the knob fix; its face stays circular and its amber indicator turns within the face.

The kitchen was also inspected from [isometric](validation/mesh-isometric.jpg) and [right](validation/mesh-right.jpg) angles. [Live mesh bounds](validation/mesh-bounds.json) establish a 76 x 90 x 52 cm cooktop assembly, with its feet at the authored floor. The burner ring is aligned under the pan. The accessible lid action lifts at the side before its horizontal slide.

The cooktop moved from the brief's 110 cm default to **130 cm ahead** so the lid and front knob fit together. The current preview uses Evening Room, SPECS 27 and a view aimed at `(0, -50, -130)`. A user can look down to the work surface. The exit is explicitly virtual and sits to the left.

Flame transforms differ between [sample A](validation/flame-frame-a.json) and [sample B](validation/flame-frame-b.json), and the animation was visible in the captures. Leaving does not extinguish the authored hazard. The five local audio tracks are wired; the alarm has a spatial source and listener. Sound quality has not been independently auditioned.

## Toolchain and limits

SIK reports 0.18.0. UIKit is the official base-template package. LEAF 2.0.2 and AI Preview Inspect/Interact 2.0.1 match these package names. Newer v4 testing packages require renamed `InteractionKit`/`UIKit` imports and were replaced with the compatible official releases. No vendor package source was patched.

No fire educator or participant study has assessed the Lens. Real glasses, additive-display visibility over time and teaching effectiveness remain unproven. The build makes no live fire-detection, real routing or readiness-certification claim. Publication and entry status are tracked separately from native validation.
