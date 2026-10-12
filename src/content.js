const EMAIL = 'blueat@blueat.me';
const SFFE_URL = 'https://sffe.blueat.me/';
const SFFE_APP_STORE_URL = 'https://apps.apple.com/kr/app/sffe/id1588740825';

export const COMMAND_NAMES = ['/about', '/projects', '/sffe', '/contact', '/lang', '/help', '/clear'];

// Maps free-form input (either language) to a reply key.
// "lang" toggles; "lang:ko" / "lang:en" switch to a specific language.
export function resolveCommand(raw) {
    const c = raw.trim().toLowerCase();
    if (/^\/?(help|\?)$/.test(c) || /도움|help/.test(c)) return 'help';
    if (/^\/?clear$/.test(c)) return 'clear';
    if (/^\/?(lang|language)$/.test(c)) return 'lang';
    if (/english|영어/.test(c)) return 'lang:en';
    if (/한국어|korean/.test(c)) return 'lang:ko';
    if (/sffe|폰트|font/.test(c)) return 'sffe';
    if (/^\/?(contact|mail|email)$/.test(c) || /연락|메일|문의|contact|e-?mail|reach/.test(c)) return 'contact';
    if (/^\/?(projects|ls|work)$/.test(c) || /작업|프로젝트|만든|project|work|built/.test(c)) return 'projects';
    if (/^\/?(about|whoami)$/.test(c) || /소개|누구|블루잇|blueat|about|who/.test(c)) return 'about';
    return 'unknown';
}

function helpReply(intro, commands) {
    return [{
        kind: 'say',
        lines: [
            { text: intro },
            ...COMMAND_NAMES.map((name) => ({
                cols: [{ text: name, tone: 'bright' }, { text: commands[name], tone: 'muted' }],
            })),
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
};

const enCommands = {
    '/about': 'About BLUEAT',
    '/projects': 'Things I have built',
    '/sffe': 'More about SFFE',
    '/contact': 'Get in touch',
    '/lang': '한국어로 보기',
    '/help': 'Show commands',
    '/clear': 'Clear the conversation',
};

export const content = {
    ko: {
        title: 'BLUEAT — 만들고 싶은 것을 만듭니다',
        welcome: { before: '', after: '에 오신 걸 환영합니다' },
        tagline: '1인 크리에이티브 스튜디오 — 만들고 싶은 것을 만듭니다.',
        tipsTitle: '시작하기:',
        tips: [
            { before: '', cmd: '/about', after: ' 으로 소개 보기' },
            { before: '', cmd: '/projects', after: ' 로 만든 것들 보기' },
            { before: '', cmd: '/contact', after: ' 로 연락하기' },
        ],
        placeholder: '/help 를 입력하거나 편하게 물어보세요',
        inputLabel: '명령어 또는 질문 입력',
        hint: '/ 로 명령어 보기 · ↑ 이전 입력',
        thinking: '생각 중…',
        thinkingNote: '(잠시만요)',
        transcriptLabel: '대화',
        menuLabel: '명령어',
        langLabel: '언어 선택',
        commands: koCommands,
        replies: {
            help: helpReply('이런 걸 물어볼 수 있어요.', koCommands),
            about: [{
                kind: 'say',
                lines: [
                    { text: 'BLUEAT은 1인 크리에이티브 스튜디오예요.', tone: 'strong' },
                    { text: '거창한 목표보다는 제가 쓰고 싶은 앱을 만듭니다.' },
                    { text: 'BLUEAT은 저의 아이디어를 기록하는 공간입니다.' },
                ],
            }],
            projects: [
                {
                    kind: 'tool',
                    name: 'ls',
                    arg: '~/projects',
                    lines: [
                        { cols: [{ text: 'sffe/', tone: 'bright' }, { text: 'iOS Safari 웹폰트 확장' }, { text: '출시됨', tone: 'green' }] },
                        { cols: [{ text: 'untitled/', tone: 'muted' }, { text: '생산성 앱', tone: 'muted' }, { text: '개발 중', tone: 'yellow' }] },
                    ],
                },
                { kind: 'say', lines: [{ text: '두 개의 프로젝트가 있어요. /sffe 로 자세히 볼 수 있어요.' }] },
            ],
            sffe: [
                { kind: 'tool', name: 'open', arg: 'sffe', lines: [{ text: 'iOS · Safari 확장 · 유틸리티', tone: 'muted' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: 'SFFE', tone: 'accent' },
                        { text: 'iOS의 모든 웹사이트에 사용자 지정 웹 폰트를 적용할 수 있는 Safari 확장 프로그램입니다.' },
                        { text: '↗ sffe.blueat.me', href: SFFE_URL },
                        { text: '↗ App Store에서 보기', href: SFFE_APP_STORE_URL },
                    ],
                },
            ],
            contact: [{
                kind: 'say',
                lines: [{ text: '메일로 연락 주세요.' }, { text: EMAIL, href: `mailto:${EMAIL}` }],
            }],
            lang: [{ kind: 'say', lines: [{ text: '한국어로 바꿨어요.', tone: 'muted' }] }],
            unknown: [{ kind: 'say', lines: [{ text: '아직 그 질문엔 답하지 못해요. /help 를 입력해 보세요.', tone: 'muted' }] }],
        },
    },
    en: {
        title: 'BLUEAT — Building what I want',
        welcome: { before: 'Welcome to ', after: '' },
        tagline: 'A solo creative studio — building what I want.',
        tipsTitle: 'Getting started:',
        tips: [
            { before: 'Run ', cmd: '/about', after: ' to meet BLUEAT' },
            { before: 'Run ', cmd: '/projects', after: ' to see what I have built' },
            { before: 'Run ', cmd: '/contact', after: ' to get in touch' },
        ],
        placeholder: 'Type /help or ask anything',
        inputLabel: 'Type a command or question',
        hint: '/ for commands · ↑ for history',
        thinking: 'Thinking…',
        thinkingNote: '(one sec)',
        transcriptLabel: 'Conversation',
        menuLabel: 'Commands',
        langLabel: 'Language',
        commands: enCommands,
        replies: {
            help: helpReply('Here is what you can ask.', enCommands),
            about: [{
                kind: 'say',
                lines: [
                    { text: 'BLUEAT is a solo creative studio.', tone: 'strong' },
                    { text: 'I simply create applications that I want to use.' },
                    { text: 'BLUEAT is a personal archive of my creative ideas.' },
                ],
            }],
            projects: [
                {
                    kind: 'tool',
                    name: 'ls',
                    arg: '~/projects',
                    lines: [
                        { cols: [{ text: 'sffe/', tone: 'bright' }, { text: 'Web fonts for iOS Safari' }, { text: 'Live', tone: 'green' }] },
                        { cols: [{ text: 'untitled/', tone: 'muted' }, { text: 'Productivity app', tone: 'muted' }, { text: 'In development', tone: 'yellow' }] },
                    ],
                },
                { kind: 'say', lines: [{ text: 'Two projects so far. Run /sffe to learn more.' }] },
            ],
            sffe: [
                { kind: 'tool', name: 'open', arg: 'sffe', lines: [{ text: 'iOS · Safari Extension · Utility', tone: 'muted' }] },
                {
                    kind: 'say',
                    lines: [
                        { text: 'SFFE', tone: 'accent' },
                        { text: 'A Safari extension that allows you to apply custom web fonts to any website on iOS.' },
                        { text: '↗ sffe.blueat.me', href: SFFE_URL },
                        { text: '↗ View on the App Store', href: SFFE_APP_STORE_URL },
                    ],
                },
            ],
            contact: [{
                kind: 'say',
                lines: [{ text: 'Drop me an email.' }, { text: EMAIL, href: `mailto:${EMAIL}` }],
            }],
            lang: [{ kind: 'say', lines: [{ text: 'Switched to English.', tone: 'muted' }] }],
            unknown: [{ kind: 'say', lines: [{ text: "I can't answer that yet. Try /help.", tone: 'muted' }] }],
        },
    },
};
