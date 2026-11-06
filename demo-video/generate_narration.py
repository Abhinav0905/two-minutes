"""Local Kokoro af_heart narration and separately timed English captions."""
from pathlib import Path
import hashlib
import importlib.metadata
import json
import os
import textwrap

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts/media"
MODEL = Path(os.environ.get("TWOMINUTES_VOICE_MODELS", "/tmp/two-minutes-media-models"))
SOURCE = ROOT / "demo-video/narration.json"


def stamp(seconds: float) -> str:
    milliseconds = round(seconds * 1000)
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    secs, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{milliseconds:03}"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "voice").mkdir(exist_ok=True)
    plan = json.loads(SOURCE.read_text())
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 4
    opts.inter_op_num_threads = 1
    session = ort.InferenceSession(str(MODEL / "kokoro-v1.0.onnx"), sess_options=opts, providers=["CPUExecutionProvider"])
    synth = Kokoro.from_session(session, str(MODEL / "voices-v1.0.bin"))
    assert plan["voice"] in synth.voices, "The requested af_heart voice is unavailable"
    rate = 24_000
    position = 0
    chunks = []
    captions = []
    for scene in plan["scenes"]:
        scene["start"] = position / rate
        lead = np.zeros(round(rate * 0.30), dtype=np.float32)
        chunks.append(lead)
        position += len(lead)
        scene_audio = [lead]
        for index, sentence in enumerate(scene["sentences"]):
            samples, sample_rate = synth.create(sentence, voice=plan["voice"], speed=plan["speed"], lang=plan["language"])
            assert sample_rate == rate and len(samples) > rate * .3
            assert np.isfinite(samples).all()
            sf.write(OUT / "voice" / f"{scene['id']}-{index:02}.wav", samples, rate)
            start = position / rate
            chunks.append(samples)
            scene_audio.append(samples)
            position += len(samples)
            captions.append({"text": sentence, "startMs": round(start * 1000), "endMs": round(position / rate * 1000), "timestampMs": None, "confidence": None})
            pause = np.zeros(round(rate * .14), dtype=np.float32)
            chunks.append(pause)
            scene_audio.append(pause)
            position += len(pause)
        tail = np.zeros(round(rate * .55), dtype=np.float32)
        chunks.append(tail)
        scene_audio.append(tail)
        position += len(tail)
        scene["end"] = position / rate
        scene["duration"] = scene["end"] - scene["start"]
        sf.write(OUT / "voice" / f"{scene['id']}.wav", np.concatenate(scene_audio), rate)
        print(json.dumps({"scene": scene["id"], "seconds": round(scene["duration"], 2)}), flush=True)
    audio = np.concatenate(chunks)
    peak = float(np.max(np.abs(audio)))
    if peak > .95:
        audio *= .95 / peak
    sf.write(OUT / "narration.wav", audio, rate, subtype="PCM_16")
    (OUT / "timeline.json").write_text(json.dumps(plan, indent=2) + "\n")
    (OUT / "captions.json").write_text(json.dumps(captions, indent=2) + "\n")
    srt = []
    for index, caption in enumerate(captions, 1):
        srt.append(f"{index}\n{stamp(caption['startMs']/1000)} --> {stamp(caption['endMs']/1000)}\n" + "\n".join(textwrap.wrap(caption["text"], width=70)) + "\n")
    (OUT / "TwoMinutes-English.srt").write_text("\n".join(srt))
    receipt = {"engine": "kokoro-onnx", "version": importlib.metadata.version("kokoro-onnx"), "voice": plan["voice"], "syntheticVoice": True, "voiceCloning": False, "captionsAddedSeparately": True, "durationSeconds": len(audio)/rate, "sampleRate": rate, "captionCues": len(captions), "scriptSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "audioSha256": hashlib.sha256((OUT/"narration.wav").read_bytes()).hexdigest(), "status": "generated_pending_audiovisual_review"}
    (OUT / "voice-provenance.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt), flush=True)


if __name__ == "__main__":
    main()
