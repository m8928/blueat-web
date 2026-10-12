import React, { useEffect, useRef, useState } from 'react';
import { COMMAND_NAMES, content, resolveCommand } from '../content';

const FRAMES = ['·', '✢', '✶', '✻', '✽', '✻', '✶', '✢'];

// Shown on first load so visitors see something without typing.
const INITIAL_BLOCKS = [
    { type: 'user', text: '/about' },
    { type: 'reply', key: 'about' },
    { type: 'user', text: '/projects' },
    { type: 'reply', key: 'projects' },
];

const TONES = {
    fg: 'text-term-fg',
    muted: 'text-term-muted',
    dim: 'text-term-dim',
    bright: 'text-term-bright',
    strong: 'text-term-bright font-bold',
    accent: 'text-accent font-bold',
    link: 'text-accent',
    green: 'text-term-green',
    yellow: 'text-term-yellow',
};

const matchesMedia = (query) => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;

function Text({ line }) {
    if (line.href) {
        const external = line.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};
        return (
            <a
                href={line.href}
                className={`${TONES[line.tone || 'link']} underline decoration-dotted underline-offset-4 hover:decoration-solid`}
                {...external}
            >
                {line.text}
            </a>
        );
    }
    return <span className={TONES[line.tone || 'fg']}>{line.text}</span>;
}

function Line({ line }) {
    if (line.cols) {
        return (
            <div className="grid grid-cols-[12ch_minmax(0,28ch)_auto] justify-start gap-x-[2ch] max-sm:grid-cols-[10ch_minmax(0,1fr)_auto] max-sm:gap-x-[1ch]">
                {line.cols.map((col, i) => (
                    <span key={i} className="break-keep">
                        <Text line={col} />
                    </span>
                ))}
            </div>
        );
    }
    return (
        <div className="whitespace-pre-wrap break-keep">
            <Text line={line} />
        </div>
    );
}

function UserLine({ text }) {
    return (
        <div className="mt-6 grid grid-cols-[2ch_minmax(0,1fr)] text-term-muted">
            <span aria-hidden="true">&gt;</span>
            <span className="whitespace-pre-wrap break-all">{text}</span>
        </div>
    );
}

function Say({ lines }) {
    return (
        <div className="mt-3.5 grid grid-cols-[2ch_minmax(0,1fr)]">
            <span aria-hidden="true" className="text-term-bright">●</span>
            <div>
                {lines.map((line, i) => <Line key={i} line={line} />)}
            </div>
        </div>
    );
}

function Tool({ name, arg, lines }) {
    return (
        <div className="mt-3.5">
            <div className="grid grid-cols-[2ch_minmax(0,1fr)]">
                <span aria-hidden="true" className="text-term-green">●</span>
                <div>
                    <span className="font-bold text-term-bright">{name}</span>
                    <span className="text-term-muted">(</span>
                    {arg}
                    <span className="text-term-muted">)</span>
                </div>
            </div>
            {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[2ch_3ch_minmax(0,1fr)]">
                    <span />
                    <span aria-hidden="true" className="text-term-dim">{i === 0 ? '⎿' : ''}</span>
                    <Line line={line} />
                </div>
            ))}
        </div>
    );
}

const Terminal = ({ lang, setLang }) => {
    const t = content[lang];
    const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
    const [input, setInput] = useState('');
    const [sel, setSel] = useState(0);
    const [busy, setBusy] = useState(false);
    const [frame, setFrame] = useState(0);
    const [history, setHistory] = useState([]);
    const [cursor, setCursor] = useState(null);
    const inputRef = useRef(null);
    const replyTimer = useRef(null);
    const hasMounted = useRef(false);

    const query = input.trim().toLowerCase();
    const matches = !busy && query.startsWith('/') && !query.includes(' ')
        ? COMMAND_NAMES.filter((name) => name.startsWith(query))
        : [];
    const menuOpen = matches.length > 0;
    const active = Math.min(sel, matches.length - 1);

    useEffect(() => {
        if (!busy) return undefined;
        const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 110);
        return () => clearInterval(id);
    }, [busy]);

    useEffect(() => () => clearTimeout(replyTimer.current), []);

    // Keep the prompt in view as the conversation grows.
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: matchesMedia('(prefers-reduced-motion: reduce)') ? 'auto' : 'smooth',
        });
    }, [blocks.length, busy]);

    // Focus the prompt on desktop only, so phones don't pop the keyboard on load.
    useEffect(() => {
        if (matchesMedia('(pointer: fine)')) inputRef.current?.focus({ preventScroll: true });
    }, []);

    // Pressing "/" anywhere jumps to the prompt with the command menu open.
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            const el = document.activeElement;
            if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
            e.preventDefault();
            setInput('/');
            setSel(0);
            inputRef.current?.focus();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const run = (raw) => {
        const text = raw.trim();
        if (!text || busy) return;
        setHistory((h) => [...h, text]);
        setCursor(null);
        setInput('');
        setSel(0);

        const key = resolveCommand(text);
        if (key === 'clear') {
            setBlocks([]);
            return;
        }

        setBlocks((b) => [...b, { type: 'user', text }]);
        setBusy(true);
        const delay = matchesMedia('(prefers-reduced-motion: reduce)') ? 150 : 650;
        replyTimer.current = setTimeout(() => {
            const isLang = key.startsWith('lang');
            if (isLang) {
                setLang((cur) => (key === 'lang' ? (cur === 'ko' ? 'en' : 'ko') : key.slice(5)));
            }
            setBlocks((b) => [...b, { type: 'reply', key: isLang ? 'lang' : key }]);
            setBusy(false);
        }, delay);
    };

    const runFromClick = (cmd) => {
        run(cmd);
        if (matchesMedia('(pointer: fine)')) inputRef.current?.focus({ preventScroll: true });
    };

    const onKeyDown = (e) => {
        // Let the IME finish composing Hangul before Enter submits.
        if (e.nativeEvent.isComposing) return;
        if (menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setSel((active + step + matches.length) % matches.length);
            return;
        }
        if (menuOpen && e.key === 'Tab') {
            e.preventDefault();
            setInput(matches[active]);
            return;
        }
        if (e.key === 'Escape') {
            setInput('');
            setSel(0);
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            run(menuOpen ? matches[active] : input);
            return;
        }
        if (e.key === 'ArrowUp' && history.length) {
            e.preventDefault();
            const next = Math.max(0, (cursor ?? history.length) - 1);
            setCursor(next);
            setInput(history[next]);
            return;
        }
        if (e.key === 'ArrowDown' && cursor !== null) {
            e.preventDefault();
            const next = cursor + 1;
            setCursor(next < history.length ? next : null);
            setInput(next < history.length ? history[next] : '');
        }
    };

    return (
        <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-12">
            <main className="mx-auto max-w-[880px]">
                <section aria-labelledby="welcome" className="inline-flex max-w-full flex-col rounded-lg border border-accent py-3 pl-4 pr-5">
                    <h1 id="welcome">
                        <span aria-hidden="true" className="text-accent">✻ </span>
                        <span className="text-term-muted">{t.welcome.before}</span>
                        <span className="font-bold text-term-bright">BLUEAT</span>
                        <span className="text-term-muted">{t.welcome.after}</span>
                    </h1>
                    <p className="mt-[1.6em] break-keep pl-[2ch] text-term-muted">{t.tagline}</p>
                    <p className="mt-[1.6em] pl-[2ch] text-term-dim">cwd: ~/blueat</p>
                </section>

                <section aria-label={t.tipsTitle} className="mt-6 break-keep text-term-muted">
                    <p>{t.tipsTitle}</p>
                    <ol>
                        {t.tips.map((tip, i) => (
                            <li key={tip.cmd}>
                                {i + 1}. {tip.before}
                                <button
                                    type="button"
                                    onClick={() => runFromClick(tip.cmd)}
                                    className="text-term-bright underline decoration-term-dim decoration-dotted underline-offset-4 hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
                                >
                                    {tip.cmd}
                                </button>
                                {tip.after}
                            </li>
                        ))}
                    </ol>
                </section>

                <section aria-label={t.transcriptLabel} aria-live="polite">
                    {blocks.map((block, i) => {
                        if (block.type === 'user') return <UserLine key={i} text={block.text} />;
                        return t.replies[block.key].map((item, j) => (
                            item.kind === 'tool'
                                ? <Tool key={`${i}-${j}`} name={item.name} arg={item.arg} lines={item.lines} />
                                : <Say key={`${i}-${j}`} lines={item.lines} />
                        ));
                    })}
                    {busy && (
                        <div className="mt-3.5 grid grid-cols-[2ch_minmax(0,1fr)]">
                            <span aria-hidden="true" className="text-accent">{FRAMES[frame]}</span>
                            <span>
                                <span className="text-accent">{t.thinking}</span>{' '}
                                <span className="text-term-dim">{t.thinkingNote}</span>
                            </span>
                        </div>
                    )}
                </section>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        run(menuOpen ? matches[active] : input);
                    }}
                    className="mt-6 flex items-center gap-[1ch] rounded-lg border border-term-line px-3.5 py-2 transition-colors focus-within:border-term-muted"
                >
                    <span aria-hidden="true">&gt;</span>
                    <input
                        ref={inputRef}
                        id="prompt"
                        type="text"
                        role="combobox"
                        aria-label={t.inputLabel}
                        aria-expanded={menuOpen}
                        aria-controls="command-menu"
                        aria-autocomplete="list"
                        aria-activedescendant={menuOpen ? `command-${active}` : undefined}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setSel(0);
                        }}
                        onKeyDown={onKeyDown}
                        placeholder={t.placeholder}
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        enterKeyHint="send"
                        className="h-[30px] min-w-0 flex-1 bg-transparent text-term-bright caret-accent placeholder:text-term-dim focus:outline-none"
                    />
                </form>

                {menuOpen && (
                    <ul id="command-menu" role="listbox" aria-label={t.menuLabel} className="pt-1.5">
                        {matches.map((name, i) => (
                            <li
                                key={name}
                                id={`command-${i}`}
                                role="option"
                                aria-selected={i === active}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setSel(i)}
                                onClick={() => runFromClick(name)}
                                className={`grid min-h-10 cursor-pointer grid-cols-[13ch_minmax(0,1fr)] items-center rounded-md px-3.5 ${i === active ? 'text-accent' : 'text-term-fg'}`}
                            >
                                <span>{name}</span>
                                <span className={i === active ? 'text-accent' : 'text-term-dim'}>{t.commands[name]}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex items-center justify-between gap-4 px-3.5 text-[13px] text-term-dim">
                    <span className="max-sm:hidden">{t.hint}</span>
                    <div role="group" aria-label={t.langLabel} className="ml-auto flex items-center">
                        {['ko', 'en'].map((code, i) => (
                            <React.Fragment key={code}>
                                {i > 0 && <span aria-hidden="true">·</span>}
                                <button
                                    type="button"
                                    aria-pressed={lang === code}
                                    onClick={() => setLang(code)}
                                    className={`h-11 min-w-9 px-1.5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent ${lang === code ? 'text-term-fg' : 'text-term-dim hover:text-term-fg'}`}
                                >
                                    {code}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Terminal;
