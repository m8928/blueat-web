import React, { useEffect, useState } from 'react';
import Terminal from './components/Terminal';
import { content } from './content';

const STORAGE_KEY = 'blueat-lang';
const VISITED_KEY = 'blueat-visited';

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

function readVisited() {
    try {
        return localStorage.getItem(VISITED_KEY) === '1';
    } catch {
        return false;
    }
}

function App() {
    const [language, setLanguage] = useState(initialLanguage);
    // Read once: first-time visitors get the typed demo, returning ones see it finished.
    const [returning] = useState(readVisited);

    useEffect(() => {
        try {
            localStorage.setItem(VISITED_KEY, '1');
        } catch {
            // Ignore; they'll just see the demo again.
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        document.title = content[language].title;
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // Ignore; the choice just won't persist.
        }
    }, [language]);

    return <Terminal lang={language} setLang={setLanguage} returning={returning} />;
}

export default App;
