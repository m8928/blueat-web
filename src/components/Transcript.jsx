import React, { useEffect, useState } from 'react';
import { lineLength, parseRich } from '../lib/rich';

const FRAMES = ['·', '✢', '✶', '✻', '✽', '✻', '✶', '✢'];

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
    red: 'text-term-red',
};

function Rich({ text, limit = Infinity }) {
    let left = limit;
    return parseRich(text).map((seg, i) => {
        if (left <= 0) return null;
        const shown = seg.text.slice(0, left);
        left -= seg.text.length;
        if (seg.style === 'bold') return <strong key={i} className="font-bold text-term-bright">{shown}</strong>;
        if (seg.style === 'code') return <code key={i} className="text-accent">{shown}</code>;
        return <React.Fragment key={i}>{shown}</React.Fragment>;
    });
}

function Line({ line, limit }) {
    if (line.cols) {
        return (
            <div className="grid grid-cols-[12ch_minmax(0,28ch)_auto] justify-start gap-x-[2ch] max-sm:grid-cols-[9ch_minmax(min-content,1fr)_auto] max-sm:gap-x-[1ch]">
                {line.cols.map((col, i) => (
                    <span key={i} className={`break-keep ${TONES[col.tone || 'fg']}`}>{col.text}</span>
                ))}
            </div>
        );
    }
    if (line.href) {
        const external = line.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};
        return (
            <div>
                <a
                    href={line.href}
                    className="text-accent underline decoration-dotted underline-offset-4 hover:decoration-solid"
                    {...external}
                >
                    {line.text}
                </a>
            </div>
        );
    }
    return (
        <div className={`whitespace-pre-wrap break-keep ${TONES[line.tone || 'fg']}`}>
            {line.bullet && <span aria-hidden="true" className="text-term-dim">• </span>}
            <Rich text={line.text} limit={limit} />
        </div>
    );
}

// "⎿" continuation row hanging under the previous item.
function Result({ children, first = true }) {
    return (
        <div className="grid grid-cols-[2ch_3ch_minmax(0,1fr)]">
            <span />
            <span aria-hidden="true" className="text-term-dim">{first ? '⎿' : ''}</span>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export function UserLine({ text }) {
    return (
        <div className="-mx-2 mt-6 grid grid-cols-[2ch_minmax(0,1fr)] rounded bg-white/[0.04] px-2 text-term-muted">
            <span aria-hidden="true">&gt;</span>
            <span className="whitespace-pre-wrap break-all">{text}</span>
        </div>
    );
}

function ToolStep({ step, status }) {
    const dot = {
        running: 'text-term-dim motion-safe:animate-pulse',
        cut: 'text-term-red',
        done: 'text-term-green',
    }[status];
    return (
        <div className="mt-3.5">
            <div className="grid grid-cols-[2ch_minmax(0,1fr)]">
                <span aria-hidden="true" className={dot}>●</span>
                <div className="break-all">
                    <span className="font-bold text-term-bright">{step.name}</span>
                    <span className="text-term-muted">(</span>
                    {step.arg}
                    <span className="text-term-muted">)</span>
                </div>
            </div>
            {status === 'done' && step.result.map((line, i) => (
                <Result key={i} first={i === 0}><Line line={line} /></Result>
            ))}
        </div>
    );
}

// Renders a "say" step, showing only the first `limit` characters while it streams.
function SayStep({ step, limit }) {
    let left = limit;
    const shown = [];
    step.lines.forEach((line, i) => {
        if (left <= 0) return;
        const length = lineLength(line);
        if (length <= left) {
            shown.push(<Line key={i} line={line} />);
            left -= length;
        } else {
            if (!line.cols && !line.href) shown.push(<Line key={i} line={line} limit={left} />);
            left = 0;
        }
    });
    return (
        <div className="mt-3.5 grid grid-cols-[2ch_minmax(0,1fr)]">
            <span aria-hidden="true" className="text-term-bright">●</span>
            <div className="min-w-0">{shown.length ? shown : ' '}</div>
        </div>
    );
}

export function StepBlock({ block, replies }) {
    const step = replies[block.key][block.index];
    if (step.kind === 'tool') return <ToolStep step={step} status={block.status} />;
    if (step.kind === 'say') {
        const limit = block.status === 'done' ? Infinity : block.chars ?? 0;
        return <SayStep step={step} limit={limit} />;
    }
    return null;
}

export function AnswerLine({ text }) {
    return <Result><span className="text-term-dim">{text}</span></Result>;
}

export function InterruptedLine({ text }) {
    return <Result><span className="text-term-red">{text}</span></Result>;
}

export function Spinner({ verb, start, hint }) {
    const [frame, setFrame] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => {
            setFrame((f) => (f + 1) % FRAMES.length);
            setNow(Date.now());
        }, 120);
        return () => clearInterval(id);
    }, []);

    const seconds = Math.max(0, Math.floor((now - start) / 1000));
    return (
        <div aria-hidden="true" className="mt-3.5 grid grid-cols-[2ch_minmax(0,1fr)]">
            <span className="text-accent">{FRAMES[frame]}</span>
            <span>
                <span className="shimmer">{verb}…</span>{' '}
                <span className="text-term-dim">({seconds}s · {hint})</span>
            </span>
        </div>
    );
}
