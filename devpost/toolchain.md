# Toolchain and attribution

Started November 6, 2026 for [Learn AR with SPECS](https://learn-specs.devpost.com/). The project remains local until the owner approves publication.

## Planning

The approved brief is in [design-brief.md](design-brief.md). It uses the Devpost Learn `plan-lens` skill, its AR design references and its design-brief template. The user had already approved the revised kitchen-fire drill before the native build began.

Source: [challengepost/learn-specs](https://github.com/challengepost/learn-specs), commit `5d8bc0800346d38e468c29b15afcb7ca92280005`. The skill and repository license are preserved in `devpost/planning-skill/`.

## Native build

- Lens Studio 5.23.2 for Apple silicon, downloaded from Snap's official site. The owner approved its license and installation. The application code signature passed verification.
- Snap CLAD plugin, installed through the official `ls-extensions` marketplace. Source: [lens-studio-devs/ls-extensions](https://github.com/lens-studio-devs/ls-extensions), commit `8adedd5d5b93f9dbe55f31c6be4264a4f8a608b3`.
- CLAD procedures used for routing, project setup, MeshBuilder geometry, UIKit construction, sound generation, scene construction and validation.
- Lens Studio MCP runs on the local Mac. `scripts/lens-mcp.mjs` uses the official Model Context Protocol SDK and Lens Studio's generated connection configuration. It lists tool schemas, calls the advertised tools and saves returned screenshots.
- Node.js 25.2.1 was used for the local tests and MCP bridge. npm dependencies are pinned in `package-lock.json`.

The saved native packages use SIK 0.18.0, the base template's UIKit, LEAF 2.0.2 and AI Preview Inspect/Interact 2.0.1. These versions retain the `SpectaclesInteractionKit` and `SpectaclesUIKit` package names used by this project. No vendor source was patched.

The generated `.mcp.json` includes a local authorization token. It is ignored by Git, along with editor caches, local preferences, lock files and the generated debug signing key. A fresh Lens Studio session generates its own connection configuration.

## Pre-existing code and assets

The scene starts from Snap's [Specs Base Template](https://github.com/specs-devs/samples/tree/main/Specs%20Base%20Template), source commit `110a145b6572a17fa94d86f18b76047278014729`.

This includes camera/render setup, lighting, the Echopark environment asset, the SIK prefab and standard Snap SIK/UIKit packages. Their existing code and assets are disclosed here. The sample license is preserved in `SPECS-SAMPLE-LICENSE.md`; package licenses and terms remain with their packages.

The project adds its own kitchen-fire state machine, tests, authored scene roots, procedural geometry, interaction logic, UI and sound cues. It does not claim authorship of Snap's packages or template.

The MeshBuilder vertex-color material comes from CLAD's `SimpleVertexBaseColor.lspkg` and is imported through Lens Studio's package tool. Its stable material ID is `70d03593-c7b4-410a-ae5c-75cb82ee32dc`.

## Sound

`tempAssetGen/gen_sfx_twominutes.cjs` generates five WAV files with CLAD's `build-sfx` utilities. Settings and output paths are in `Assets/GeneratedSFX/manifest.json`.

The alarm is an authored drill cue, not a certified alarm recording. No background music or third-party music is used.

## Evidence boundaries

The state tests, native compile, runtime interactions, LEAF runs and screenshots each answer different questions. See [native-validation.md](native-validation.md) for the actual results. Real glasses comfort, hand tracking in a home and teaching effectiveness have not been established.
