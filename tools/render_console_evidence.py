from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"D:\git clone\Sistema Gis")
EVIDENCE_DIR = ROOT / "docs" / "reportes" / "evidencias" / "fase-25"
LOGS = [
    "backend-tests.txt",
    "dashboard-tests.txt",
    "mobile-tests.txt",
    "python-spatial-tests.txt",
    "dashboard-build.txt",
    "mobile-build.txt",
    "db-verify-spatial.txt",
    "spatial-endpoints-live.json",
]


def load_font(size=18):
    for candidate in [
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\lucon.ttf",
        r"C:\Windows\Fonts\cour.ttf",
    ]:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def sanitize(text):
    return text.replace("\x1b[2K", "").replace("\x1b[0m", "").replace("\x1b[32m", "")


def render_log(log_path):
    title = log_path.name
    raw = log_path.read_bytes()
    for encoding in ("utf-8-sig", "utf-16", "cp1252"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeError:
            continue
    else:
        text = raw.decode("utf-8", errors="ignore")
    text = sanitize(text)

    font = load_font(18)
    title_font = load_font(22)
    margin = 28
    line_height = 26
    max_chars = 118
    wrapped = []
    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        while len(line) > max_chars:
            wrapped.append(line[:max_chars])
            line = line[max_chars:]
        wrapped.append(line)
    wrapped = wrapped[:160]

    width = 1500
    height = max(220, margin * 2 + 42 + len(wrapped) * line_height)
    image = Image.new("RGB", (width, height), "#111827")
    draw = ImageDraw.Draw(image)
    draw.text((margin, margin), title, fill="#e5e7eb", font=title_font)
    y = margin + 42
    for line in wrapped:
        draw.text((margin, y), line, fill="#d1d5db", font=font)
        y += line_height

    out_path = log_path.with_suffix(".png")
    image.save(out_path)
    return out_path


def main():
    outputs = []
    for name in LOGS:
        path = EVIDENCE_DIR / name
        if path.exists():
            outputs.append(render_log(path))
    print(f"Rendered {len(outputs)} console evidence images.")
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
