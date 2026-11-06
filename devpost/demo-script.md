# Demo plan

Target length: 2 minutes 30 seconds. Record the actual Lens Studio preview. Every result in the video must come from the running Lens.

Keep the narration on the product, its design choices and demonstrated behavior. Name Devpost Learn, CLAD and Lens Studio where the event requires the toolchain.

## Opening line

"Would you try to put this out, or leave? Two Minutes is a SPECS kitchen-fire practice drill about that decision."

Start on the kitchen, with the small fire visible. Keep the pan, lid and front burner control in view. Avoid a long title animation before the working product.

## Shot list and narration

| Time | Screen action | Narration |
| --- | --- | --- |
| 0:00-0:12 | Show the kitchen and select the small-pan scenario. | "This first fire is confined to a pan. I can leave immediately. If I choose the illustrated containment procedure, the objects are where my hands need them." |
| 0:12-0:36 | Grab the lid, slide it from the side and release it over the pan. Turn the front burner control off. | "I slide the lid across from the side, then switch off the heat. The drill ends in containment. It doesn't force the fire to spread after a correct sequence. The debrief reminds me to keep the pan covered until fully cool." |
| 0:36-0:48 | Show the resulting debrief and reset. | "The debrief reports my decisions. There is no speed score. Leaving was also a valid choice." |
| 0:48-1:15 | Start the spreading-fire scenario. Turn toward the left exit and leave. | "Now the fire is already beyond the pan. Reaching for the lid or burner cannot solve it. I leave through the marked virtual exit." |
| 1:15-1:30 | Outside, close the door if safe, then use the simulated call button. Show the debrief. | "Outside, I can close the door when safe and call for help. The call is simulated. I stay out." |
| 1:30-1:52 | Reset to the small-pan scenario, choose water, then leave and call. | "A mistake has a consequence. Water changes the authored scenario and directs me to leave. I can still recover. The drill records the mistake and the safe next action." |
| 1:52-2:12 | Show a brief spatial pan of the kitchen and exit, then the design brief and native test results. | "We planned it with Devpost Learn and built it with CLAD through the Lens Studio MCP. SIK drives the interactions, UIKit handles the views and one state machine owns the decisions." |
| 2:12-2:30 | Return to a clean preview view. End on the project name. | "The prototype runs in Lens Studio without glasses. It uses a virtual kitchen and an authored exit. Real-glasses comfort and teaching effectiveness still need testing. Two Minutes names the drill, not a safe amount of time to stay in a fire." |

## Recording notes

- Use a large Preview panel and a quiet desktop. Keep account details and unrelated browser tabs out of frame.
- Show full actions and their results. If using cuts between scenarios, make each reset clear.
- Record the physical lid manipulation once. Use the UIKit equivalent only if needed for a second take.
- Capture the spreading-fire and water-recovery outcomes. A beauty shot alone cannot establish that they work.
- Keep drill audio low enough for speech. No extra music is needed.
- Never stage a real fire, heat a pan or pour water into oil for the video. Household objects are optional props, not part of the software test.

## Before recording

Run the native checks in [native-validation.md](native-validation.md). Replace any claim above that the finished build does not support. If lid manipulation, movement or a scenario fails, fix it before recording that take.

## After recording

Review the export from start to finish. Confirm it is under three minutes and that both scenarios, a reset and a debrief are readable. Publishing it publicly on YouTube and entering Devpost are separate owner decisions.
