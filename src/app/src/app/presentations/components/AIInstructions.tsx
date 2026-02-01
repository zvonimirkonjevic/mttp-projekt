"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Palette, ChevronDown, ArrowRight, Check, Sparkles, PenTool } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const slideCountOptions = [
    { value: "auto", label: "Auto Slide Count", badge: null },
    { value: "1", label: "1 slide", badge: null },
    { value: "2-5", label: "2-5 slides", badge: null },
    { value: "6-10", label: "6-10 slides", badge: null },
    { value: "11-15", label: "11-15 slides", badge: "PLUS" },
    { value: "16-20", label: "16-20 slides", badge: "PLUS" },
    { value: "21-25", label: "21-25 slides", badge: "PRO" },
];

const languageOptions = [
    { value: "en", label: "English" },
    { value: "hr", label: "Croatian" },
];

interface AIInstructionsProps {
    onGenerate?: () => void;
}

export default function AIInstructions({ onGenerate }: AIInstructionsProps) {
    const router = useRouter();
    const [slideCount, setSlideCount] = useState("6-10");
    const [isSlideDropdownOpen, setIsSlideDropdownOpen] = useState(false);
    const [language, setLanguage] = useState("en");
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [brandingInput, setBrandingInput] = useState("");
    const hasBrandingInput = brandingInput.length > 0;

    // GSAP Animation Ref
    const badgeContainerRef = useRef<HTMLDivElement>(null);
    const prevHasInputState = useRef(hasBrandingInput);

    const selectedSlideOption = slideCountOptions.find(opt => opt.value === slideCount);
    const selectedLanguage = languageOptions.find(opt => opt.value === language);

    // Animate badge on state change
    useGSAP(() => {
        if (!badgeContainerRef.current) return;

        // Only animate if the state has actually changed
        if (prevHasInputState.current === hasBrandingInput) {
            return;
        }

        // Update previous state
        prevHasInputState.current = hasBrandingInput;

        // Kill any ongoing animations to prevent conflicts
        gsap.killTweensOf(badgeContainerRef.current.children);

        // Simple entry animation for the new content
        gsap.fromTo(badgeContainerRef.current.children,
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
    }, { scope: badgeContainerRef, dependencies: [hasBrandingInput] });

    const handleGenerate = () => {
        if (onGenerate) {
            onGenerate();
        } else {
            router.push("/presentations/generating");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-brand" />
                    <h2 className="text-sm text-black">Brand Guidelines</h2>
                </div>
                <div
                    ref={badgeContainerRef}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 bg-brand/5 border border-brand/10 rounded-full shadow-[0_0_12px_rgba(26,47,238,0.15)] animate-pulse-subtle overflow-hidden"
                >
                    {hasBrandingInput ? (
                        <div className="flex items-center gap-1.5" key="active">
                            <PenTool className="w-3 h-3 text-brand" />
                            <span className="text-[10px] font-semibold text-brand tracking-wide uppercase">Agent Refining Guidelines</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5" key="empty">
                            <Sparkles className="w-3 h-3 text-brand" />
                            <span className="text-[10px] font-semibold text-brand tracking-wide uppercase">AI Fully Architecting Style</span>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-4 -mt-2">
                Your specific colors and fonts will be prioritized. Our design agent will intelligently generate any missing stylistic data based on your content.
            </p>

            <textarea
                className="w-full flex-grow resize-none border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-brand focus:border-transparent text-sm text-gray-700 placeholder-gray-400 leading-relaxed"
                style={{ minHeight: "250px", caretColor: "#1a2fee" }}
                placeholder="e.g. Use a modern, minimalist style inspired by Swiss design. Primary colors should be Deep Blue (#1a2fee) and Slate (#0B101A). Use 'Inter Tight' for headings and maintain a professional, authoritative tone throughout the presentation."
                value={brandingInput}
                onChange={(e) => setBrandingInput(e.target.value)}
            />

            {/* Footer Controls */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                                    setIsSlideDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 transition-colors"
                            >
                                <span>{selectedLanguage?.label || "English"}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isLanguageDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    {languageOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setLanguage(option.value);
                                                setIsLanguageDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 flex items-center gap-2 text-sm transition-colors ${language === option.value
                                                ? "bg-brand/10 text-brand"
                                                : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {language === option.value && (
                                                <Check className="w-4 h-4" />
                                            )}
                                            <span className={language === option.value ? "" : "ml-6"}>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Slide Count Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsSlideDropdownOpen(!isSlideDropdownOpen);
                                    setIsLanguageDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 transition-colors"
                            >
                                <span>{selectedSlideOption?.label || "6-10 slides"}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSlideDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isSlideDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    {slideCountOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSlideCount(option.value);
                                                setIsSlideDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${slideCount === option.value
                                                ? "bg-brand/10 text-brand"
                                                : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {slideCount === option.value && (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                <span className={slideCount === option.value ? "" : "ml-6"}>{option.label}</span>
                                            </div>
                                            {option.badge && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${option.badge === "PRO"
                                                    ? "bg-purple-100 text-purple-600"
                                                    : "bg-blue-100 text-blue-600"
                                                    }`}>
                                                    {option.badge}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <span>Generate</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
