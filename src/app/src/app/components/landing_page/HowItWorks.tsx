"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface StepDetailsProps {
    step: { num: string; title: string; desc: string };
    isActive: boolean;
    alignRight?: boolean;
    onClick: () => void;
}

const StepDetails = ({
    step,
    isActive,
    alignRight = false,
    onClick
}: StepDetailsProps) => {
    return (
        <div
            className={`cursor-pointer group border-b border-gray-200 relative`}
            onClick={onClick}
        >
            <div className={`py-6 flex flex-col ${alignRight ? "lg:items-end lg:text-right" : ""}`}>

                {/* Title Row */}
                <div className={`flex items-baseline gap-6 ${alignRight ? "lg:flex-row-reverse" : ""} text-navy`}>
                    <span className={`text-sm font-mono font-medium transition-colors duration-300 ${isActive ? "text-brand" : "text-navy/60"}`}>
                        {step.num}
                    </span>
                    <h4 className={`text-lg font-normal transition-colors duration-300 ${isActive ? "text-navy" : "text-navy group-hover:text-brand"}`}>
                        {step.title}
                    </h4>
                </div>

                {/* Description & Active Indicator */}
                <motion.div
                    initial={false}
                    animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                >
                    <div className={`pt-4 pb-2 text-gray-600 leading-relaxed text-sm max-w-sm ${alignRight ? "ml-auto" : ""}`}>
                        {step.desc}
                    </div>

                    {/* Progress / Active Line (Timer) */}
                    <div className="h-0.5 w-full mt-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-brand"
                            initial={false}
                            animate={{ width: isActive ? "100%" : "0%" }}
                            transition={{
                                duration: isActive ? 3.5 : 0,
                                ease: "linear"
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const HowItWorks = () => {
    const [activeStep, setActiveStep] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const totalSteps = 6;

    // Auto-cycle through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % totalSteps);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const structuringSteps = [
        { num: "01", title: "Analyze & Structure", desc: "The system parses your raw notes, documents, and transcripts to identify core insights, autonomously architecting a logical flow that guides the audience from concept to conclusion." },
        { num: "02", title: "Intelligent Drafting", desc: "Transform basic bullets into polished content instantly. The engine balances density and clarity, bypassing hours of manual drafting to deliver persuasive messaging at scale." },
        { num: "03", title: "Refine Message", desc: "From technical deep-dives to commercial pitches, our AI adapts the linguistic nuance of your draft to drive maximum engagement and ensure your key points land effectively." },
    ];

    const designSteps = [
        { num: "01", title: "Apply Layouts", desc: "Never move a text box again. The system intelligently matches your content with the optimal visual structure, automatically arranging elements for the best possible readability and visual hierarchy." },
        { num: "02", title: "Optimize Typography", desc: "Ensure your message lands with precision. We automatically adjust font sizes, weights, and spacing to create a clean, professional look that meets high typographic standards across every slide." },
        { num: "03", title: "Visual Consistency", desc: "Scale your brand without breaking it. The engine enforces your corporate visual identity across the entire deck, ensuring consistent colors, fonts, and styles for a cohesive, on-brand result." },
    ];

    return (
        <section ref={containerRef} className="pb-16 pt-16 bg-white relative overflow-hidden">
            <div className="w-full px-6 lg:px-12">
                {/* Header */}
                <div className="max-w-3xl mb-24">
                    <h2 className="text-2xl md:text-3xl font-normal text-navy mb-4 tracking-tight leading-[1.15]">
                        From raw ideas to polished slides.
                    </h2>
                    <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
                        FlashSlides combines intelligent content structuring with professional slide design-simultaneously.
                    </p>
                </div>

                {/* 2-Column Layout Centered */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start min-h-[500px]">

                    {/* Left Column: Content Structuring */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-normal text-navy mb-8">Content Structuring</h3>
                        <div className="border-t border-gray-200 min-h-[280px]">
                            {structuringSteps.map((step, idx) => (
                                <StepDetails
                                    key={idx}
                                    step={step}
                                    isActive={activeStep === idx}
                                    onClick={() => setActiveStep(idx)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Slide Design */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-normal text-navy mb-8 lg:text-right">Slide Design</h3>
                        <div className="border-t border-gray-200 min-h-[280px]">
                            {designSteps.map((step, idx) => {
                                const globalIndex = idx + 3;
                                return (
                                    <StepDetails
                                        key={idx}
                                        step={step}
                                        isActive={activeStep === globalIndex}
                                        alignRight
                                        onClick={() => setActiveStep(globalIndex)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
