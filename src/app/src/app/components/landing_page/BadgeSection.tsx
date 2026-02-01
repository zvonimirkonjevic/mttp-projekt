"use client";

import { motion } from "framer-motion";

const BadgeSection = () => {
    return (
        <section className="pt-48 pb-12 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                {/* Connected border frame with tagline */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Full border container with rounded corners */}
                    <div className="border border-gray-300 rounded-lg py-12 px-8">
                        {/* Tagline positioned on top border */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-6">
                            <p className="text-center text-gray-900 text-base font-medium whitespace-nowrap">
                                The enterprise standard for AI-powered presentation creation
                            </p>
                        </div>

                        {/* Certification Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-12">
                            <motion.img
                                src="/assets/soc2_badge.png"
                                alt="SOC2 Certified"
                                className="h-20 w-auto grayscale opacity-80"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 0.8, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            />
                            <motion.img
                                src="/assets/iso27001_badge.png"
                                alt="ISO 27001 Certified"
                                className="h-20 w-auto grayscale opacity-80"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 0.8, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BadgeSection;
