"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Rocket } from "lucide-react";

const IndustrySolutions = () => {
    const [activeIndustry, setActiveIndustry] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const industries = [
        {
            category: "Financial Services",
            name: "Investment Banking",
            description: "Generate pitch books and deal memos with automated data integration. FlashSlides pulls live market data and structures persuasive narratives for M&A, IPO, and fundraising presentations.",
            rawInput: [
                "// Q4 deal memo notes",
                "- target valuation: $2.3B (need to verify)",
                "- synergies estimate ~$150M annually",
                "- comparable transactions: Acme/Corp merger",
                "- TODO: add DCF model outputs",
            ],
            slides: [
                { title: "Executive Summary", status: "Complete", type: "slide" },
                { title: "Market Analysis", status: "Formatting", type: "slide" },
                { title: "Financial Projections", status: "Generating", type: "chart" },
            ]
        },
        {
            category: "Strategy Consulting",
            name: "Management Consulting",
            description: "Standardize frameworks and strategy maps across thousands of client deliverables. Ensure every deck follows your firm's methodology while adapting to each client's unique context.",
            rawInput: [
                "// Client engagement notes",
                "- current market share: 12% (declining)",
                "- 3 strategic options identified",
                "- need McKinsey 7S framework",
                "- CEO wants focus on digital transformation",
            ],
            slides: [
                { title: "Situation Analysis", status: "Complete", type: "slide" },
                { title: "Strategic Options", status: "Complete", type: "slide" },
                { title: "Implementation Roadmap", status: "Formatting", type: "chart" },
            ]
        },
        {
            category: "Technology",
            name: "Product Management",
            description: "Visualize product roadmaps and technical architecture without manual drawing. Automatically generate sprint reviews, feature briefs, and stakeholder updates from your backlog data.",
            rawInput: [
                "// Sprint 24 planning",
                "- auth v2 migration (P0, 8 pts)",
                "- dashboard redesign blocked on design",
                "- API rate limiting - carry over",
                "- Q2 OKR: 40% latency reduction",
            ],
            slides: [
                { title: "Product Vision", status: "Complete", type: "slide" },
                { title: "Roadmap Timeline", status: "Complete", type: "chart" },
                { title: "Technical Architecture", status: "Generating", type: "diagram" },
            ]
        },
        {
            category: "Healthcare",
            name: "Life Sciences",
            description: "Synthesize clinical trial data into clear, compliant visual narratives. Generate regulatory submissions and medical affairs presentations that meet strict industry standards.",
            rawInput: [
                "// Phase III trial results",
                "- n=1,247 patients enrolled",
                "- primary endpoint met (p<0.001)",
                "- AE profile consistent w/ Phase II",
                "- FDA submission target: Q2 2025",
            ],
            slides: [
                { title: "Trial Overview", status: "Complete", type: "slide" },
                { title: "Efficacy Data", status: "Formatting", type: "chart" },
                { title: "Safety Profile", status: "Generating", type: "slide" },
            ]
        },
    ];

    // Detect when section is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting && entry.intersectionRatio > 0.5);
            },
            { threshold: 0.5 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Auto-cycle through industries every 8 seconds, only when in view
    useEffect(() => {
        if (!isInView) return;

        const interval = setInterval(() => {
            setActiveIndustry((prev) => (prev + 1) % industries.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [industries.length, isInView]);

    const active = industries[activeIndustry];

    return (
        <section ref={sectionRef} className="pt-24 pb-40 bg-white overflow-hidden">
            <div className="w-full px-6 lg:px-12">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-start">

                    {/* Left Column: Industry Selector */}
                    <div>
                        {/* Section Header */}
                        <h2 className="text-2xl md:text-3xl font-normal text-navy tracking-tight leading-[1.15] mb-6">
                            Adaptive Intelligence for<br />every sector.
                        </h2>

                        {/* Industry List */}
                        <div className="space-y-1">
                            {industries.map((industry, i) => (
                                <div key={i}>
                                    <button
                                        onClick={() => setActiveIndustry(i)}
                                        className={`w-full text-left py-4 transition-colors duration-300 border-b border-gray-100 ${activeIndustry === i ? "text-navy" : "text-gray-400 hover:text-navy"
                                            }`}
                                    >
                                        <span className="text-lg font-normal">{industry.category}</span>
                                    </button>

                                    {/* Expanded Content for Active Industry */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: activeIndustry === i ? "auto" : 0,
                                            opacity: activeIndustry === i ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="py-4 pl-4 border-l-2 border-brand ml-2">
                                            <h3 className="text-base font-medium text-navy mb-2">{industry.name}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {industry.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual */}
                    <div className="relative rounded-[24px] overflow-hidden bg-[#020957] p-8 lg:p-12 min-h-[500px] flex items-center justify-center">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        {/* Workflow Visual - Raw Content to Presentation */}
                        <div className="relative z-10 w-full max-w-lg">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={activeIndustry}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Input: Raw Unstructured Content */}
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Raw Input</span>
                                        </div>
                                        <div className="space-y-2 font-mono text-xs text-white/70 leading-relaxed">
                                            {active.rawInput.map((line, i) => (
                                                <p key={i} className={i === 0 || i === active.rawInput.length - 1 ? "text-white/40" : ""}>
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Processing Indicator */}
                                    <div className="flex items-center justify-center gap-4 py-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand/20 border border-brand/30">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full"
                                            />
                                            <span className="text-xs font-medium text-brand">Structuring</span>
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
                                    </div>

                                    {/* Output: Professional Presentation */}
                                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                                        {/* Slide Header Bar */}
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{active.name}_deck.pptx</span>
                                        </div>

                                        {/* Slide Content Preview */}
                                        <div className="p-4 space-y-3">
                                            {/* Slide Thumbnails - More Realistic */}
                                            <div className="flex gap-3">
                                                {active.slides.map((slide, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 aspect-[4/3] rounded-lg border-2 p-2.5 flex flex-col transition-all shadow-sm ${i === 0 ? "border-brand bg-white ring-2 ring-brand/20" : "border-gray-200 bg-white"
                                                            }`}
                                                    >
                                                        {/* Slide Title Bar */}
                                                        <div className="mb-2">
                                                            <div className={`h-1 rounded-full mb-1 ${i === 0 ? "bg-navy w-3/4" : "bg-gray-300 w-2/3"}`} />
                                                            <div className={`h-0.5 rounded-full ${i === 0 ? "bg-gray-300 w-1/2" : "bg-gray-200 w-1/3"}`} />
                                                        </div>

                                                        {/* Industry-specific detailed content */}
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            {activeIndustry === 0 && ( // Financial Services
                                                                <>
                                                                    {i === 0 && (
                                                                        <div className="space-y-1.5">
                                                                            <div className="flex items-end gap-1 h-6 px-1">
                                                                                <div className="w-0.5 h-full bg-gray-200" />
                                                                                <div className="flex-1 flex items-end gap-0.5">
                                                                                    <div className="flex-1 bg-emerald-400 rounded-t h-[45%]" />
                                                                                    <div className="flex-1 bg-emerald-500 rounded-t h-[70%]" />
                                                                                    <div className="flex-1 bg-emerald-400 rounded-t h-[55%]" />
                                                                                    <div className="flex-1 bg-brand rounded-t h-[90%]" />
                                                                                    <div className="flex-1 bg-brand/60 rounded-t h-[75%]" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="h-0.5 bg-gray-200 mx-1" />
                                                                            <div className="flex justify-between px-1">
                                                                                <div className="w-1 h-0.5 bg-gray-300 rounded" />
                                                                                <div className="w-1 h-0.5 bg-gray-300 rounded" />
                                                                                <div className="w-1 h-0.5 bg-gray-300 rounded" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 1 && (
                                                                        <div className="space-y-1">
                                                                            <div className="grid grid-cols-4 gap-0.5 text-[4px]">
                                                                                <div className="bg-navy/10 h-2 rounded-sm" />
                                                                                <div className="bg-navy/10 h-2 rounded-sm" />
                                                                                <div className="bg-navy/10 h-2 rounded-sm" />
                                                                                <div className="bg-navy/10 h-2 rounded-sm" />
                                                                            </div>
                                                                            {[1, 2, 3].map(row => (
                                                                                <div key={row} className="grid grid-cols-4 gap-0.5">
                                                                                    <div className="bg-gray-100 h-1.5 rounded-sm" />
                                                                                    <div className="bg-gray-100 h-1.5 rounded-sm" />
                                                                                    <div className="bg-gray-100 h-1.5 rounded-sm" />
                                                                                    <div className={`h-1.5 rounded-sm ${row === 2 ? 'bg-emerald-200' : 'bg-gray-100'}`} />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {i === 2 && (
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-end gap-0.5 h-5 relative">
                                                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                                                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200" />
                                                                                <div className="flex-1 ml-1 flex items-end">
                                                                                    <svg className="w-full h-full" viewBox="0 0 40 20" preserveAspectRatio="none">
                                                                                        <path d="M0 18 Q10 16, 20 12 T40 2" fill="none" stroke="#1a2fee" strokeWidth="1.5" />
                                                                                        <path d="M0 18 Q10 16, 20 12 T40 2 L40 20 L0 20Z" fill="url(#projGrad)" opacity="0.3" />
                                                                                        <defs>
                                                                                            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                                                                                                <stop offset="0%" stopColor="#1a2fee" />
                                                                                                <stop offset="100%" stopColor="#1a2fee" stopOpacity="0" />
                                                                                            </linearGradient>
                                                                                        </defs>
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-2 justify-center">
                                                                                <div className="flex items-center gap-0.5">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                                                                    <div className="w-3 h-0.5 bg-gray-200 rounded" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                            {activeIndustry === 1 && ( // Strategy Consulting
                                                                <>
                                                                    {i === 0 && (
                                                                        <div className="grid grid-cols-2 grid-rows-2 gap-1 flex-1">
                                                                            <div className="bg-rose-100 rounded flex items-center justify-center">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                                            </div>
                                                                            <div className="bg-amber-100 rounded flex items-center justify-center">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                                            </div>
                                                                            <div className="bg-blue-100 rounded flex items-center justify-center">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                            </div>
                                                                            <div className="bg-emerald-100 rounded flex items-center justify-center">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 1 && (
                                                                        <div className="flex items-center gap-1.5 px-1">
                                                                            <div className="flex flex-col items-center gap-0.5">
                                                                                <div className="w-3 h-3 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center">
                                                                                    <div className="w-1 h-1 bg-brand rounded-full" />
                                                                                </div>
                                                                                <div className="w-2 h-0.5 bg-gray-200 rounded" />
                                                                            </div>
                                                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-brand/40 to-brand/60" />
                                                                            <div className="flex flex-col items-center gap-0.5">
                                                                                <div className="w-3 h-3 rounded-full bg-brand/40 border border-brand/60 flex items-center justify-center">
                                                                                    <div className="w-1 h-1 bg-brand rounded-full" />
                                                                                </div>
                                                                                <div className="w-2 h-0.5 bg-gray-200 rounded" />
                                                                            </div>
                                                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-brand/60 to-brand" />
                                                                            <div className="flex flex-col items-center gap-0.5">
                                                                                <div className="w-3 h-3 rounded-full bg-brand border border-brand flex items-center justify-center">
                                                                                    <Check className="w-2 h-2 text-white" />
                                                                                </div>
                                                                                <div className="w-2 h-0.5 bg-gray-200 rounded" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 2 && (
                                                                        <div className="space-y-1.5">
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="w-2 h-2 rounded bg-brand/20 flex items-center justify-center text-[4px] font-bold text-brand">1</div>
                                                                                <div className="h-2 bg-brand rounded-full flex-1" />
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="w-2 h-2 rounded bg-brand/20 flex items-center justify-center text-[4px] font-bold text-brand">2</div>
                                                                                <div className="h-2 bg-brand/60 rounded-full w-3/4" />
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="w-2 h-2 rounded bg-brand/20 flex items-center justify-center text-[4px] font-bold text-brand">3</div>
                                                                                <div className="h-2 bg-brand/30 rounded-full w-1/2" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                            {activeIndustry === 2 && ( // Technology
                                                                <>
                                                                    {i === 0 && (
                                                                        <div className="flex gap-2">
                                                                            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center">
                                                                                <Rocket className="w-3 h-3 text-brand" />
                                                                            </div>
                                                                            <div className="flex-1 space-y-1">
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-1 h-1 rounded-full bg-brand" />
                                                                                    <div className="h-0.5 bg-gray-200 rounded flex-1" />
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-1 h-1 rounded-full bg-brand/60" />
                                                                                    <div className="h-0.5 bg-gray-200 rounded w-3/4" />
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-1 h-1 rounded-full bg-brand/40" />
                                                                                    <div className="h-0.5 bg-gray-200 rounded w-1/2" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 1 && (
                                                                        <div className="space-y-1.5">
                                                                            <div className="flex gap-0.5 items-center">
                                                                                <div className="w-6 h-0.5 bg-gray-100 rounded" />
                                                                                <div className="flex-1 relative h-2">
                                                                                    <div className="absolute left-0 top-0 h-full w-[80%] bg-brand rounded-full" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-0.5 items-center pl-2">
                                                                                <div className="w-4 h-0.5 bg-gray-100 rounded" />
                                                                                <div className="flex-1 relative h-2">
                                                                                    <div className="absolute left-0 top-0 h-full w-[60%] bg-brand/60 rounded-full" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-0.5 items-center pl-4">
                                                                                <div className="w-2 h-0.5 bg-gray-100 rounded" />
                                                                                <div className="flex-1 relative h-2">
                                                                                    <div className="absolute left-0 top-0 h-full w-[40%] bg-brand/40 rounded-full" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 2 && (
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="flex gap-1 justify-center">
                                                                                <div className="w-4 h-3 rounded bg-brand/20 border border-brand/30" />
                                                                            </div>
                                                                            <div className="flex gap-1 justify-center">
                                                                                <div className="w-3 h-2 rounded bg-brand/30 border border-brand/40" />
                                                                                <div className="w-3 h-2 rounded bg-brand/30 border border-brand/40" />
                                                                                <div className="w-3 h-2 rounded bg-brand/30 border border-brand/40" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                            {activeIndustry === 3 && ( // Healthcare
                                                                <>
                                                                    {i === 0 && (
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <div className="flex flex-col items-center gap-0.5">
                                                                                <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                                                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                                                </div>
                                                                                <div className="w-3 h-0.5 bg-gray-200 rounded" />
                                                                            </div>
                                                                            <div className="flex flex-col items-center">
                                                                                <div className="w-6 h-0.5 bg-gray-300" />
                                                                                <div className="text-[5px] text-gray-400 mt-0.5">n=1,247</div>
                                                                            </div>
                                                                            <div className="flex flex-col items-center gap-0.5">
                                                                                <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                                                                                    <Check className="w-2 h-2 text-emerald-500" />
                                                                                </div>
                                                                                <div className="w-3 h-0.5 bg-gray-200 rounded" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 1 && (
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-end gap-0.5 h-5 relative px-1">
                                                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                                                                                <div className="flex-1 bg-emerald-200 rounded-t h-[30%]" />
                                                                                <div className="flex-1 bg-emerald-300 rounded-t h-[50%]" />
                                                                                <div className="flex-1 bg-emerald-400 rounded-t h-[75%]" />
                                                                                <div className="flex-1 bg-emerald-500 rounded-t h-[95%]" />
                                                                                <div className="w-0.5" />
                                                                                <div className="flex-1 bg-rose-200 rounded-t h-[20%]" />
                                                                                <div className="flex-1 bg-rose-300 rounded-t h-[15%]" />
                                                                            </div>
                                                                            <div className="flex gap-2 justify-center">
                                                                                <div className="flex items-center gap-0.5">
                                                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded" />
                                                                                    <div className="w-4 h-0.5 bg-gray-200 rounded" />
                                                                                </div>
                                                                                <div className="flex items-center gap-0.5">
                                                                                    <div className="w-1.5 h-1.5 bg-rose-300 rounded" />
                                                                                    <div className="w-3 h-0.5 bg-gray-200 rounded" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {i === 2 && (
                                                                        <div className="grid grid-cols-2 gap-1.5">
                                                                            <div className="bg-emerald-50 rounded p-1 border border-emerald-200">
                                                                                <div className="w-full h-0.5 bg-emerald-300 rounded mb-0.5" />
                                                                                <div className="w-2/3 h-0.5 bg-emerald-200 rounded" />
                                                                            </div>
                                                                            <div className="bg-amber-50 rounded p-1 border border-amber-200">
                                                                                <div className="w-full h-0.5 bg-amber-300 rounded mb-0.5" />
                                                                                <div className="w-1/2 h-0.5 bg-amber-200 rounded" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Status Row */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs text-gray-600">{active.slides.length} slides generated</span>
                                                </div>
                                                <span className="text-xs font-medium text-brand">Ready to export</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default IndustrySolutions;
