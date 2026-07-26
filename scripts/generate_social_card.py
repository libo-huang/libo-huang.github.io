#!/usr/bin/env python3
"""Generate the deterministic Open Graph card from existing site assets."""

from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "utils" / "social-card.png"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


canvas = Image.new("RGB", (1200, 630), "#0f172a")
draw = ImageDraw.Draw(canvas)

top = (15, 23, 42)
bottom = (17, 45, 78)
for y in range(canvas.height):
    ratio = y / (canvas.height - 1)
    color = tuple(round(top[i] * (1 - ratio) + bottom[i] * ratio) for i in range(3))
    draw.line((0, y, canvas.width, y), fill=color)

draw.ellipse((-180, 360, 430, 970), fill=(18, 58, 99))
draw.ellipse((820, -280, 1440, 340), fill=(21, 64, 108))
draw.rounded_rectangle((55, 50, 1145, 580), radius=28, outline=(71, 85, 105), width=2)
draw.rectangle((82, 96, 90, 250), fill=(96, 165, 250))

draw.text((120, 92), "Libo Huang", font=font(66, True), fill="#f8fafc")
draw.text((122, 180), "Assistant Researcher", font=font(30, True), fill="#93c5fd")
draw.text((122, 232), "Institute of Computing Technology", font=font(25), fill="#e2e8f0")
draw.text((122, 271), "Chinese Academy of Sciences", font=font(25), fill="#e2e8f0")
draw.text((122, 348), "Continual Learning  ·  Machine Learning", font=font(22), fill="#cbd5e1")
draw.text((122, 385), "Deep Learning  ·  Causal Learning", font=font(22), fill="#cbd5e1")
draw.text((122, 513), "libo-huang.github.io", font=font(22, True), fill="#bfdbfe")

avatar = Image.open(ROOT / "utils" / "libo-huang.png").convert("RGBA")
side = min(avatar.size)
left = (avatar.width - side) // 2
top_crop = max(0, (avatar.height - side) // 2 - 8)
avatar = avatar.crop((left, top_crop, left + side, top_crop + side)).resize((330, 330), Image.Resampling.LANCZOS)
mask = Image.new("L", avatar.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, 329, 329), fill=255)
mask = ImageChops.multiply(mask, avatar.getchannel("A"))
border = Image.new("RGBA", (350, 350), (0, 0, 0, 0))
ImageDraw.Draw(border).ellipse((0, 0, 349, 349), fill=(147, 197, 253, 255))
canvas.paste(border, (790, 140), border)
canvas.paste(avatar, (800, 150), mask)

canvas.save(OUTPUT, optimize=True)
print(OUTPUT)
