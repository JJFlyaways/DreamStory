from __future__ import annotations

import os
import re
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "final" / "source"
FONT_PATH = Path(
    os.environ.get("DREAMSTORY_LOGO_FONT", "/usr/share/fonts/truetype/noto/NotoSerif-SemiBold.ttf")
)

INK = "#10232B"
INK_SOFT = "#18333D"
TEAL = "#6BC8C1"
PAPER = "#F7F5EE"
BLACK = "#000000"
WHITE = "#FFFFFF"


font = TTFont(str(FONT_PATH))
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
metrics = font["hmtx"].metrics


def wordmark_path(*, x: float, baseline: float, scale: float) -> str:
    pen = SVGPathPen(glyph_set)
    cursor = x
    for character in "DreamStory":
        glyph_name = cmap[ord(character)]
        glyph_set[glyph_name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
        cursor += metrics[glyph_name][0] * scale
    commands = pen.getCommands()
    return re.sub(
        r"-?\d+\.\d+",
        lambda match: f"{float(match.group()):.2f}".rstrip("0").rstrip("."),
        commands,
    )


def symbol_body(cover: str, spine: str, page: str, quote: str) -> str:
    return f"""
    <g id=\"symbol\">
      <path fill=\"{cover}\" d=\"M54 24H202A20 20 0 0 1 222 44V212A20 20 0 0 1 202 232H54A20 20 0 0 1 34 212V44A20 20 0 0 1 54 24Z\"/>
      <path fill=\"{spine}\" d=\"M34 24H68V232H34Z\"/>
      <path fill=\"{page}\" d=\"M86 48H194A8 8 0 0 1 202 56V200A8 8 0 0 1 194 208H86Z\"/>
      <path fill=\"{quote}\" d=\"M104 104C104 84 116 72 136 72V94C125 94 120 100 120 112V130H104Z\"/>
      <path fill=\"{quote}\" d=\"M148 104C148 84 160 72 180 72V94C169 94 164 100 164 112V130H148Z\"/>
    </g>
    """


def small_symbol_body(cover: str, spine: str, page: str, quote: str) -> str:
    return f"""
    <g id=\"symbol\">
      <path fill=\"{cover}\" d=\"M50 28H206A22 22 0 0 1 228 50V206A22 22 0 0 1 206 228H50A22 22 0 0 1 28 206V50A22 22 0 0 1 50 28Z\"/>
      <path fill=\"{spine}\" d=\"M28 28H62V228H28Z\"/>
      <path fill=\"{page}\" d=\"M82 56H196V200H82Z\"/>
      <path fill=\"{quote}\" d=\"M104 108C104 88 115 76 133 76V96C123 96 118 102 118 113V130H104Z\"/>
      <path fill=\"{quote}\" d=\"M145 108C145 88 156 76 174 76V96C164 96 159 102 159 113V130H145Z\"/>
    </g>
    """


def svg(title: str, view_box: str, body: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" aria-labelledby="title">
  <title id="title">{title}</title>
{body}
</svg>
'''


def write(name: str, content: str) -> None:
    path = SOURCE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


COLORS = {
    "color": (INK, INK_SOFT, PAPER, TEAL, INK),
    "black": (BLACK, BLACK, WHITE, BLACK, BLACK),
    "white": (WHITE, WHITE, INK, WHITE, WHITE),
    "teal": (TEAL, TEAL, WHITE, TEAL, TEAL),
    "dark": (PAPER, PAPER, INK, TEAL, PAPER),
}


def make_symbol(variant: str, small: bool = False) -> str:
    cover, spine, page, quote, _ = COLORS[variant]
    body = small_symbol_body(cover, spine, page, quote) if small else symbol_body(cover, spine, page, quote)
    suffix = " small" if small else ""
    return svg(f"DreamStory {variant}{suffix} symbol", "0 0 256 256", body)


def make_wordmark(variant: str) -> str:
    fill = COLORS[variant][4]
    body = f'<path id="wordmark" fill="{fill}" d="{wordmark_path(x=8, baseline=92, scale=0.1)}"/>'
    return svg(f"DreamStory {variant} wordmark", "0 0 620 120", body)


def make_horizontal(variant: str) -> str:
    cover, spine, page, quote, wordmark = COLORS[variant]
    body = symbol_body(cover, spine, page, quote)
    body += f'<path id="wordmark" fill="{wordmark}" d="{wordmark_path(x=300, baseline=172, scale=0.1)}"/>'
    return svg(f"DreamStory {variant} horizontal logo", "0 0 930 256", body)


def make_stacked(variant: str) -> str:
    cover, spine, page, quote, wordmark = COLORS[variant]
    body = f'<g transform="translate(152 8)">{symbol_body(cover, spine, page, quote)}</g>'
    body += f'<path id="wordmark" fill="{wordmark}" d="{wordmark_path(x=58, baseline=350, scale=0.075)}"/>'
    return svg(f"DreamStory {variant} stacked logo", "0 0 560 420", body)


def main() -> None:
    SOURCE.mkdir(parents=True, exist_ok=True)
    for variant in COLORS:
        write(f"dreamstory-symbol-{variant}.svg", make_symbol(variant))
        write(f"dreamstory-logo-horizontal-{variant}.svg", make_horizontal(variant))
        write(f"dreamstory-logo-stacked-{variant}.svg", make_stacked(variant))
        write(f"dreamstory-wordmark-{variant}.svg", make_wordmark(variant))
    write("dreamstory-symbol-small-color.svg", make_symbol("color", small=True))
    write("dreamstory-symbol-small-black.svg", make_symbol("black", small=True))
    write("dreamstory-symbol-small-white.svg", make_symbol("white", small=True))


if __name__ == "__main__":
    main()
