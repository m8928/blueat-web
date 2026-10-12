import React from 'react';
import Mascot from './Mascot';

const Welcome = ({ t, returning, onRun }) => (
    <section aria-labelledby="welcome" className="relative mt-3 rounded-lg border border-accent">
        <span className="absolute -top-[0.8em] left-3 bg-term-bg px-1 text-accent">
            BLUEAT <span className="text-term-dim">v{__BUILD_DATE__}</span>
        </span>
        <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-7 text-center">
                <h1 id="welcome" className="font-bold text-term-bright">
                    <span className="sr-only">BLUEAT — </span>
                    {returning ? t.greeting.returning : t.greeting.first}
                </h1>
                <Mascot className="text-accent" />
                <div className="break-keep">
                    <p className="text-term-muted">{t.tagline}</p>
                    <p className="text-term-dim">~/blueat</p>
                </div>
            </div>
            <div className="border-t border-accent/60 px-5 pb-5 pt-6 sm:border-l sm:border-t-0">
                <h2 className="font-bold text-accent">{t.tipsTitle}</h2>
                <ul>
                    {t.tips.map((tip) => (
                        <li key={tip.cmd} className="break-keep text-term-muted">
                            {tip.before}
                            <button
                                type="button"
                                onClick={() => onRun(tip.cmd)}
                                className="text-term-bright underline decoration-term-dim decoration-dotted underline-offset-4 hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            >
                                {tip.cmd}
                            </button>
                            {tip.after}
                        </li>
                    ))}
                </ul>
                <div aria-hidden="true" className="my-3 border-t border-accent/60" />
                <h2 className="font-bold text-accent">{t.recentTitle}</h2>
                <ul>
                    {t.recent.map((item) => (
                        <li key={item.name} className="break-keep text-term-muted">
                            <span className="text-term-fg">{item.name}</span> · {item.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </section>
);

export default Welcome;
