import React from 'react';
import { Mail } from 'lucide-react';

const Footer = ({ t }) => {
    return (
        <footer className="py-16 border-t border-border/50 bg-background">
            <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2 tracking-tight">BLUEAT</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        © {new Date().getFullYear()} BLUEAT. {t.rights}
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <a
                        href="mailto:blueat@blueat.me"
                        className="text-muted-foreground hover:text-foreground transition-colors p-2"
                    >
                        <Mail size={22} />
                        <span className="sr-only">Email</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
