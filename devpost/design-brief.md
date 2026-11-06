---
status: approved
name: "Two Minutes: Know When to Leave"
planning_method: "Devpost Learn plan-lens skill and template, using decisions already made in this conversation"
scope_approval: "User instructed: Okay, then in that case, build it. Build it, and then let me know what to do next."
---

# Design brief: Two Minutes

## The one spatial moment
A learner notices a virtual kitchen fire and decides whether to attempt the illustrated small-pan containment procedure or leave. In a second authored scenario, the fire is already beyond the pan and the learner must leave. Leaving is available throughout and counts as a valid outcome.

## Why it belongs on glasses
- Uses: draws in the world, leaves the learner's hands available and keeps their attention on the scene.
- The pan, lid, burner control and exit occupy different physical positions. The learner turns toward the action instead of switching between instructions on a phone.
- Actual kitchen alignment and comfort on glasses remain unproven. The submitted prototype uses a simulated kitchen.

## Product or overlay
- Type: product. The virtual fire and the choices are the drill.
- What the real version would sense: standard SIK interactions and the user's position. No object recognition, live camera capture or persistent room map.
- Stand-in for the preview: a virtual cooktop and an explicitly authored exit. This is not a live emergency route finder.

## Where things live
- The user starts looking toward the cooktop.
- Cooktop: 70 cm wide, surface 90 cm above floor, 110 cm ahead (default).
- Pan: 28 cm diameter on the front burner (default).
- Lid: 30 cm diameter on the near-right work surface, reachable without reaching across the pan (default).
- Burner control: on the front edge of the cooktop, not behind the flame (default).
- Exit: 160 cm left of the cooktop and slightly forward of the learner, within the authored clear floor area (default). A small directional cue appears when it is offscreen.
- Feedback: next to the relevant object, about 110 cm from the viewer (default). Start and debrief use compact UIKit panels.
- The fire is bright amber with a pale core. No opaque black smoke or mandatory crouching.

## Hands and input
- Start: pinch a large UIKit button.
- Cover: grab the virtual lid and slide it horizontally over the pan. Include an accessible UIKit action that performs the same short side-sliding motion.
- Heat off: pinch the front burner control.
- Water: pinch the virtual water glass. Show a brief, restrained authored consequence and explain why water can spread burning oil. No explosion reward.
- Pan: pressing it explains not to move a burning pan. The pan itself cannot be grabbed or carried.
- Leave: pinch the exit affordance or enter the authored exit region. It never requires completing another step.
- Outside: optional safe door-closing action and a clearly simulated call-for-help button. No real calls occur.
- Targets are big and highlight when aimed at. No voice dependency or custom gestures.

## When things show
- Start panel recedes when the drill starts. A small Practice Drill marker remains.
- Show brief feedback after an action. Offer a hint on demand rather than automatically identifying the correct choice.
- A spatial alarm and a small arrow direct attention to an offscreen hazard or exit.
- The debrief explains the decision and its consequence. It has no speed leaderboard or readiness certification.
- Two Minutes names a short drill, not a guaranteed safe time to escape. Never show a safe-time countdown.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Both authored scenarios start, reset and finish independently.
2. Leaving immediately is accepted in both scenarios and the learner can complete the outside call-for-help action.
3. In the contained scenario, covering plus safely switching off the heat ends in containment. It never forces the fire to spread afterward.
4. Water triggers feedback and the authored evacuation branch. The exit remains available.
5. In the spreading scenario, lid and burner attempts do not solve the fire and the learner is directed to leave.
6. The debrief reports actual actions, including a safe recovery after a mistake, and reset clears the previous attempt.

## Out of scope
- Live fire detection, personalised evacuation routing, smoke or toxicity prediction, physical extinguisher operation, persistent home maps, multiplayer and claims of proven training effectiveness.

## Risks and open questions
- Logic tests do not establish teaching effectiveness. Two fresh viewers should explain the different decisions after trying the prototype.
- Real hand tracking, additive-display visibility and comfort over time are feel unproven.
- The safety script is based on CPSC, NFPA and USFA material. No fire educator has reviewed this implementation yet.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.
1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
