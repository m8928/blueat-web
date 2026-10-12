import React, { useEffect, useState } from 'react';
import Terminal from './components/Terminal';
import { content } from './content';

const STORAGE_KEY = 'blueat-lang';

// Saved choice first, then the browser language; Korean browsers get Korean.
function initialLanguage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'ko' || saved === 'en') return saved;
    } catch {
        // Storage can be unavailable (private mode, blocked cookies).
    }
    const browser = typeof navigator !== 'undefined' ? navigator.language || '' : '';
    return browser.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

function App() {
    const [language, setLanguage] = useState(initialLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
        document.title = content[language].title;
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // Ignore; the choice just won't persist.
        }
    }, [language]);

    return <Terminal lang={language} setLang={setLanguage} />;
}

export default App;
