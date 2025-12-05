import React from 'react';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ language, toggleLanguage }) => {
    return (
        <button
            onClick={toggleLanguage}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-md border border-border rounded-full hover:bg-background/80 transition-colors shadow-sm group"
            aria-label="Toggle Language"
        >
            <Globe size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-foreground">
                {language === 'en' ? 'KO' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageToggle;
