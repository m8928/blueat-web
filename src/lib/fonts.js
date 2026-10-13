// Monatendard ships in two parts (see scripts/build-fonts.py). The main files, declared in
// index.css, cover everything the page prints plus the 2,350 common syllables of KS X 1001.
// The -ext files hold every other Hangul syllable; they load only once a visitor types one.
const EXT_FILES = [['400', 'Regular'], ['700', 'Bold']];
const EXT_RANGE = 'U+AC00-D7A3';

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
    if (cp < 0xac00 || cp > 0xd7a3) return false;
    try {
        return !commonSyllables().has(ch);
    } catch {
        return true; // No EUC-KR decoder: load the extra glyphs rather than risk a fallback font.
    }
}

// True when the text holds a Hangul syllable outside KS X 1001 ("외계어").
export function hasRareHangul(text) {
    for (const ch of text) {
        if (needsExtended(ch)) return true;
    }
    return false;
}

export function loadExtendedFontFor(text) {
    if (requested || !text || typeof document === 'undefined' || !document.fonts || typeof FontFace === 'undefined') return;
    if (!hasRareHangul(text)) return;
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
