"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

// Phase determination based on step index
type GenerationPhase = 'analysis' | 'structuring' | 'finalizing';

function getPhase(stepIndex: number): GenerationPhase {
    if (stepIndex <= 1) return 'analysis';
    if (stepIndex <= 3) return 'structuring';
    return 'finalizing';
}

// Skeleton loader component that represents slides being created
function SlideSkeletonLoader({
    progress,
    currentStepIndex
}: {
    progress: number;
    currentStepIndex: number;
}) {
    const phase = getPhase(currentStepIndex);

    // Dynamic shimmer speed: slower for a more premium feel (Starts at 2.5s, ends at 4.5s)
    const shimmerDuration = 2.5 + (progress / 100) * 2;

    // Progressive reveal of stage content
    const showStageHeaders = phase === 'structuring' || phase === 'finalizing';
    const showSidebar = phase === 'finalizing';
    const slideOpacity = phase === 'finalizing' ? 1 : 0.95;

    return (
        <div className="relative w-full max-w-[480px]">
            <div className="flex gap-3">
                {/* Sidebar thumbnails - only in finalizing phase */}
                <div
                    className="flex flex-col gap-2 transition-all duration-500"
                    style={{
                        width: showSidebar ? '48px' : '0px',
                        opacity: showSidebar ? 1 : 0,
                        overflow: 'hidden'
                    }}
                >
                    {[1, 2, 3].map((num) => (
                        <div
                            key={num}
                            className="aspect-[16/10] bg-white rounded border border-gray-200 shadow-sm overflow-hidden"
                            style={{
                                animationDelay: `${num * 0.15}s`,
                                opacity: 0.6 + (num * 0.1)
                            }}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"
                                style={{ animationDuration: `${shimmerDuration}s` }}
                            />
                            <div className="p-1">
                                <div className="h-1 w-3/4 bg-gray-200 rounded-full mb-1" />
                                <div className="h-0.5 w-1/2 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                    ))}
                    <div className="text-[8px] text-slate/40 text-center font-medium mt-1">
                        1 / 8
                    </div>
                </div>

                {/* Main slide area */}
                <div className="flex-1">
                    {/* Stack of slides with offset */}
                    <div className="relative" style={{ perspective: '1000px' }}>
                        {/* Back slide (third) */}
                        <div
                            className="absolute top-6 left-3 right-3 aspect-[16/10] bg-white/50 rounded-lg border border-gray-200/40 shadow-sm transition-all duration-500"
                            style={{
                                transform: 'translateZ(-40px) scale(0.94)',
                                opacity: phase === 'analysis' ? 0.3 : 0.6
                            }}
                        />

                        {/* Middle slide (second) */}
                        <div
                            className="absolute top-3 left-1.5 right-1.5 aspect-[16/10] bg-white/70 rounded-lg border border-gray-200/60 shadow-md transition-all duration-500"
                            style={{
                                transform: 'translateZ(-20px) scale(0.97)',
                                opacity: phase === 'analysis' ? 0.5 : 0.8
                            }}
                        />

                        {/* Front slide (main) - with animated content */}
                        <div
                            className="relative aspect-[16/10] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-500"
                            style={{ opacity: slideOpacity }}
                        >
                            {/* Shimmer overlay with synchronized speed */}
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"
                                style={{
                                    animationDuration: `${shimmerDuration}s`,
                                    backgroundSize: '200% 100%'
                                }}
                            />

                            {/* Phase 1: Analysis - Text parsing visualization */}
                            {phase === 'analysis' && (
                                <div className="p-4 h-full flex flex-col">
                                    <div className="text-[10px] text-brand/60 font-medium mb-3 tracking-wide">
                                        PARSING CONTENT
                                    </div>
                                    {/* Shimmering text blocks representing raw content */}
                                    <div className="flex-1 space-y-2">
                                        {[100, 85, 90, 70, 95, 60, 80, 75].map((width, i) => (
                                            <div
                                                key={i}
                                                className="h-1.5 bg-gray-100 rounded-full animate-pulse"
                                                style={{
                                                    width: `${width}%`,
                                                    animationDelay: `${i * 0.08}s`,
                                                    opacity: 0.4 + (i * 0.07),
                                                    animationDuration: `${shimmerDuration}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Phase 2 & 3: Structuring/Finalizing - Slide layout */}
                            {(phase === 'structuring' || phase === 'finalizing') && (
                                <div className="p-4 h-full flex flex-col">
                                    {/* Title skeleton with progressive reveal */}
                                    <div className="h-3 w-2/3 bg-gray-200 rounded-full mb-2 animate-pulse" style={{ animationDuration: `${shimmerDuration}s` }} />

                                    {/* Subtitle skeleton */}
                                    <div className="h-2 w-1/2 bg-gray-100 rounded-full mb-4 animate-pulse" style={{ animationDelay: '0.1s', animationDuration: `${shimmerDuration}s` }} />

                                    {/* Content area */}
                                    <div className="flex-1 flex gap-3">
                                        {/* Left content - stages with progressive reveal */}
                                        <div className="flex-1 space-y-3">
                                            {['Stage 1', 'Stage 2', 'Stage 3'].map((stage, i) => (
                                                <div key={stage} className="space-y-1">
                                                    {/* Stage header - fades in during structuring */}
                                                    <div
                                                        className="text-[7px] font-semibold tracking-wider text-brand/40 transition-all duration-700"
                                                        style={{
                                                            opacity: showStageHeaders ? (0.4 + (i === 0 ? 0.3 : 0)) : 0,
                                                            transform: showStageHeaders ? 'translateY(0)' : 'translateY(-4px)'
                                                        }}
                                                    >
                                                        {stage}
                                                    </div>
                                                    <div className="h-1 w-full bg-gray-100 rounded-full animate-pulse" style={{ animationDelay: `${0.1 * i}s`, animationDuration: `${shimmerDuration}s` }} />
                                                    <div className="h-1 w-4/5 bg-gray-50 rounded-full animate-pulse" style={{ animationDelay: `${0.15 * i}s`, animationDuration: `${shimmerDuration}s` }} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right content - chart placeholder */}
                                        <div className="w-1/3 bg-gray-50 rounded-lg p-2 flex items-end justify-center gap-1">
                                            {[35, 60, 45, 75, 50].map((height, i) => (
                                                <div
                                                    key={i}
                                                    className="w-2.5 rounded-t animate-pulse transition-all duration-500"
                                                    style={{
                                                        height: `${height}%`,
                                                        animationDelay: `${0.1 * i}s`,
                                                        animationDuration: `${shimmerDuration}s`,
                                                        backgroundColor: phase === 'finalizing'
                                                            ? 'rgba(26, 47, 238, 0.4)'
                                                            : 'rgba(26, 47, 238, 0.2)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Slide status indicator */}
                    <div className="mt-4 text-center text-xs text-slate/50 font-medium">
                        {phase === 'analysis' && 'Analyzing content...'}
                        {phase === 'structuring' && 'Building slide structure...'}
                        {phase === 'finalizing' && 'Finalizing presentation...'}
                    </div>
                </div>
            </div>
        </div>
    );
}

const GENERATION_STEPS = [
    "Analyzing content...",
    "Understanding brand guidelines...",
    "Generating slide structure...",
    "Creating visual layouts...",
    "Applying design elements...",
    "Finalizing presentation...",
];

// Technical log entries for each step
const LOG_ENTRIES: Record<number, string[]> = {
    0: [
        "[INFO] Initializing content parser...",
        "[INFO] Extracting text blocks... 24 blocks found",
        "[INFO] Identifying key topics... Success",
        "[INFO] Parsing content structure... Complete",
    ],
    1: [
        "[INFO] Loading brand configuration...",
        "[INFO] Parsing color palette... #1a2fee, #0B101A",
        "[INFO] Font analysis... Inter Tight detected",
        "[INFO] Brand guidelines applied... Success",
    ],
    2: [
        "[INFO] AI model initialized... GPT-4o",
        "[INFO] Generating outline... 8 slides",
        "[INFO] Optimizing content flow... Complete",
        "[INFO] Slide structure validated... Success",
    ],
    3: [
        "[INFO] Layout engine started...",
        "[INFO] Calculating grid positions...",
        "[INFO] Generating visual hierarchy...",
        "[INFO] Layout templates applied... Success",
    ],
    4: [
        "[INFO] Loading design assets...",
        "[INFO] Applying typography styles...",
        "[INFO] Rendering visual elements...",
        "[INFO] Design pass complete... Success",
    ],
    5: [
        "[INFO] Running quality checks...",
        "[INFO] Optimizing file size... 2.4MB",
        "[INFO] Generating preview thumbnails...",
        "[INFO] Presentation ready... Success",
    ],
};

interface PresentationGeneratingProps {
    onComplete?: () => void;
}

export default function PresentationGenerating({ onComplete }: PresentationGeneratingProps) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showLiveLog, setShowLiveLog] = useState(false);
    const [logMessages, setLogMessages] = useState<string[]>([]);

    // Refs
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const TOTAL_DURATION = 21000; // Total time before redirect (ms)
        const PROGRESS_INTERVAL = 600; // Update every 600ms
        const TOTAL_STEPS = Math.floor(TOTAL_DURATION / PROGRESS_INTERVAL);
        let currentStep = 0;

        // Simulate progress updates - calibrated to reach 100%
        const progressInterval = setInterval(() => {
            currentStep++;
            const targetProgress = (currentStep / TOTAL_STEPS) * 100;
            // Add slight randomness but ensure we trend toward 100%
            const randomOffset = (Math.random() - 0.5) * 3;
            const newProgress = Math.min(targetProgress + randomOffset, 100);

            setProgress(newProgress);

            if (currentStep >= TOTAL_STEPS) {
                setProgress(100);
                clearInterval(progressInterval);
            }
        }, PROGRESS_INTERVAL);

        // Cycle through steps - spread across the duration
        const STEP_INTERVAL = Math.floor(TOTAL_DURATION / GENERATION_STEPS.length);
        const stepInterval = setInterval(() => {
            setCurrentStepIndex((prev) => {
                if (prev >= GENERATION_STEPS.length - 1) {
                    return prev;
                }
                return prev + 1;
            });
        }, STEP_INTERVAL);

        // Redirect after progress completes
        const completionTimeout = setTimeout(() => {
            if (onComplete) {
                onComplete();
            } else {
                router.push("/presentations/new");
            }
        }, TOTAL_DURATION + 500); // Small buffer after reaching 100%

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
            clearTimeout(completionTimeout);
        };
    }, [router, onComplete]);

    // Add log messages when step changes
    useEffect(() => {
        const stepLogs = LOG_ENTRIES[currentStepIndex] || [];
        let logIndex = 0;

        const logInterval = setInterval(() => {
            if (logIndex < stepLogs.length) {
                setLogMessages((prev) => [...prev, stepLogs[logIndex]]);
                logIndex++;
            } else {
                clearInterval(logInterval);
            }
        }, 600);

        return () => clearInterval(logInterval);
    }, [currentStepIndex]);



    // Auto-scroll log container
    useEffect(() => {
        if (logContainerRef.current && showLiveLog) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logMessages, showLiveLog]);


    return (
        <div
            className="min-h-screen flex items-center justify-center px-8 lg:px-16 font-sans"
            style={{
                background: 'radial-gradient(ellipse at center, rgba(26, 47, 238, 0.04) 0%, rgba(255, 255, 255, 1) 70%)'
            }}
        >
            {/* Main split layout container */}
            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                {/* Left Side (40%) - Slide Skeleton Loader */}
                <div className="w-full lg:w-[40%] flex items-center justify-center">
                    <SlideSkeletonLoader progress={progress} currentStepIndex={currentStepIndex} />
                </div>

                {/* Right Side (60%) - The "Data" - Left aligned */}
                <div className="w-full lg:w-[60%] flex flex-col items-start text-left">
                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl font-semibold text-navy mb-6">
                        Creating your presentation
                    </h1>

                    {/* Status Breadcrumbs */}
                    <div className="mb-8 space-y-3">
                        {GENERATION_STEPS.map((step, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isActive = index === currentStepIndex;

                            return (
                                <div
                                    key={step}
                                    className={`text-sm transition-all duration-300 ${isCompleted
                                        ? 'text-slate/40 line-through'
                                        : isActive
                                            ? 'text-navy font-medium'
                                            : 'text-slate/30'
                                        }`}
                                >
                                    {step}
                                </div>
                            );
                        })}
                    </div>

                    {/* Slim Progress Bar */}
                    <div className="w-full max-w-md mb-6">
                        {/* Progress track */}
                        <div
                            className="h-[3px] rounded-full overflow-hidden"
                            style={{
                                background: 'rgba(11, 16, 26, 0.08)'
                            }}
                        >
                            {/* Progress fill - darker blue matching button */}
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${Math.min(progress, 100)}%`,
                                    background: '#1a2fee'
                                }}
                            />
                        </div>
                        {/* Percentage text */}
                        <p className="text-xs text-slate/60 mt-3 tracking-wide">
                            {Math.round(Math.min(progress, 100))}% complete
                        </p>
                    </div>

                    {/* Live Log Toggle */}
                    <button
                        onClick={() => setShowLiveLog(!showLiveLog)}
                        className="flex items-center gap-2 text-xs text-slate/50 hover:text-slate/70 transition-colors mb-4"
                    >
                        {showLiveLog ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                        <span className="font-mono">Live Log</span>
                    </button>

                    {/* Live Log Panel - Animated */}
                    <div
                        className="w-full max-w-md grid transition-all duration-300 ease-out"
                        style={{
                            gridTemplateRows: showLiveLog ? '1fr' : '0fr',
                            opacity: showLiveLog ? 1 : 0
                        }}
                    >
                        <div className="overflow-hidden">
                            <div
                                ref={logContainerRef}
                                className="w-full max-w-md mb-6 p-4 rounded-lg overflow-y-auto font-mono text-xs"
                                style={{
                                    background: 'rgba(11, 16, 26, 0.95)',
                                    maxHeight: '160px',
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                                    overflowX: 'hidden',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {logMessages.length === 0 ? (
                                    <div className="text-slate/40">Waiting for logs...</div>
                                ) : (
                                    logMessages.filter(Boolean).map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`py-0.5 ${msg?.includes('Success') || msg?.includes('Complete')
                                                ? 'text-emerald-400'
                                                : msg?.includes('ERROR')
                                                    ? 'text-red-400'
                                                    : 'text-slate/60'
                                                }`}
                                        >
                                            {msg}
                                        </div>
                                    ))
                                )}
                                {/* Blinking cursor */}
                                <span className="inline-block w-2 h-3.5 bg-slate/40 animate-pulse ml-0.5" />
                            </div>
                        </div>
                    </div>

                    {/* Helpful tip - Glassmorphic */}
                    <div className="max-w-md p-5 rounded-xl border border-white/40 bg-white/30 backdrop-blur-md shadow-lg">
                        <p className="text-sm text-slate leading-relaxed">
                            <span className="text-navy font-medium">Tip:</span> You can edit and customize
                            every slide after generation completes. Our AI adapts to your feedback for future presentations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
