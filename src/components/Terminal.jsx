import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COMMAND_NAMES, content, resolveCommand } from '../content';
import { lineLength, plainText } from '../lib/rich';
import AskDialog from './AskDialog';
import Welcome from './Welcome';
import { AnswerLine, InterruptedLine, Spinner, StepBlock, UserLine } from './Transcript';

// Commands typed automatically on a first visit.
const AUTOPLAY = ['/about', '/projects'];

const matchesMedia = (query) => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
const reducedMotion = () => matchesMedia('(prefers-reduced-motion: reduce)');
const finePointer = () => matchesMedia('(pointer: fine)');

// The same conversation, already finished, for returning visitors and reduced motion.
function introBlocks() {
    return AUTOPLAY.flatMap((cmd) => {
        const key = cmd.slice(1);
        return [
            { id: `intro-${key}`, type: 'user', text: cmd },
            ...content.ko.replies[key].map((_, index) => ({ id: `intro-${key}-${index}`, type: 'step', key, index, status: 'done' })),
        ];
    });
}

const Terminal = ({ lang, setLang, returning }) => {
    const t = content[lang];
    const [blocks, setBlocks] = useState(() => (returning || reducedMotion() ? introBlocks() : []));
    const [work, setWork] = useState(null); // { verb, start } while a reply is being produced
    const [ask, setAsk] = useState(null); // { key, index } while a choice dialog is open
    const [input, setInput] = useState('');
    const [sel, setSel] = useState(0);
    const [history, setHistory] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [announcement, setAnnouncement] = useState('');

    const inputRef = useRef(null);
    const timers = useRef(new Set());
    const nextId = useRef(0);
    const queued = useRef(null);
    const onIdle = useRef(null);
    const autoplay = useRef({ on: false, typed: '', strip: '' });
    const stickToBottom = useRef(true);
    const hasRendered = useRef(false);
    const askWasOpen = useRef(false);

    // Timers and replies outlive renders, so they read the latest state through refs.
    const langRef = useRef(lang);
    const workRef = useRef(work);
    const askRef = useRef(ask);
    langRef.current = lang;
    workRef.current = work;
    askRef.current = ask;

    const query = input.trim().toLowerCase();
    const matches = query.startsWith('/') && !query.includes(' ')
        ? COMMAND_NAMES.filter((name) => name.startsWith(query))
        : [];
    const menuOpen = !ask && matches.length > 0;
    const active = Math.min(sel, matches.length - 1);

    const schedule = useCallback((fn, ms) => {
        const id = setTimeout(() => {
            timers.current.delete(id);
            fn();
        }, ms);
        timers.current.add(id);
    }, []);

    const cancelAll = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
    }, []);

    useEffect(() => cancelAll, [cancelAll]);

    const newId = () => `b${nextId.current++}`;
    const updateBlock = (id, patch) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

    const setWorking = (value) => {
        workRef.current = value;
        setWork(value);
    };

    const finish = () => {
        setWorking(null);
        if (queued.current) {
            const text = queued.current;
            queued.current = null;
            schedule(() => run(text), 300);
            return;
        }
        onIdle.current?.();
    };

    // Plays a reply's steps one after another: tool lines, streamed text, then any dialog.
    const playSteps = (key, index) => {
        const steps = content[langRef.current].replies[key];
        if (index >= steps.length) {
            finish();
            return;
        }
        const step = steps[index];
        const fast = reducedMotion();
        const id = newId();
        const next = (delay) => schedule(() => playSteps(key, index + 1), fast ? 0 : delay);

        if (step.kind === 'tool') {
            setBlocks((bs) => [...bs, { id, type: 'step', key, index, status: 'running' }]);
            schedule(() => {
                updateBlock(id, { status: 'done' });
                next(250);
            }, fast ? 0 : 550);
            return;
        }

        if (step.kind === 'say') {
            const total = step.lines.reduce((n, line) => n + lineLength(line), 0);
            const done = () => {
                updateBlock(id, { status: 'done' });
                setAnnouncement(step.lines.map(plainText).join(' '));
                next(200);
            };
            setBlocks((bs) => [...bs, { id, type: 'step', key, index, status: fast ? 'done' : 'streaming', chars: 0 }]);
            if (fast) {
                done();
                return;
            }
            const tick = (chars) => {
                if (chars >= total) {
                    done();
                    return;
                }
                updateBlock(id, { chars });
                schedule(() => tick(chars + 2), 18);
            };
            tick(0);
            return;
        }

        setWorking(null);
        askRef.current = { key, index };
        setAsk({ key, index });
    };

    const run = (raw) => {
        const text = raw.trim();
        if (!text || workRef.current || askRef.current) return false;
        const key = resolveCommand(text);
        setHistory((h) => [...h, text]);
        if (key === 'clear') {
            setBlocks([]);
            return true;
        }
        setBlocks((bs) => [...bs, { id: newId(), type: 'user', text }]);
        setWorking({ verb: Math.floor(Math.random() * content[langRef.current].verbs.length), start: Date.now() });
        schedule(() => {
            if (key.startsWith('lang')) {
                const target = key === 'lang' ? (langRef.current === 'ko' ? 'en' : 'ko') : key.slice(5);
                langRef.current = target;
                setLang(target);
                playSteps('lang', 0);
            } else {
                playSteps(key, 0);
            }
        }, reducedMotion() ? 100 : 800);
        return true;
    };

    // Stops the first-visit demo. Returns whatever it had typed into the prompt.
    const stopAutoplay = () => {
        const state = autoplay.current;
        if (!state.on) return '';
        state.on = false;
        onIdle.current = null;
        const typed = state.typed;
        if (typed) {
            // Typing only happens while idle, so this cancels the typing and nothing else.
            cancelAll();
            state.typed = '';
            state.strip = typed;
            setInput('');
        }
        return typed;
    };

    const interrupt = () => {
        if (!workRef.current) return;
        stopAutoplay();
        cancelAll();
        queued.current = null;
        setBlocks((bs) => [
            ...bs.map((b) => (b.type === 'step' && (b.status === 'running' || b.status === 'streaming') ? { ...b, status: 'cut' } : b)),
            { id: newId(), type: 'interrupted' },
        ]);
        setWorking(null);
    };

    const answer = (optionIndex) => {
        const current = askRef.current;
        if (!current) return;
        const option = content[langRef.current].replies[current.key][current.index].options[optionIndex];
        const record = (failed) => {
            setBlocks((bs) => [...bs, { id: newId(), type: 'answer', key: current.key, index: current.index, option: optionIndex, failed }]);
            askRef.current = null;
            setAsk(null);
            playSteps(current.key, current.index + 1);
        };
        const { action } = option;
        if (action.type === 'open') window.open(action.url, '_blank', 'noopener,noreferrer');
        if (action.type === 'mailto') window.location.href = `mailto:${action.email}`;
        if (action.type === 'copy') {
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(action.text).then(() => record(false), () => record(true));
            } else {
                record(true);
            }
            return;
        }
        record(false);
    };

    const submit = (raw) => {
        const text = raw.trim();
        if (!text || askRef.current) return;
        if (workRef.current) {
            queued.current = text;
        } else {
            run(text);
        }
        setInput('');
        setSel(0);
        setCursor(null);
        setShowShortcuts(false);
    };

    const runFromClick = (cmd) => {
        stopAutoplay();
        autoplay.current.strip = '';
        submit(cmd);
        if (finePointer()) inputRef.current?.focus({ preventScroll: true });
    };

    // First visit: type and run the demo commands, unless the visitor takes over.
    useEffect(() => {
        if (returning || reducedMotion()) return undefined;
        const state = autoplay.current;
        state.on = true;
        const queue = [...AUTOPLAY];
        const typeNext = () => {
            if (!state.on) return;
            const cmd = queue.shift();
            if (!cmd) {
                state.on = false;
                onIdle.current = null;
                return;
            }
            let n = 0;
            const typeChar = () => {
                if (!state.on) return;
                n += 1;
                state.typed = cmd.slice(0, n);
                setInput(state.typed);
                if (n < cmd.length) {
                    schedule(typeChar, 75);
                    return;
                }
                schedule(() => {
                    if (!state.on) return;
                    state.typed = '';
                    setInput('');
                    run(cmd);
                }, 450);
            };
            schedule(typeChar, 75);
        };
        onIdle.current = () => schedule(typeNext, 1000);
        schedule(typeNext, 1200);
        return () => {
            state.on = false;
            onIdle.current = null;
            cancelAll();
        };
        // Runs once on mount; everything it calls reads state through refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Focus the prompt on desktop only, so phones don't pop the keyboard on load.
    useEffect(() => {
        if (finePointer()) inputRef.current?.focus({ preventScroll: true });
    }, []);

    // Return focus to the prompt after a dialog closes.
    useEffect(() => {
        if (askWasOpen.current && !ask && finePointer()) inputRef.current?.focus({ preventScroll: true });
        askWasOpen.current = !!ask;
    }, [ask]);

    // Follow new output, unless the visitor has scrolled up to read.
    useEffect(() => {
        const onScroll = () => {
            const doc = document.documentElement;
            stickToBottom.current = window.innerHeight + window.scrollY >= doc.scrollHeight - 120;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!hasRendered.current) {
            hasRendered.current = true;
            return;
        }
        if (stickToBottom.current) window.scrollTo({ top: document.documentElement.scrollHeight });
    }, [blocks, work, ask]);

    // "/" anywhere opens the command menu; Esc anywhere interrupts.
    const latest = useRef({});
    latest.current = { interrupt, stopAutoplay };
    useEffect(() => {
        const onKey = (e) => {
            const el = document.activeElement;
            const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
            if (e.key === 'Escape' && !typing && workRef.current && !askRef.current) {
                latest.current.interrupt();
                return;
            }
            if (e.key !== '/' || typing || askRef.current || e.metaKey || e.ctrlKey || e.altKey) return;
            e.preventDefault();
            latest.current.stopAutoplay();
            autoplay.current.strip = '';
            setInput('/');
            setSel(0);
            inputRef.current?.focus();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const onChange = (e) => {
        let value = e.target.value;
        const { strip } = autoplay.current;
        if (strip) {
            // The visitor started typing over the demo; keep only what they typed.
            if (value.startsWith(strip)) value = value.slice(strip.length);
            autoplay.current.strip = '';
        }
        setInput(value);
        setSel(0);
    };

    const onKeyDown = (e) => {
        const typed = stopAutoplay();
        if (typed && (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape' || e.key.startsWith('Arrow'))) {
            e.preventDefault();
            autoplay.current.strip = '';
            return;
        }
        // Let the IME finish composing Hangul before Enter submits.
        if (e.nativeEvent.isComposing) return;
        if (e.key === '?' && input === '') {
            e.preventDefault();
            setShowShortcuts((s) => !s);
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            if (workRef.current) {
                interrupt();
            } else {
                setInput('');
                setSel(0);
                setShowShortcuts(false);
            }
            return;
        }
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
        if (e.key === 'Enter') {
            e.preventDefault();
            submit(menuOpen ? matches[active] : input);
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

    const renderBlock = (block) => {
        switch (block.type) {
            case 'user':
                return <UserLine key={block.id} text={block.text} />;
            case 'step':
                return <StepBlock key={block.id} block={block} replies={t.replies} />;
            case 'answer': {
                const option = t.replies[block.key][block.index].options[block.option];
                return <AnswerLine key={block.id} text={block.failed ? t.copyFailed : option.result} />;
            }
            case 'interrupted':
                return <InterruptedLine key={block.id} text={t.interrupted} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-12">
            <main className="mx-auto max-w-[880px]">
                <Welcome t={t} returning={returning} onRun={runFromClick} />

                <section aria-label={t.transcriptLabel}>
                    {blocks.map(renderBlock)}
                    {work && <Spinner verb={t.verbs[work.verb]} start={work.start} hint={t.interruptHint} />}
                </section>
                <p className="sr-only" aria-live="polite">{announcement}</p>

                {ask ? (
                    <AskDialog key={`${ask.key}-${ask.index}`} step={t.replies[ask.key][ask.index]} onAnswer={answer} />
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit(menuOpen ? matches[active] : input);
                        }}
                        className="mt-6 flex items-center gap-[1ch] border-y border-term-line py-2.5"
                    >
                        <span aria-hidden="true" className="pl-1">&gt;</span>
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
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            onPointerDown={() => stopAutoplay()}
                            placeholder={t.placeholder}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            enterKeyHint="send"
                            className="h-[30px] min-w-0 flex-1 bg-transparent text-term-bright caret-accent placeholder:text-term-dim focus:outline-none"
                        />
                    </form>
                )}

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
                                className={`grid min-h-10 cursor-pointer grid-cols-[13ch_minmax(0,1fr)] items-center px-1 ${i === active ? 'text-accent' : 'text-term-fg'}`}
                            >
                                <span>{name}</span>
                                <span className={i === active ? 'text-accent' : 'text-term-dim'}>{t.commands[name]}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex items-start justify-between gap-4 px-1 pt-1 text-[13px] text-term-dim">
                    {ask && <span className="break-keep py-3">{t.askHint}</span>}
                    {!ask && showShortcuts && (
                        <ul className="grid grid-cols-[repeat(2,max-content)] gap-x-8 py-3 sm:grid-cols-[repeat(3,max-content)]">
                            {t.shortcuts.map(([keys, desc]) => (
                                <li key={keys}><span className="text-term-fg">{keys}</span> {desc}</li>
                            ))}
                        </ul>
                    )}
                    {!ask && !showShortcuts && (
                        <button type="button" onClick={() => setShowShortcuts(true)} className="min-h-11 hover:text-term-fg">
                            {t.hint}
                        </button>
                    )}
                    <div role="group" aria-label={t.langLabel} className="ml-auto flex shrink-0 items-center">
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
