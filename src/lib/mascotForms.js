// BLUEAT's mascot and its transformations. Every form keeps the base body (rows 3-10,
// columns 2-11 of a 14x12 grid) so it reads as the same character changing outfits.
// Each letter maps to a colour and, for animated pixels, a CSS class from index.css.
const ACCENT = '#6EA8FE';
const DARK = '#0E1013';
const WHITE = '#EEF2F3';
const YELLOW = '#F2CC60';

// letter: [fill, class, colour shown while the animation is "on"]
const PALETTE = {
    '#': [ACCENT],
    e: [DARK, 'mx-blink', ACCENT], // eye
    k: [DARK],
    w: [WHITE],
    p: ['#FF8FB1'], // blush
    P: ['#E8336A'], // SFFE pink
    f: [DARK, 'mx-blink', '#E8336A'], // eye on pink
    g: ['#7EE787'],
    j: [DARK, 'mx-blink', '#7EE787'], // eye on green
    d: ['#1B2740'], // screen
    v: ['#E6EDF3', 'mx-blink', '#1B2740'], // screen eye
    c: [WHITE, 'mx-cursor'],
    C: ['transparent', 'mx-chomp', ACCENT], // open mouth that closes as it chews
    o: [YELLOW, 'mx-dot'],
    a: [YELLOW, 'mx-twinkle'],
    x: [YELLOW, 'mx-twinkle'],
    q: ['#4C5FD5'], // nightcap
    b: [ACCENT, 'mx-nod'], // dozing body
    K: [DARK, 'mx-nod'], // dozing eyes
    Z: [WHITE, 'mx-zzz'],
    t: [WHITE, 'mx-think'],
    T: [WHITE, 'mx-think mx-think-2'],
    U: [WHITE, 'mx-think mx-think-3'],
    r: ['#FF7B72'],
    s: ['#9CC9FF', 'mx-drip'], // sweat
    m: ['#A78BFA'], // wizard hat
    y: [YELLOW],
    l: ['#8FA3BF'], // envelope flap
    n: ['#E8336A'], // nose
};

const ROWS = {
    base: [ // 기본
        '..............',
        '..............',
        '..............',
        '....######....',
        '...########...',
        '..###e##e###..',
        '..###e##e###..',
        '..##########..',
        '..##########..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    thinking: [ // 생각 중
        '..............',
        '.........t.T.U',
        '..............',
        '....######....',
        '...########...',
        '..###e##e###..',
        '..##########..',
        '..##########..',
        '..####kk####..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    success: [ // 성공
        '.x............',
        '............x.',
        '..x...........',
        '....######....',
        '...########...',
        '..##k####k##..',
        '..#k#k##k#k#..',
        '..##########..',
        '..#p######p#..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    interrupted: [ // 중단됨
        '..............',
        '..............',
        '...........s..',
        '....######.s..',
        '...########...',
        '..#k#k##k#k#..',
        '..##k####k##..',
        '..#k#kkkk#k#..',
        '..##########..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    dozing: [ // 꾸벅꾸벅
        '..........ZZZZ',
        '............ZZ',
        '...........ZZ.',
        '..........ZZZZ',
        '....bbbbbb....',
        '...bbbbbbbb...',
        '..bbbbbbbbbb..',
        '..bbKKbbKKbb..',
        '..bbbbbbbbbb..',
        '..bbbbbbbbbb..',
        '..bbbbbbbbbb..',
        '...bb....bb...',
    ],
    sleeping: [ // 잠자기
        '......ww......',
        '.....qqqq.....',
        '....qqqqqq....',
        '...wwwwwwww...',
        '...########...',
        '..##########..',
        '..##kk##kk##..',
        '..##########..',
        '..##########..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    terminal: [ // 터미널
        '..............',
        '..............',
        '..............',
        '....######....',
        '...########...',
        '..#dwdddddd#..',
        '..#ddwddddd#..',
        '..#dwddccdd#..',
        '..#dddddddd#..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    eat: [ // 냠냠
        '..............',
        '..............',
        '..............',
        '....######....',
        '...########...',
        '..###e##e###..',
        '..###e##e###..',
        '..#########C..',
        '..#######CCC.o',
        '..#########C..',
        '...##....##...',
        '..............',
    ],
    robot: [ // 로봇
        '......aa......',
        '......##......',
        '......##......',
        '....######....',
        '...########...',
        '..#ddvddvdd#..',
        '..#ddvddvdd#..',
        '..##########..',
        '..##gggggg##..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    sffe: [ // SFFE
        '..............',
        '..............',
        '..............',
        '....PPPPPP....',
        '...PPPPPPPP...',
        '..PPPfPPfPPP..',
        '..PPPfPPfPPP..',
        '..PPPPwwPPPP..',
        '..PPPwwwwPPP..',
        '..PPPwPPwPPP..',
        '...PP....PP...',
        '..............',
    ],
    mail: [ // 메일
        '..............',
        '..............',
        '..............',
        '....######....',
        '...########...',
        '..###e##e###..',
        '..###e##e###..',
        '..#lwwwwwwl#..',
        '..#wlwwwwlw#..',
        '..#wwllllww#..',
        '...##....##...',
        '..............',
    ],
    squirrel: [ // 다람쥐
        '..........ww..',
        '....#....#www.',
        '....##..##.www',
        '....######.www',
        '...########www',
        '..###e##e###ww',
        '..###e##e###ww',
        '..#p######p#ww',
        '..##########ww',
        '..##########w.',
        '...##....##...',
        '..............',
    ],
    cat: [ // 냥
        '..............',
        '...#......#...',
        '...##....##...',
        '....######....',
        '...########...',
        '..###e##e###..',
        'ww###e##e###ww',
        '..#p##nn##p#..',
        'ww##########ww',
        '..##########..',
        '...##....##...',
        '..............',
    ],
    alien: [ // 외계인
        '...a......a...',
        '....g....g....',
        '.....g..g.....',
        '....gggggg....',
        '...gggggggg...',
        '..gggjggjggg..',
        '..gggjggjggg..',
        '..gggggggggg..',
        '..gggggggggg..',
        '..gggggggggg..',
        '...gg....gg...',
        '..............',
    ],
    wizard: [ // 마법사
        '......mm......',
        '.....mmmm.....',
        '....mmxxmm....',
        '..mmmmmmmmmm..',
        '...########...',
        '..###e##e###..',
        '..###e##e###..',
        '..##########..',
        '..##########..',
        '..##########..',
        '...##....##...',
        '..............',
    ],
};

export const MASCOT_WIDTH = 14;
export const MASCOT_HEIGHT = 12;

function toCells(rows) {
    const cells = [];
    rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            const entry = PALETTE[ch];
            if (!entry) return;
            const [fill, className = '', lid = ''] = entry;
            cells.push({ x, y, fill, className, lid });
        });
    });
    return cells;
}

export const MASCOT_FORMS = Object.fromEntries(Object.entries(ROWS).map(([name, rows]) => [name, toCells(rows)]));
