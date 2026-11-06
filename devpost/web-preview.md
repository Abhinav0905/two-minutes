# Browser companion

URL: https://abhinav0905.github.io/two-minutes/

Source: https://github.com/Abhinav0905/two-minutes

The site gives reviewers a way to try the decisions without opening Lens Studio. It is a browser companion, not the native SPECS runtime. That distinction appears above and below the interactive scene. The recorded native Lens demonstration is available on the same page.

`npm run web:build` compiles the existing `Assets/Scripts/TwoMinutesState.ts` into `docs/drill-engine.js`. It does not maintain another copy of the rules. `docs/build-info.json` records the source hash and the native-video hash. The remaining page code handles buttons, text and the illustrated kitchen.

## Checks

- The compiled browser engine completed containment, rejected containment after spread, leaving, water recovery and reset.
- The 23 portable tests and core type check passed with this build.
- Actual browser controls completed lid plus heat off, rejected lid/burner attempts after spread, virtual-exit selection, optional door closing, a simulated outside call and reset.
- Water selection produced an evacuation path. Calling without the optional door step completed the recovery debrief. Reset cleared the choices.
- The layout was reviewed at desktop width and with the narrow layout triggered at 250% browser zoom. The reminder control retains keyboard focus after its text changes.
- Local page assets resolved successfully. The embedded native MP4 played through the browser's media controls.

Native hand tracking and device comfort remain separate from these web checks.
