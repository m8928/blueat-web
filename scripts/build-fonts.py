#!/usr/bin/env python3
"""Rebuild the trimmed Monatendard web fonts in public/fonts/.

Needs fontTools and brotli (pip install fonttools brotli). Downloads the official
Monatendard 0.3.0 web fonts and splits each weight in two:

  Monatendard-<Weight>.woff2      Latin, symbols, compatibility jamo and the 2,350
                                  common syllables of KS X 1001; every visitor loads it
  Monatendard-<Weight>-ext.woff2  every other Hangul syllable; src/lib/fonts.js loads it
                                  only when a visitor types one

Run from the repository root: python3 scripts/build-fonts.py
"""

import io
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

VERSION = "0.3.0"
SOURCE_URL = "https://monatendard.github.io/assets/fonts/Monatendard-{weight}.woff2"
WEIGHTS = ("Regular", "Bold")
OUT_DIR = Path("public/fonts")


def ksx1001(first_lead: int, last_lead: int) -> set[int]:
    """Code points of KS X 1001 rows first_lead..last_lead, via the EUC-KR codec."""
    points = set()
    for lead in range(first_lead, last_lead + 1):
        for trail in range(0xA1, 0xFF):
            try:
                points.update(ord(c) for c in bytes([lead, trail]).decode("euc_kr"))
            except UnicodeDecodeError:
                pass
    return points


# Rows A1-AC are symbols, jamo, Greek, Cyrillic, box drawing and units; B0-C8 are the
# 2,350 Hangul syllables. src/lib/fonts.js decodes the same B0-C8 rows to decide when
# a typed syllable needs the -ext file, so the two must stay in step.
MAIN = (
    set(range(0x20, 0x7F))
    | set(range(0xA0, 0x100))
    | set(range(0x2000, 0x2070))  # general punctuation
    | set(range(0x2190, 0x2200))  # arrows
    | set(range(0x2500, 0x2600))  # box drawing, blocks, geometric shapes
    | set(range(0x2600, 0x27C0))  # miscellaneous symbols, dingbats
    | set(range(0x3131, 0x318F))  # compatibility jamo
    | ksx1001(0xA1, 0xAC)
    | ksx1001(0xB0, 0xC8)
)
# Syllables only. The -ext face is declared for the whole syllable block, so the browser
# tries it first for every syllable; if it also had conjoining jamo, the shaper would
# spell common syllables it lacks (고 -> ᄀ + ᅩ) out of loose jamo instead of falling
# back to the main file.
EXT = set(range(0xAC00, 0xD7A4)) - MAIN  # Hangul syllables


def download(weight: str) -> bytes:
    url = SOURCE_URL.format(weight=weight)
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read()
    found = TTFont(io.BytesIO(data))["name"].getDebugName(5) or ""
    if VERSION not in found:
        raise SystemExit(f"{url} is {found!r}, expected version {VERSION}; update VERSION or the source.")
    return data


def write_subset(font: TTFont, points: set[int], path: Path) -> int:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    wanted = sorted(points & set(font.getBestCmap()))
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=wanted)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(path)
    return len(wanted)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for weight in WEIGHTS:
        source = download(weight)
        for suffix, points in (("", MAIN), ("-ext", EXT)):
            path = OUT_DIR / f"Monatendard-{weight}{suffix}.woff2"
            count = write_subset(TTFont(io.BytesIO(source)), points, path)
            print(f"{path}: {count} code points, {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
