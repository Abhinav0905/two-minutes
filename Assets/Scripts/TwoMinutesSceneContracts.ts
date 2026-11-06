/** Stable scene and asset names for editor inspection and future edits.
 * Runtime requireAsset calls use literals as required by the Lens compiler.
 * scripts/bootstrap-lens.mjs owns the two editor bootstrap instructions. */
export const TWO_MINUTES_SCENE = {
  root: "TwoMinutes", main: "MainController", kitchen: "KitchenRig", exit: "ExitRig",
  pan: "PanAnchor", lid: "LidAnchor", lidRest: "LidRestAnchor", lidClosed: "LidClosedAnchor",
  burner: "BurnerAnchor", water: "WaterAnchor", flames: "FlameRig", exitRegion: "ExitRegion",
  startPanel: "StartDebriefUI", feedbackPanel: "ObjectFeedbackUI", controlsPanel: "PracticeControlsUI",
  exitPanel: "ExitUI", audio: "AudioRig", leaf: "TwoMinutesLEAF"
};
export const TWO_MINUTES_ASSETS = {
  vertexColorMaterial: "70d03593-c7b4-410a-ae5c-75cb82ee32dc",
  audio: ["GeneratedSFX/Alarm.wav", "GeneratedSFX/LidSlide.wav", "GeneratedSFX/ControlTap.wav", "GeneratedSFX/ExitCue.wav", "GeneratedSFX/Caution.wav"]
};
