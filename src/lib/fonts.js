// Monatendard ships in two parts (see scripts/build-fonts.py). The main files, declared in
// index.css, cover everything the page prints plus the 2,350 common syllables of KS X 1001.
// The -ext files hold every other Hangul syllable and the conjoining jamo; they load only
// once a visitor types one of those characters.
const EXT_FILES = [['400', 'Regular'], ['700', 'Bold']];
const EXT_RANGE = 'U+1100-11FF, U+A960-A97F, U+AC00-D7A3, U+D7B0-D7FF';

let common = null;
let requested = false;

// The KS X 1001 syllables, decoded from the same EUC-KR rows (B0-C8) the build script uses.
function commonSyllables() {
    if (!common) {
        const bytes = [];
        for (let lead = 0xb0; lead <= 0xc8; lead += 1) {
            for (let trail = 0xa1; trail <= 0xfe; trail += 1) bytes.push(lead, trail);
        }
        common = new Set(new TextDecoder('euc-kr').decode(new Uint8Array(bytes)));
    }
    return common;
}

function needsExtended(ch) {
    const cp = ch.codePointAt(0);
    if ((cp >= 0x1100 && cp <= 0x11ff) || (cp >= 0xa960 && cp <= 0xa97f) || (cp >= 0xd7b0 && cp <= 0xd7ff)) return true;
    if (cp < 0xac00 || cp > 0xd7a3) return false;
    try {
        return !commonSyllables().has(ch);
    } catch {
        return true; // No EUC-KR decoder: load the extra glyphs rather than risk a fallback font.
    }
}

export function loadExtendedFontFor(text) {
    if (requested || !text || typeof document === 'undefined' || !document.fonts || typeof FontFace === 'undefined') return;
    let needed = false;
    for (const ch of text) {
        if (needsExtended(ch)) {
            needed = true;
            break;
        }
    }
    if (!needed) return;
    requested = true;
    EXT_FILES.forEach(([weight, name]) => {
        const face = new FontFace('Monatendard', `url(/fonts/Monatendard-${name}-ext.woff2) format('woff2')`, {
            weight,
            display: 'swap',
            unicodeRange: EXT_RANGE,
        });
        document.fonts.add(face);
        face.load().catch(() => {});
    });
}
