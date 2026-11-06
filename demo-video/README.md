# Demo production

The demo uses real recordings from Lens Studio's native Preview recorder. Explanatory cards and English captions sit around that footage. The 332-word narration uses Kokoro TTS `af_heart`, a synthetic voice without cloning.

- Video: https://www.youtube.com/watch?v=WuJgiFBuOKA
- Local export: `artifacts/media/TwoMinutes-demo.mp4`
- Format: 2560 x 1440, 30 fps, H.264/AAC, 127.13 seconds
- Captions: [TwoMinutes-English.srt](TwoMinutes-English.srt)
- Script: [narration.json](narration.json)
- YouTube description: [youtube-description.txt](youtube-description.txt)

## Reproduce the media

Use Python 3.12 and an isolated environment with [requirements.txt](requirements.txt). The generation script expects the official Kokoro ONNX model and voices file in `/tmp/two-minutes-media-models`, or the directory set by `TWOMINUTES_VOICE_MODELS`:

- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx
- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin

```sh
python generate_narration.py
python verify_audio.py
python render_demo.py
```

Run these from this directory or pass their paths from the project root. Generated media, models and raw takes are excluded from Git. The renderer uses imageio-ffmpeg's bundled FFmpeg and the Mac's Arial fonts. The edit uses narration only; the Lens itself retains its five local sound cues.

`capture-flows.mjs` calls the advertised local Lens Studio MCP tools through the official SDK. Lens Studio's native recorder is operated separately. The saved edit plan records each take, source interval and output duration. The unsuccessful exit-button take supplies only the visible spreading fire and turn toward the doorway. The evacuation result comes from a successful take through the equivalent visible Leave now control.

## Checks

The export decoded fully without an error. Frames were reviewed across all seven sections for composition, readable text and actual outcomes. An independent faster-whisper pass matched the narration script at 98.34% after normalizing number and acronym spellings. This is a transcript-match check, not a human listening assessment. Captions use the separately recorded synthesis timings.

The technical YouTube channel is Kumar Abhinav. The upload includes the supplied English subtitle track and custom cover. Copyright and Community Guidelines checks reported no issues. The synthetic narration is disclosed in the description and YouTube's AI-use setting.
