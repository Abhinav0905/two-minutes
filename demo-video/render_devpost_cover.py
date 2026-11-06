"""Render a 3:2 Devpost cover with room around all text and the native frame."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FRAME = ROOT / "devpost/screenshots/02-small-pan-fire.png"
TARGET = ROOT / "devpost/screenshots/00-devpost-cover.jpg"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"


def render():
    (ROOT / "artifacts/media").mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (1500, 1000), "#10191f")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 14, 1000), fill="#74e5b8")
    draw.text((100, 94), "TWO MINUTES", font=ImageFont.truetype(BOLD, 42), fill="#74e5b8")
    for y, text in [(243, "Know when"), (365, "to leave.")]:
        face = ImageFont.truetype(BOLD, 108)
        assert 94 + draw.textlength(text, font=face) < 740
        draw.text((94, y), text, font=face, fill="#f4f6f5")
    for y, text in [(539, "Kitchen fire practice"), (589, "for SPECS.")]:
        draw.text((100, y), text, font=ImageFont.truetype(REGULAR, 38), fill="#a6b8be")
    draw.rounded_rectangle((100, 742, 680, 826), radius=14, fill="#24483e")
    draw.text((124, 766), "Two scenarios. One decision.", font=ImageFont.truetype(BOLD, 32), fill="#74e5b8")
    native = Image.open(FRAME).convert("RGB")
    native.thumbnail((630, 650), Image.Resampling.LANCZOS)
    image.paste(native, (780 + (630-native.width)//2, (1000-native.height)//2))
    draw.text((780, 848), "LENS STUDIO PREVIEW", font=ImageFont.truetype(BOLD, 24), fill="#a6b8be")
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    image.save(TARGET, quality=95)
    preview = image.copy()
    preview.thumbnail((300, 200), Image.Resampling.LANCZOS)
    preview.save(ROOT / "artifacts/media/devpost-card-check.jpg", quality=95)
    print(f"Saved 1500 x 1000 cover: {TARGET}")


if __name__ == "__main__":
    render()
