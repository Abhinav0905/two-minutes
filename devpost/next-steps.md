# What to do next

## 1. Try the Lens yourself

Open `TwoMinutes.esproj` in Lens Studio. Use SPECS 27, Interactive Preview and Evening Room. Right-drag to look down at the cooktop, with the front knob in view, then try these three short runs:

1. Choose **Small pan fire**. Slide the lid from the side and turn off the front knob. Check that the debrief says to keep it covered.
2. Choose **Beyond the pan**. Use **Leave now**, then **Simulate calling for help**. The door step is optional when safe. Check that the outcome is evacuation.
3. Choose **Small pan fire** again. Select the virtual water glass, leave and call. Check that the debrief records both the mistake and the recovery.

Click acts as a pinch. For the lid, hold and drag it to the pan, then release. **Hint + practice controls** provides the equivalent lid and heat actions if you need them. Select the water glass directly for the mistake-and-recovery run. Use WASD to move, Q/E for height and right-drag to look around. The virtual exit is to the left of the cooktop.

If you move far from the starting area, reset the preview before the next take. No real pan, heat, oil or water is needed.

## 2. Get a fresh pair of eyes

Let someone try both scenarios without coaching. Ask them to explain when they would leave and why water is a bad choice. Write down what they did and any confusing wording. This is a quick usability check, not proof of training effectiveness. A fire educator's review remains a separate next step.

## 3. Watch the finished demo

[The narrated demo is public on YouTube](https://www.youtube.com/watch?v=WuJgiFBuOKA). The local export is `artifacts/media/TwoMinutes-demo.mp4`. It is 2:07.13; YouTube rounds this to 2:08. The video opens with the problem and solution, then shows containment, evacuation, water recovery, implementation and limits.

Narration uses Kokoro TTS's `af_heart` synthetic voice without cloning. The English captions were added separately. The production scripts and subtitle file are in `demo-video/`.

## 4. Publish the project when ready

The local project includes the Lens, source, tests, packages and `devpost/` documents. Publish this prepared source as a public GitHub, GitLab or Bitbucket repository and add its URL to the entry. This is a separate release decision.

Keep the generated local MCP configuration and debug signing key private. They are excluded by `.gitignore`.

## 5. Complete the Devpost entry

The [Devpost project](https://devpost.com/software/two-minutes-know-when-to-leave) has the problem-first write-up, public video, cover and four actual Preview screenshots. The project page is published. The Learn AR with SPECS entry is still a draft; no final submission was made.

Complete the required participant answers: submitter type, residence, eligibility attestations, prior Lens Studio experience and the experience/opinion survey. The technical-requirement answer can use [toolchain.md](toolchain.md). Review the finished entry, agree to the official rules and perform the final submission. Verify a **Submitted** receipt afterward.

The project is a preview-tested prototype. Device comfort and teaching effectiveness still need testing. The [native validation record](native-validation.md) describes the synthetic-input checks and the camera/doorway limitation.

The deadline is **November 9, 2026 at 2 PM Pacific**. The [official rules](https://learn-specs.devpost.com/rules) govern the entry.
