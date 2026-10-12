import React, { useEffect, useRef, useState } from 'react';

// Choice dialog shown in place of the prompt, like a CLI permission prompt.
const AskDialog = ({ step, onAnswer }) => {
    const [selected, setSelected] = useState(0);
    const buttons = useRef([]);
    const count = step.options.length;

    useEffect(() => {
        buttons.current[0]?.focus({ preventScroll: true });
    }, []);

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const next = (selected + (e.key === 'ArrowDown' ? 1 : -1) + count) % count;
            buttons.current[next]?.focus();
        } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= count) {
            e.preventDefault();
            onAnswer(Number(e.key) - 1);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onAnswer(count - 1);
        }
    };

    return (
        <div
            role="group"
            aria-labelledby="ask-question"
            onKeyDown={onKeyDown}
            className="mt-6 rounded-lg border border-accent px-4 py-3"
        >
            <p className="font-bold text-term-bright">{step.title}</p>
            <p className="mt-[1.6em] break-all pl-[2ch] text-term-muted">{step.detail}</p>
            <p id="ask-question" className="mt-[1.6em] break-keep text-term-fg">{step.question}</p>
            <ul className="mt-1">
                {step.options.map((option, i) => (
                    <li key={option.label}>
                        <button
                            ref={(el) => { buttons.current[i] = el; }}
                            type="button"
                            onClick={() => onAnswer(i)}
                            onFocus={() => setSelected(i)}
                            className={`flex min-h-10 w-full items-center text-left focus:outline-none ${i === selected ? 'text-accent' : 'text-term-fg hover:text-term-bright'}`}
                        >
                            <span aria-hidden="true" className="inline-block w-[2ch]">{i === selected ? '❯' : ''}</span>
                            <span className="break-keep">{i + 1}. {option.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AskDialog;
