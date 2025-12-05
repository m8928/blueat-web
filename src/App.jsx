import React, { useState } from 'react';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Footer from './components/Footer';
import LanguageToggle from './components/LanguageToggle';
import { translations } from './translations';

function App() {
    const [language, setLanguage] = useState('ko');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ko' : 'en');
    };

    const t = translations[language];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground/10 selection:text-foreground">
            <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
            <main>
                <Hero t={t.hero} />
                <Portfolio t={t.portfolio} />
            </main>
            <Footer t={t.footer} />
        </div>
    );
}

export default App;
