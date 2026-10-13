const EMAIL = 'blueat@blueat.me';
const SFFE_URL = 'https://sffe.blueat.me/';
const SFFE_APP_STORE_URL = 'https://apps.apple.com/kr/app/sffe/id1588740825';

export const COMMAND_NAMES = ['/about', '/projects', '/sffe', '/contact', '/lang', '/help', '/clear', '/exit'];

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
    if (/^\/?(contact|mail|email)$/.test(c) || /연락|메일|문의|contact|e-?mail|reach/.test(c)) return 'contact';
    if (/^\/?(projects|ls|work)$/.test(c) || /작업|프로젝트|만든|project|work|built/.test(c)) return 'projects';
    if (/^\/?(about|whoami)$/.test(c) || /소개|누구|블루잇|blueat|about|who/.test(c)) return 'about';
    return 'unknown';
}

// Each reply is a list of steps played in order:
//   tool — "● Name(arg)" followed by "⎿ result" lines
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
    '/contact': '연락처',
    '/lang': 'English로 보기',
    '/help': '도움말',
    '/clear': '대화 지우기',
    '/exit': '나가기',
};

const enCommands = {
    '/about': 'About BLUEAT',
    '/projects': 'Things I have built',
    '/sffe': 'More about SFFE',
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
            { name: '생산성 앱', text: '개발 중' },
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
            help: helpReply('이런 걸 물어볼 수 있어요.', koCommands, '`?` 를 누르면 단축키를 볼 수 있어요.'),
            about: [
                { kind: 'tool', name: 'Read', arg: 'about.md', result: [{ text: '2줄 읽음', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: '거창한 목표보다는 **제가 쓰고 싶은 앱**을 만듭니다.' },
                        { text: 'BLUEAT은 저의 아이디어를 기록하는 공간입니다.' },
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
                        { cols: [{ text: 'untitled/', tone: 'muted' }, { text: '생산성 앱', tone: 'muted' }, { text: '개발 중', tone: 'yellow' }] },
                    ],
                },
                { kind: 'say', lines: [{ text: '프로젝트가 두 개 있어요. `/sffe` 로 SFFE를 자세히 볼 수 있어요.' }] },
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
        },
    },
    en: {
        title: 'BLUEAT — Building what I want',
        greeting: { first: 'Welcome!', returning: 'Welcome back!' },
        tagline: 'Building what I want.',
        tipsTitle: 'Getting started',
        tips: [
            { before: 'Run ', cmd: '/about', after: ' to meet BLUEAT' },
            { before: 'Run ', cmd: '/projects', after: ' to see what I have built' },
            { before: 'Run ', cmd: '/contact', after: ' to get in touch' },
        ],
        recentTitle: 'Recent activity',
        recent: [
            { name: 'SFFE', text: 'Live on the App Store' },
            { name: 'Productivity app', text: 'In development' },
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
            help: helpReply('Here is what you can ask.', enCommands, 'Press `?` to see shortcuts.'),
            about: [
                { kind: 'tool', name: 'Read', arg: 'about.md', result: [{ text: 'Read 2 lines', tone: 'dim' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: 'I simply create **applications that I want to use**.' },
                        { text: 'BLUEAT is a personal archive of my creative ideas.' },
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
                        { cols: [{ text: 'untitled/', tone: 'muted' }, { text: 'Productivity app', tone: 'muted' }, { text: 'In progress', tone: 'yellow' }] },
                    ],
                },
                { kind: 'say', lines: [{ text: 'Two projects so far. Run `/sffe` to learn more about SFFE.' }] },
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
            contact: [
                {
                    kind: 'say',
                    lines: [{ text: 'Drop me an email.' }, { text: EMAIL, href: `mailto:${EMAIL}` }],
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
        },
    },
};
