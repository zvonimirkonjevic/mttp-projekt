"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SubtleTransitionLink from "../SubtleTransitionLink";
import CountUp from "./CountUp";

const HeroBackground = dynamic(() => import("../HeroBackground"), { ssr: false });

const Hero = () => {
    return (
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white">
            {/* Silk Background Container */}
            <div className="absolute top-16 bottom-0 left-12 right-12 rounded-3xl overflow-hidden">
                <HeroBackground
                    speed={3}
                    scale={0.8}
                    color="#1a2fee"
                    noiseIntensity={0}
                    rotation={0.2}
                    className="absolute inset-0"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center pt-24 pb-48">
                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-[1.15] tracking-tight"
                >
                    Fastest presentation creation{" "}
                    <span className="text-white/80">&</span> intelligent design{" "}
                    <br className="hidden md:block" />
                    automation for enterprises
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
                >
                    FlashSlides is AI-powered presentation software: content structuring,
                    intelligent design refinement and enterprise-grade privacy in one platform.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <SubtleTransitionLink href="/signup" className="px-8 py-3.5 bg-white text-brand font-medium rounded-full transition-all duration-300 hover:bg-white/90 hover:text-[#020957]">
                        Get Started
                    </SubtleTransitionLink>

                    <SubtleTransitionLink href="/book-demo" className="px-8 py-3.5 border border-white/40 text-white font-medium rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/60">
                        Book a Demo
                    </SubtleTransitionLink>
                </motion.div>
            </div>

            {/* Stat Cards */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="absolute bottom-12 left-0 right-0 z-10 px-6"
            >
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-8 py-6 text-center">
                        <div className="text-4xl font-light text-white tracking-tight mb-1">
                            &lt;<CountUp end={5} suffix=" min" />
                        </div>
                        <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
                            Generation Time
                        </p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-8 py-6 text-center">
                        <div className="text-4xl font-light text-white tracking-tight mb-1">
                            <CountUp end={10000} prefix="" suffix="+" />
                        </div>
                        <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
                            Presentations Created
                        </p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-8 py-6 text-center">
                        <div className="text-4xl font-light text-white tracking-tight mb-1">
                            <CountUp end={200} suffix="x" />
                        </div>
                        <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
                            Faster Creation
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
