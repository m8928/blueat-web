import { hasRareHangul } from './lib/fonts';

const EMAIL = 'blueat@blueat.me';
const SFFE_URL = 'https://sffe.blueat.me/';
const SFFE_APP_STORE_URL = 'https://apps.apple.com/kr/app/sffe/id1588740825';
const SCIURO_URL = 'https://sciu.ro/';
const SCIURO_EMAIL = 'sciuro@sciu.ro';

export const COMMAND_NAMES = ['/about', '/projects', '/sffe', '/sciuro', '/contact', '/lang', '/help', '/clear', '/exit'];

// Maps free-form input (either language) to a reply key.
// "lang" toggles; "lang:ko" / "lang:en" switch to a specific language.
export function resolveCommand(raw) {
    const c = raw.trim().toLowerCase();
    if (/^\/?(help|\?)$/.test(c) || /도움|help/.test(c)) return 'help';
    if (/^\/?clear$/.test(c)) return 'clear';
    if (/^\/?(exit|quit)$/.test(c) || /종료|나가기/.test(c)) return 'exit';
    if (/^\/?(lang|language)$/.test(c)) return 'lang';
    if (/english|영어/.test(c)) return 'lang:en';
    if (/한국어|korean/.test(c)) return 'lang:ko';
    if (/sffe|폰트|font/.test(c)) return 'sffe';
    if (/sciuro|sciu\.ro/.test(c)) return 'sciuro';
    if (/^\/?(contact|mail|email)$/.test(c) || /연락|메일|문의|contact|e-?mail|reach/.test(c)) return 'contact';
    if (/^\/?(projects|ls|work)$/.test(c) || /작업|프로젝트|만든|project|work|built/.test(c)) return 'projects';
    if (/^\/?(about|whoami)$/.test(c) || /소개|누구|블루잇|blueat|about|who/.test(c)) return 'about';
    // Hidden transformations; not listed in /help.
    if (/^\/?(meow|cat)$/.test(c) || /야옹|냐옹|냥/.test(c)) return 'meow';
    if (/^\/?(magic|wizard)$/.test(c) || /마법|변신/.test(c)) return 'magic';
    if (/^\/?squirrel$/.test(c) || /다람쥐/.test(c)) return 'squirrel';
    if (hasRareHangul(c)) return 'alien';
    return 'unknown';
}

// Each reply is a list of steps played in order:
//   tool — "● Name(arg)" followed by "└ result" lines
//   say  — streamed text; supports **bold** and `code`, bullet lines, links and columns
//   ask  — a choice dialog that replaces the prompt until answered
// Both languages must keep the same steps in the same order.

function helpReply(intro, commands, outro) {
    return [{
        kind: 'say',
        lines: [
            { text: intro },
            ...COMMAND_NAMES.map((name) => ({
                cols: [{ text: name, tone: 'bright' }, { text: commands[name], tone: 'muted' }],
            })),
            { text: outro, tone: 'muted' },
        ],
    }];
}

const koCommands = {
    '/about': 'BLUEAT 소개',
    '/projects': '만든 것들 보기',
    '/sffe': 'SFFE 자세히 보기',
    '/sciuro': 'Sciuro 자세히 보기',
    '/contact': '연락처',
    '/lang': 'English로 보기',
    '/help': '도움말',
    '/clear': '대화 지우기',
    '/exit': '나가기',
};

const enCommands = {
    '/about': 'About BLUEAT',
    '/projects': 'Things we have built',
    '/sffe': 'More about SFFE',
    '/sciuro': 'More about Sciuro',
    '/contact': 'Get in touch',
    '/lang': '한국어로 보기',
    '/help': 'Show commands',
    '/clear': 'Clear the conversation',
    '/exit': 'Leave',
};

export const content = {
    ko: {
        title: 'BLUEAT — 만들고 싶은 것을 만듭니다',
        greeting: { first: '환영합니다!', returning: '다시 오신 걸 환영합니다!' },
        tagline: '만들고 싶은 것을 만듭니다.',
        tipsTitle: '시작하기',
        tips: [
            { before: '', cmd: '/about', after: ' 으로 소개 보기' },
            { before: '', cmd: '/projects', after: ' 로 만든 것들 보기' },
            { before: '', cmd: '/contact', after: ' 로 연락하기' },
        ],
        recentTitle: '최근 활동',
        recent: [
            { name: 'SFFE', text: 'App Store 출시' },
            { name: 'Sciuro', text: '개발 중' },
        ],
        placeholder: '"/projects" 를 입력해 보세요',
        inputLabel: '명령어 또는 질문 입력',
        hint: '? 단축키',
        shortcuts: [
            ['/', '명령어'],
            ['tab', '자동 완성'],
            ['↑ ↓', '이전 입력'],
            ['esc', '중단 · 지우기'],
            ['?', '단축키 닫기'],
        ],
        askHint: '↑↓ 이동 · enter 선택 · esc 취소',
        verbs: ['궁리하는 중', '끄적이는 중', '뚝딱이는 중', '고민하는 중', '정리하는 중', '만드는 중'],
        interruptHint: 'esc로 중단',
        interrupted: '사용자가 중단했어요',
        copyFailed: '복사하지 못했어요. 주소는 blueat@blueat.me 예요.',
        transcriptLabel: '대화',
        menuLabel: '명령어',
        langLabel: '언어 선택',
        commands: koCommands,
        replies: {
            help: helpReply('이런 걸 물어볼 수 있어요.', koCommands, '`?` 를 누르면 단축키를 볼 수 있어요. 숨은 변신도 몇 가지 있어요.'),
            about: [
                { kind: 'tool', name: 'Read', arg: 'about.md', result: [{ text: '2줄 읽음', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '**BLUEAT(블루엣)**은 직접 쓰고 싶은 소프트웨어를 만드는 회사입니다.' },
                        { text: 'iOS Safari 확장 SFFE를 출시했고, 로그 검색 SaaS Sciuro를 개발하고 있습니다.' },
                    ],
                },
            ],
            projects: [
                {
                    kind: 'tool',
                    name: 'Bash',
                    arg: 'ls ~/projects',
                    result: [
                        { cols: [{ text: 'sffe/', tone: 'bright' }, { text: 'iOS Safari 웹폰트 확장' }, { text: '출시됨', tone: 'green' }] },
                        { cols: [{ text: 'sciuro/', tone: 'bright' }, { text: '로그 검색 SaaS' }, { text: '개발 중', tone: 'yellow' }] },
                    ],
                },
                { kind: 'say', lines: [{ text: '프로젝트가 두 개 있어요. `/sffe` 나 `/sciuro` 로 자세히 볼 수 있어요.' }] },
            ],
            sffe: [
                { kind: 'tool', name: 'Fetch', arg: 'https://sffe.blueat.me', result: [{ text: '200 OK 받음', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '**SFFE**는 iOS의 모든 웹사이트에 사용자 지정 웹 폰트를 적용할 수 있는 Safari 확장 프로그램입니다.' },
                        { bullet: true, text: 'iOS · Safari 확장 · 유틸리티' },
                        { bullet: true, text: 'App Store에 출시됨' },
                    ],
                },
                {
                    kind: 'ask',
                    title: 'Fetch',
                    detail: 'https://sffe.blueat.me',
                    question: '새 탭에서 열까요?',
                    options: [
                        { label: '예, 웹사이트 열기', action: { type: 'open', url: SFFE_URL }, result: 'sffe.blueat.me 를 새 탭에서 열었어요.' },
                        { label: 'App Store에서 보기', action: { type: 'open', url: SFFE_APP_STORE_URL }, result: 'App Store를 새 탭에서 열었어요.' },
                        { label: '아니요', action: { type: 'none' }, result: '알겠어요. 다른 것도 물어보세요.' },
                    ],
                },
            ],
            sciuro: [
                { kind: 'tool', name: 'Fetch', arg: 'https://sciu.ro', result: [{ text: '200 OK 받음', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '**Sciuro**는 로그를 모으고, SPL 스타일 검색으로 살펴보고, 예약 검색으로 알림까지 보내는 로그 검색 SaaS입니다.' },
                        { bullet: true, text: '로그 수집 · 검색 · 알림' },
                        { bullet: true, text: 'Claude로 질문을 검색어로 바꾸고 알림을 요약하는 기능' },
                        { bullet: true, text: '개발 중' },
                    ],
                },
                {
                    kind: 'ask',
                    title: 'Fetch',
                    detail: 'https://sciu.ro',
                    question: '새 탭에서 열까요?',
                    options: [
                        { label: '예, 웹사이트 열기', action: { type: 'open', url: SCIURO_URL }, result: 'sciu.ro 를 새 탭에서 열었어요.' },
                        { label: 'Sciuro에 메일 쓰기', action: { type: 'mailto', email: SCIURO_EMAIL }, result: '메일 앱을 열었어요.' },
                        { label: '아니요', action: { type: 'none' }, result: '알겠어요. 다른 것도 물어보세요.' },
                    ],
                },
            ],
            contact: [
                {
                    kind: 'say',
                    lines: [{ text: '메일로 연락 주세요.' }, { text: EMAIL, href: `mailto:${EMAIL}` }],
                },
                {
                    kind: 'ask',
                    title: 'Mail',
                    detail: EMAIL,
                    question: '메일 앱을 열까요?',
                    options: [
                        { label: '예, 메일 쓰기', action: { type: 'mailto', email: EMAIL }, result: '메일 앱을 열었어요.' },
                        { label: '주소만 복사', action: { type: 'copy', text: EMAIL }, result: '주소를 복사했어요.' },
                        { label: '아니요', action: { type: 'none' }, result: '알겠어요. 언제든 연락 주세요.' },
                    ],
                },
            ],
            lang: [{ kind: 'say', lines: [{ text: '한국어로 바꿨어요.', tone: 'muted' }] }],
            exit: [{ kind: 'say', lines: [{ text: '탭을 닫으면 끝나요. 또 놀러 오세요!' }] }],
            unknown: [{ kind: 'say', lines: [{ text: '아직 그 질문엔 답하지 못해요. `/help` 를 입력해 보세요.', tone: 'muted' }] }],
            meow: [
                { kind: 'tool', name: 'Transform', arg: 'cat', result: [{ text: '고양이 모드', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: '야옹! 고양이로 변신했어요. 잠시 뒤 원래 모습으로 돌아와요.' }] },
            ],
            magic: [
                { kind: 'tool', name: 'Transform', arg: 'wizard', result: [{ text: '마법사 모드', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: '짜잔! 마법사로 변신했어요.' }] },
            ],
            squirrel: [
                { kind: 'tool', name: 'Transform', arg: 'squirrel', result: [{ text: '다람쥐 모드', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: '도토리 냠냠! 다람쥐로 변신했어요.' }] },
            ],
            alien: [
                { kind: 'tool', name: 'Detect', arg: 'language', result: [{ text: '외계어 감지', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: '외계어가 들어와서 외계인으로 변신했어요. 그래도 글자는 잘 나오죠?' }] },
            ],
        },
    },
    en: {
        title: 'BLUEAT — Building what we want to use',
        greeting: { first: 'Welcome!', returning: 'Welcome back!' },
        tagline: 'Building what we want to use.',
        tipsTitle: 'Getting started',
        tips: [
            { before: 'Run ', cmd: '/about', after: ' to meet BLUEAT' },
            { before: 'Run ', cmd: '/projects', after: ' to see what we have built' },
            { before: 'Run ', cmd: '/contact', after: ' to get in touch' },
        ],
        recentTitle: 'Recent activity',
        recent: [
            { name: 'SFFE', text: 'Live on the App Store' },
            { name: 'Sciuro', text: 'In development' },
        ],
        placeholder: 'Try "/projects"',
        inputLabel: 'Type a command or question',
        hint: '? for shortcuts',
        shortcuts: [
            ['/', 'commands'],
            ['tab', 'autocomplete'],
            ['↑ ↓', 'history'],
            ['esc', 'interrupt · clear'],
            ['?', 'hide shortcuts'],
        ],
        askHint: '↑↓ to move · enter to select · esc to cancel',
        verbs: ['Pondering', 'Tinkering', 'Noodling', 'Brewing', 'Crafting', 'Building'],
        interruptHint: 'esc to interrupt',
        interrupted: 'Interrupted by user',
        copyFailed: "Couldn't copy. The address is blueat@blueat.me.",
        transcriptLabel: 'Conversation',
        menuLabel: 'Commands',
        langLabel: 'Language',
        commands: enCommands,
        replies: {
            help: helpReply('Here is what you can ask.', enCommands, 'Press `?` to see shortcuts. There are a few hidden transformations, too.'),
            about: [
                { kind: 'tool', name: 'Read', arg: 'about.md', result: [{ text: 'Read 2 lines', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '**BLUEAT** is a company that builds the software we want to use ourselves.' },
                        { text: 'We shipped SFFE, a Safari extension for iOS, and are building Sciuro, a log search SaaS.' },
                    ],
                },
            ],
            projects: [
                {
                    kind: 'tool',
                    name: 'Bash',
                    arg: 'ls ~/projects',
                    result: [
                        { cols: [{ text: 'sffe/', tone: 'bright' }, { text: 'Web fonts for iOS Safari' }, { text: 'Live', tone: 'green' }] },
                        { cols: [{ text: 'sciuro/', tone: 'bright' }, { text: 'Log search SaaS' }, { text: 'In progress', tone: 'yellow' }] },
                    ],
                },
                { kind: 'say', lines: [{ text: 'Two projects so far. Run `/sffe` or `/sciuro` to learn more.' }] },
            ],
            sffe: [
                { kind: 'tool', name: 'Fetch', arg: 'https://sffe.blueat.me', result: [{ text: 'Received 200 OK', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '**SFFE** is a Safari extension that allows you to apply custom web fonts to any website on iOS.' },
                        { bullet: true, text: 'iOS · Safari Extension · Utility' },
                        { bullet: true, text: 'Live on the App Store' },
                    ],
                },
                {
                    kind: 'ask',
                    title: 'Fetch',
                    detail: 'https://sffe.blueat.me',
                    question: 'Open it in a new tab?',
                    options: [
                        { label: 'Yes, open the website', action: { type: 'open', url: SFFE_URL }, result: 'Opened sffe.blueat.me in a new tab.' },
                        { label: 'View on the App Store', action: { type: 'open', url: SFFE_APP_STORE_URL }, result: 'Opened the App Store in a new tab.' },
                        { label: 'No', action: { type: 'none' }, result: 'Okay. Ask me anything else.' },
                    ],
                },
            ],
            sciuro: [
                { kind: 'tool', name: 'Fetch', arg: 'https://sciu.ro', result: [{ text: 'Received 200 OK', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '**Sciuro** is a log search SaaS: collect logs, investigate them with SPL-style search, and turn saved searches into scheduled alerts.' },
                        { bullet: true, text: 'Log collection · Search · Alerts' },
                        { bullet: true, text: 'Claude turns questions into searches and summarizes alerts' },
                        { bullet: true, text: 'In development' },
                    ],
                },
                {
                    kind: 'ask',
                    title: 'Fetch',
                    detail: 'https://sciu.ro',
                    question: 'Open it in a new tab?',
                    options: [
                        { label: 'Yes, open the website', action: { type: 'open', url: SCIURO_URL }, result: 'Opened sciu.ro in a new tab.' },
                        { label: 'Email Sciuro', action: { type: 'mailto', email: SCIURO_EMAIL }, result: 'Opened your mail app.' },
                        { label: 'No', action: { type: 'none' }, result: 'Okay. Ask me anything else.' },
                    ],
                },
            ],
            contact: [
                {
                    kind: 'say',
                    lines: [{ text: 'Drop us an email.' }, { text: EMAIL, href: `mailto:${EMAIL}` }],
                },
                {
                    kind: 'ask',
                    title: 'Mail',
                    detail: EMAIL,
                    question: 'Open your mail app?',
                    options: [
                        { label: 'Yes, write an email', action: { type: 'mailto', email: EMAIL }, result: 'Opened your mail app.' },
                        { label: 'Just copy the address', action: { type: 'copy', text: EMAIL }, result: 'Copied the address.' },
                        { label: 'No', action: { type: 'none' }, result: 'Okay. Reach out any time.' },
                    ],
                },
            ],
            lang: [{ kind: 'say', lines: [{ text: 'Switched to English.', tone: 'muted' }] }],
            exit: [{ kind: 'say', lines: [{ text: 'Close the tab to leave. Come back soon!' }] }],
            unknown: [{ kind: 'say', lines: [{ text: "I can't answer that yet. Try `/help`.", tone: 'muted' }] }],
            meow: [
                { kind: 'tool', name: 'Transform', arg: 'cat', result: [{ text: 'Cat mode', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: 'Meow! Turned into a cat for a moment.' }] },
            ],
            magic: [
                { kind: 'tool', name: 'Transform', arg: 'wizard', result: [{ text: 'Wizard mode', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: 'Ta-da! Turned into a wizard.' }] },
            ],
            squirrel: [
                { kind: 'tool', name: 'Transform', arg: 'squirrel', result: [{ text: 'Squirrel mode', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: 'Nom nom, acorns! Turned into a squirrel.' }] },
            ],
            alien: [
                { kind: 'tool', name: 'Detect', arg: 'language', result: [{ text: 'Alien script detected', tone: 'dim' }] },
                { kind: 'say', lines: [{ text: 'Alien script detected, so I turned into an alien. It still renders fine, right?' }] },
            ],
        },
    },
};
