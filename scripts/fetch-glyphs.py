#!/usr/bin/env python3
"""
Subset DejaVu to the terminal glyphs Space Mono lacks -> fonts/flw-glyphs-*.woff2:
arrows, box drawing, blocks, geometric shapes from DejaVu Sans Mono; Braille
(spinner) from DejaVu Sans, since the Mono cut has none.

Space Mono covers Latin only, so without this █ ░ ● ○ ▶ ─ │ ⠋ fall back to
whatever mono font the device has and look different on every screen.

Requires: pip install fonttools brotli
Run:      python3 scripts/fetch-glyphs.py && npm run build
"""
import io
import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / 'fonts'
BASE = 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/'

# Keep in sync with unicode-range in src/glyphs.css (↑ ↓ stay with Space Mono)
MONO_RANGES = [
    (0x2190, 0x2190), (0x2192, 0x2192), (0x2194, 0x21FF),  # arrows
    (0x2500, 0x257F),  # box drawing
    (0x2580, 0x259F),  # block elements
    (0x25A0, 0x25FF),  # geometric shapes
]
BRAILLE_RANGES = [(0x2800, 0x28FF)]

# (source file, ranges, output name)
JOBS = [
    ('DejaVuSansMono.ttf', MONO_RANGES, 'flw-glyphs-400.woff2'),
    ('DejaVuSansMono-Bold.ttf', MONO_RANGES, 'flw-glyphs-700.woff2'),
    ('DejaVuSans.ttf', BRAILLE_RANGES, 'flw-glyphs-braille-400.woff2'),
    ('DejaVuSans-Bold.ttf', BRAILLE_RANGES, 'flw-glyphs-braille-700.woff2'),
]


def main():
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = []
    options.name_IDs = ['*']
    options.notdef_outline = True

    for filename, ranges, outname in JOBS:
        print(f'fetch {filename}')
        data = urllib.request.urlopen(BASE + filename).read()
        font = TTFont(io.BytesIO(data))
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=[cp for lo, hi in ranges for cp in range(lo, hi + 1)])
        subsetter.subset(font)
        out = FONTS / outname
        font.flavor = 'woff2'
        font.save(out)
        print(f'wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes, {len(font.getBestCmap())} glyphs)')


if __name__ == '__main__':
    main()
