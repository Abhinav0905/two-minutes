# Build notes

## The idea we kept

The early concept was a kitchen-fire drill. AR fire training already exists, so putting flames in a room was not enough. The design focuses on a harder decision: recognizing when to stop intervening and leave.

That changed the design. There are two authored starting conditions. A fire confined to a pan permits the illustrated containment branch. A fire beyond the pan requires evacuation. Leaving is valid in both. A correctly contained fire never spreads just to force a dramatic ending.

We also removed a safe-time countdown, crouching or smoke-clearance scoring, extinguisher use and claims about a real escape route. Those features would need evidence and sensing that this prototype does not have.

## Planning and implementation

The Devpost Learn `plan-lens` template supplied the spatial brief and six done criteria. Development used CLAD, Lens Studio and the Lens Studio MCP. SIK handles interactions, UIKit handles the views and MeshBuilder creates the articulated geometry.

The implementation separates the decisions from their presentation. A portable state machine can be tested without Lens Studio. Native scripts render and animate that state, then send new actions back to it. Views hold no separate copy of the drill rules.

We deliberately chose procedural geometry for the articulated props. The lid needs to slide, the burner needs to turn and the flames need to change with the scenario. Geometry sits beneath named anchors in the authored scene, so a person can still move the kitchen and exit in the editor.

## What took work

- Lens Studio had to be installed on the Mac. The owner accepted Snap's terms and chose their account.
- The official starter template included Git LFS pointers. We fetched the three actual assets from Snap's official repository and checked their SHA-256 values against the pointers.
- The package install encountered a local certificate-chain issue. It was resolved with the Mac's trusted certificate bundle; TLS verification stayed enabled.
- The MCP tools were absent from the existing chat's registered tool list. A small client uses the official MCP SDK and Lens Studio's own generated endpoint and token. It calls the same advertised tools through the standard protocol.
- Browser sign-in reached an incomplete handoff before the native app received authorization. The final browser page reported successful authentication, the app showed My Lenses and the native authorization check returned true.

## Checks so far

The portable test suite passes 23 tests, including bounded checks across 33,476 choice prefixes. These establish decision rules, recovery paths and truthful debrief copy. Native checks and visual evidence are recorded separately in [native-validation.md](native-validation.md).

During geometry review, we caught a presentation error: the first draft hid the flames as soon as the learner left. Evacuation must not look as if it extinguished the fire. The native build review checks the hazard separately from the learner's phase.

The first actual preview also exposed a framing problem. The cooktop sat below a level camera, and the original narrow preview pane made the text hard to assess. We widened the panel, checked a downward view and moved feedback to the upper right. The demonstrated environment is Evening Room for contrast. Optional controls replace the feedback view and retain a leave action.

The recorded lid sequence revealed a duplicate manipulation-end callback. Disabling the completed manipulation could emit the event again. A state guard now records a single cover action. The native assertion checks the action count, and all seven preview cases passed after the change.

## What remains a research question

Passing the software checks does not prove that people learn the right action under stress. A fire educator should review the drill. Fresh viewers should try it without coaching and explain when they chose to leave. Real-glasses comfort and hand tracking also need device testing.
