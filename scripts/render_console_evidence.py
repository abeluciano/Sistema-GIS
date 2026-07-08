from pathlib import Path
import re
import sys

from PIL import Image, ImageDraw, ImageFont


ANSI = re.compile(r"\x1b\[[0-9;]*m")
WIDTH = 1500
PADDING = 38
HEADER_HEIGHT = 72
LINE_HEIGHT = 25
MAX_CHARS = 108


def wrap_line(line: str) -> list[str]:
    if not line:
        return [""]
    return [line[index:index + MAX_CHARS] for index in range(0, len(line), MAX_CHARS)]


def render(source: Path, output: Path, title: str) -> None:
    source_bytes = source.read_bytes()
    encoding = "utf-16" if source_bytes.startswith((b"\xff\xfe", b"\xfe\xff")) else "utf-8"
    raw = ANSI.sub("", source_bytes.decode(encoding, errors="replace"))
    lines = []
    for source_line in raw.replace("\r", "").splitlines():
        lines.extend(wrap_line(source_line))

    font_path = Path("C:/Windows/Fonts/consola.ttf")
    bold_path = Path("C:/Windows/Fonts/consolab.ttf")
    font = ImageFont.truetype(str(font_path), 20)
    bold = ImageFont.truetype(str(bold_path), 22)
    height = HEADER_HEIGHT + (len(lines) * LINE_HEIGHT) + (PADDING * 2)

    image = Image.new("RGB", (WIDTH, height), "#0d1117")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, WIDTH, HEADER_HEIGHT), fill="#161b22")
    for index, color in enumerate(("#ff5f56", "#ffbd2e", "#27c93f")):
        x = PADDING + (index * 30)
        draw.ellipse((x, 24, x + 16, 40), fill=color)
    draw.text((145, 19), title, font=bold, fill="#e6edf3")

    y = HEADER_HEIGHT + PADDING
    for line in lines:
        color = "#7ee787" if "passed" in line.lower() or '"failed": 0' in line else "#c9d1d9"
        draw.text((PADDING, y), line, font=font, fill=color)
        y += LINE_HEIGHT

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, "PNG")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: render_console_evidence.py INPUT OUTPUT TITLE")
    render(Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3])
