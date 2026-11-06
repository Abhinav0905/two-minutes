"""Check generated speech against the script with an independent local recognizer."""
from pathlib import Path
import difflib
import json
import re
import subprocess
import numpy as np
import soundfile as sf
import imageio_ffmpeg
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "artifacts/media"
plan = json.loads((ROOT / "demo-video/narration.json").read_text())
expected = " ".join(sentence for scene in plan["scenes"] for sentence in scene["sentences"])
model = WhisperModel("base.en", device="cpu", compute_type="int8", cpu_threads=4, download_root="/tmp/two-minutes-asr-models")
decoded = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-i", str(MEDIA / "narration.wav"), "-f", "f32le", "-ar", "16000", "-ac", "1", "pipe:1"], capture_output=True, check=True)
speech = np.frombuffer(decoded.stdout, dtype=np.float32)
segments, info = model.transcribe(speech, language="en", beam_size=5, word_timestamps=True)
rows = [{"start":s.start, "end":s.end, "text":s.text} for s in segments]
actual = " ".join(row["text"].strip() for row in rows)
def tokens(text):
    text = text.lower().replace("twenty-three", "23").replace("twenty three", "23").replace("sick", "sik").replace("ui kit", "uikit")
    return re.findall(r"[a-z0-9]+", text)
match = difflib.SequenceMatcher(None, tokens(expected), tokens(actual))
audio, rate = sf.read(MEDIA / "narration.wav")
result = {"recognizer":"faster-whisper/base.en", "language":info.language, "durationSeconds":len(audio)/rate, "peak":float(np.max(np.abs(audio))), "rms":float(np.sqrt(np.mean(audio**2))), "scriptMatch":match.ratio(), "expectedWords":len(tokens(expected)), "recognizedWords":len(tokens(actual)), "transcript":actual, "segments":rows, "status":"passed" if match.ratio()>.86 and np.isfinite(audio).all() and np.max(np.abs(audio))<1 else "review_required"}
(MEDIA / "audio-verification.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps({k:v for k,v in result.items() if k not in ["transcript","segments"]}),flush=True)
