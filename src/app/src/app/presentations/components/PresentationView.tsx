"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PresentationHeader from "./PresentationHeader";
import ContentInput from "./ContentInput";
import AIInstructions from "./AIInstructions";
import PresentationGenerating from "./PresentationGenerating";
import PresentationEditor from "./PresentationEditor";

gsap.registerPlugin(useGSAP);

type ViewState = 'input' | 'generating' | 'editor';

function isViewState(value: string): value is ViewState {
    return ['input', 'generating', 'editor'].includes(value);
}

interface PresentationViewProps {
    id: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PresentationView({ id }: PresentationViewProps) {
    const router = useRouter();
    const [viewState, setViewState] = useState<ViewState>('input');
    const containerRef = useRef<HTMLDivElement>(null);

    const { contextSafe } = useGSAP({ scope: containerRef });

    const transitionTo = contextSafe((nextView: ViewState | string) => {
        if (!containerRef.current) {
            if (isViewState(nextView)) {
                setViewState(nextView);
            } else {
                router.push(nextView);
            }
            return;
        }

        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                if (isViewState(nextView)) {
                    setViewState(nextView);
                    // Scroll to top for better UX on view switch
                    window.scrollTo(0, 0);

                    // Small delay to ensure render happens before fade in
                    gsap.delayedCall(0.05, () => {
                        gsap.to(containerRef.current, {
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.inOut",
                            clearProps: "opacity"
                        });
                    });
                } else {
                    router.push(nextView);
                }
            }
        });
    });

    return (
        <div ref={containerRef} className="opacity-100">
            {viewState === 'input' && (
                <div className="min-h-screen flex flex-col bg-gray-50">
                    <PresentationHeader />
                    <main className="flex-grow flex flex-col md:flex-row gap-6 p-6 sm:p-8 max-w-[1600px] mx-auto w-full">
                        <div className="w-full md:w-[60%] min-h-[500px]">
                            <ContentInput />
                        </div>
                        <div className="w-full md:w-[40%] min-h-[500px]">
                            <AIInstructions onGenerate={() => transitionTo('generating')} />
                        </div>
                    </main>
                </div>
            )}

            {viewState === 'generating' && (
                <PresentationGenerating onComplete={() => transitionTo('editor')} />
            )}

            {viewState === 'editor' && (
                <PresentationEditor onLogoClick={() => transitionTo('/dashboard')} />
            )}
        </div>
    );
}
