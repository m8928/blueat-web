import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ t }) => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background">
            <div className="container relative z-10 px-4 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1.5 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-8 tracking-wide">
                        {t.status}
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-foreground leading-[1.1]">
                        {t.title1} <br />
                        <span className="text-foreground/80">{t.title2}</span>
                    </h1>
                    <p className="text-xl md:text-3xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        {t.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <a
                            href="#portfolio"
                            className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-xl shadow-primary/20"
                        >
                            {t.viewWork}
                        </a>
                        <a
                            href="mailto:blueat@blueat.me"
                            className="text-lg font-semibold text-primary hover:opacity-70 transition-opacity flex items-center gap-1 group"
                        >
                            {t.contact} <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
