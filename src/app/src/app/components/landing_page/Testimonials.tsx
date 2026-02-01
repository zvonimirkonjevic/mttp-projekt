"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface TestimonialCardProps {
    stat: string;
    statLabel: string;
    quote: string;
    name: string;
    role: string;
    avatar: string;
}

const TestimonialCard = ({ stat, statLabel, quote, name, role, avatar }: TestimonialCardProps) => (
    <div className="h-full bg-[#0B1121] p-6 md:p-8 flex flex-col justify-between rounded-xl">
        <div>
            <div className="text-white/60 text-xs md:text-sm font-medium mb-1.5 uppercase tracking-wide">
                {statLabel}
            </div>
            <div className="text-5xl md:text-6xl font-sans font-light text-white mb-6 tracking-tight">
                {stat}
            </div>
            <blockquote className="text-sm md:text-base text-white leading-relaxed font-light">
                &ldquo;{quote}&rdquo;
            </blockquote>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-xs">
                {avatar}
            </div>
            <div>
                <div className="text-white font-medium text-sm">{name}</div>
                <div className="text-white/40 text-xs">{role}</div>
            </div>
        </div>
    </div>
);

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            stat: "15%",
            statLabel: "Increase in proposal win rate",
            quote: "Our pitch decks are now more persuasive and data-driven. We've seen a measurable uptick in successful closes since switching.",
            name: "Mario Große",
            role: "Sales Director, SCHMEES",
            avatar: "MG"
        },
        {
            stat: "3x",
            statLabel: "Faster deal cycles with AI-generated decks",
            quote: "We used to spend days polishing sales decks. Now we generate custom, on-brand presentations in minutes for every prospect.",
            name: "Guillermo Rauch",
            role: "CEO, Vercel",
            avatar: "GR"
        },
        {
            stat: "40h",
            statLabel: "Saved per employee each month",
            quote: "The efficiency gains are massive. Our strategy team reclaimed an entire week of work per month just by automating slide formatting.",
            name: "Elena Verna",
            role: "Growth Advisor",
            avatar: "EV"
        },
        {
            stat: "100%",
            statLabel: "Brand compliance across all departments",
            quote: "No more rogue fonts or broken layouts. FlashSlides enforces our design system strictly, so every slide looks pixel-perfect.",
            name: "Yadin Soffer",
            role: "Product Manager",
            avatar: "YS"
        },
        {
            stat: "-50%",
            statLabel: "Reduction in external agency spend",
            quote: "We slashed our design agency budget in half because our internal teams can now produce agency-quality work independently.",
            name: "Ravi Mehta",
            role: "Ex-CPO, Tinder",
            avatar: "RM"
        }
    ];

    const visibleCards = 3;
    const maxIndex = testimonials.length - visibleCards;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    return (
        <section className="pt-12 pb-24 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 bg-[#020957] rounded-[24px] p-8 md:p-16">
                {/* Header */}
                <div className="flex justify-between items-end mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-normal text-white leading-tight mb-4">
                            Hear from the industry leaders.
                        </h2>
                        <p className="text-base text-white/60 max-w-xl leading-relaxed">
                            Powering the narratives of top-tier founders, global strategy firms, and creative agencies.
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="hidden md:flex gap-4">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-[#020957] transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-[#020957] transition-all duration-300"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel Window */}
                <div className="overflow-hidden max-w-[1280px] mx-auto rounded-2xl">
                    <div
                        className="flex gap-6 transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                            width: `${(testimonials.length / visibleCards) * 100}%`
                        }}
                    >
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className="relative flex-1 min-w-[300px] aspect-[4/5] md:aspect-auto"
                                style={{ flexBasis: `${100 / testimonials.length}%` }}
                            >
                                <TestimonialCard {...t} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Nav Only */}
                <div className="flex md:hidden gap-4 mt-8 justify-center">
                    <button
                        onClick={handlePrev}
                        className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Testimonials;
