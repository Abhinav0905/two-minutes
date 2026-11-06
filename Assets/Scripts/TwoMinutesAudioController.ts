/** Owns five local SFX players. No microphone, networking or emergency calls. */
import {Action, DrillState} from "./TwoMinutesState";

const TRACKS = {
  alarm: requireAsset("../GeneratedSFX/Alarm.wav") as AudioTrackAsset,
  lid: requireAsset("../GeneratedSFX/LidSlide.wav") as AudioTrackAsset,
  tap: requireAsset("../GeneratedSFX/ControlTap.wav") as AudioTrackAsset,
  exit: requireAsset("../GeneratedSFX/ExitCue.wav") as AudioTrackAsset,
  caution: requireAsset("../GeneratedSFX/Caution.wav") as AudioTrackAsset
};
@component
export class TwoMinutesAudioController extends BaseScriptComponent {
  @ui.label("Two Minutes | drill sound")
  @ui.group_start("References")
  @input @hint("Authored alarm source near the cooktop") alarmSource!: SceneObject;
  @input @hint("Authored source for interaction cues") cueSource!: SceneObject;
  @ui.group_end
  @ui.group_start("Settings")
  @input @hint("Interaction cue volume") @widget(new SliderWidget(0, 1, .05)) cueVolume: number = .55;
  @input @hint("Practice alarm volume") @widget(new SliderWidget(0, 1, .05)) alarmVolume: number = .35;
  @ui.group_end
  private players: {[key: string]: AudioComponent} = {};

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      if (!this.alarmSource || !this.cueSource) { print("TwoMinutesAudioController: missing sources"); return; }
      Object.keys(TRACKS).forEach(key => {
        const source = global.scene.createSceneObject("TwoMinutesSound_" + key);
        source.setParent(key === "alarm" ? this.alarmSource : this.cueSource);
        const audio = source.createComponent("Component.AudioComponent") as AudioComponent;
        audio.audioTrack = TRACKS[key];
        audio.volume = key === "alarm" ? this.alarmVolume : this.cueVolume;
        audio.playbackMode = Audio.PlaybackMode.LowLatency;
        audio.mixToSnap = true;
        audio.spatialAudio.enabled = key === "alarm";
        if (key === "alarm") audio.spatialAudio.positionEffect.enabled = true;
        this.players[key] = audio;
      });
    });
  }
  start(): void { this.players.alarm?.play(-1); }
  stop(): void { Object.keys(this.players).forEach(key => this.players[key].stop(true)); }
  action(action: Action, state: DrillState): void {
    const key = state.feedback.tone === "caution" ? "caution" : action === "cover" ? "lid" : action === "leave" ? "exit" : "tap";
    this.players[key]?.play(1);
    if (state.phase !== "active") this.players.alarm?.stop(true);
  }
}
