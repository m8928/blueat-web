import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

const Portfolio = ({ t }) => {
    // Add image/link properties that are not translatable but needed for rendering
    // We merge these with the translated project data
    const projectsMetadata = [
        {
            link: "https://sffe.blueat.me/",
            image: "linear-gradient(to bottom right, #333333, #000000)"
        },
        {
            link: "#",
            image: "linear-gradient(to bottom right, #666666, #333333)"
        }
    ];

    const projects = t.projects.map((project, index) => ({
        ...project,
        ...projectsMetadata[index]
    }));

    return (
        <section id="portfolio" className="py-32 bg-background px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{t.title}</h2>
                    <p className="text-muted-foreground text-2xl font-medium max-w-2xl mx-auto">{t.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group relative rounded-[2.5rem] overflow-hidden bg-card hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 ease-out"
                        >
                            <div className="flex flex-col h-full">
                                {/* Image Area */}
                                <div
                                    className="h-80 w-full overflow-hidden"
                                    style={{ background: project.image }}
                                >
                                    <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[2px]">
                                        <a href={project.link} target="_blank" rel="noreferrer" className="bg-white/90 p-5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            <ExternalLink className="text-black w-6 h-6" />
                                        </a>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-10 flex flex-col flex-grow">
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3 tracking-tight">{project.title}</h3>
                                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed flex-grow">
                                        {project.description}
                                    </p>
                                    <div className="pt-4">
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-[15px] font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                                        >
                                            {t.visit} <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Portfolio;
