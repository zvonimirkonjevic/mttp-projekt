"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Edit3 } from "lucide-react";

const TransformationDemo = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Transform scroll progress to determine which view to show
    // When scrolled past 45% of the section visibility, show the generated results
    const hasGenerated = useTransform(scrollYProgress, (value) => value > 0.35);
    const [showGenerated, setShowGenerated] = useState(false);

    useEffect(() => {
        const unsubscribe = hasGenerated.on("change", (latest) => {
            setShowGenerated(latest);
        });
        return () => unsubscribe();
    }, [hasGenerated]);

    return (
        <section ref={sectionRef} className="bg-white pt-0 pb-16 md:pb-24 overflow-hidden relative">
            <div className="w-full px-6 lg:px-12 relative z-10">
                <div className="relative min-h-[700px]">
                    <AnimatePresence mode="wait" initial={false}>
                        {!showGenerated ? (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                                className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center will-change-transform"
                            >
                                {/* Left Column: Text */}
                                <div className="text-left max-w-lg">
                                    <h2 className="text-2xl md:text-3xl text-navy font-normal tracking-tight mb-6 leading-[1.15]">
                                        Bypass the blank canvas.
                                    </h2>
                                    <p className="text-base text-gray-600 mb-8 max-w-lg leading-relaxed">
                                        Transform raw ideas into structured content and professional design instantly - upload strategy docs, paste rough bullet points, or simply describe your intent to create a polished deck.
                                    </p>
                                </div>

                                {/* Right Column: Input Simulation */}
                                <div>
                                    <div
                                        className="bg-white border border-gray-200 rounded-2xl p-2 pl-6 flex items-center justify-between group shadow-lg w-full"
                                    >
                                        <div className="flex items-center gap-4 text-navy text-lg font-light truncate">
                                            <span className="text-gray-400 shrink-0"><Edit3 className="w-5 h-5" /></span>
                                            <span className="truncate">Q4 Financial Performance Review</span>
                                        </div>
                                        <div
                                            className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white shrink-0 m-1"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
                                className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center will-change-transform"
                            >
                                <div className="max-w-lg">
                                    <h2 className="text-2xl md:text-3xl text-navy font-normal tracking-tight mb-6 leading-[1.15]">
                                        Complex ideas, visualized instantly.
                                    </h2>
                                    <p className="text-base text-gray-600 max-w-xl leading-relaxed">
                                        FlashSlides synthesizes unstructured data into high-fidelity slides, autonomously crafting the story logic and the layout system to accelerate your workflow.
                                    </p>
                                </div>

                                {/* Slide Visuals - Financial Chart Mockup */}
                                <div className="relative w-full aspect-[16/10]">
                                    {/* Background Stack Effect */}
                                    <motion.div
                                        initial={{ scale: 0.94, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="absolute -right-4 -bottom-4 w-full h-full bg-white border border-gray-200 rounded-xl opacity-50 z-0"
                                    />

                                    {/* Main Slide Card */}
                                    <motion.div
                                        initial={{ scale: 0.97, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="absolute inset-0 bg-[#000] border border-gray-200 rounded-xl overflow-hidden shadow-2xl z-10 flex"
                                    >
                                        {/* Slide Content: Financial Charts (Blue Theme) */}
                                        <div className="w-full h-full bg-white p-6 lg:p-10 flex flex-col relative">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <div className="text-xs font-mono text-gray-400 mb-1">FY 2024 REVIEW</div>
                                                    <h3 className="text-2xl font-semibold text-navy">Revenue Growth Analysis</h3>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-brand" />
                                                    <div className="w-2 h-2 rounded-full bg-brand/30" />
                                                </div>
                                            </div>

                                            {/* Charts Area */}
                                            <div className="flex-1 flex gap-8">
                                                {/* Left: Bar Chart */}
                                                <div className="flex-1 flex flex-col justify-end gap-2 pb-4 border-b border-gray-100 relative">
                                                    <div className="flex items-end justify-between h-32 lg:h-40 px-2 gap-2">
                                                        {[35, 55, 45, 70, 65, 90].map((h, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${h}%` }}
                                                                transition={{ delay: 0.4 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                                                                className={`w-full rounded-t-sm ${i === 5 ? 'bg-brand' : 'bg-brand/20'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-gray-400 px-1 font-mono">
                                                        <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
                                                    </div>
                                                </div>

                                                {/* Right: Key Insight */}
                                                <div className="w-1/3 flex flex-col justify-center">
                                                    <div className="bg-brand/5 p-4 rounded-lg border border-brand/10 mb-4">
                                                        <div className="text-sm text-gray-500 mb-1">YoY Growth</div>
                                                        <div className="text-3xl font-bold text-brand">+24.8%</div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        Exceeded annual targets primarily driven by enterprise acquisition in Q4.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                                                <span>Confidential - For Internal Use Only</span>
                                                <span>24</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default TransformationDemo;
