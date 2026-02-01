"use client";

import React, { createContext, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface GlobalTransitionContextType {
    navigateWithTransition: (url: string) => void;
}

const GlobalTransitionContext = createContext<GlobalTransitionContextType | undefined>(undefined);

export function GlobalTransitionProvider({
    children,
    className = ""
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: containerRef });

    const navigateWithTransition = contextSafe((url: string) => {
        if (!containerRef.current) {
            router.push(url);
            return;
        }

        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                router.push(url);
            }
        });
    });

    return (
        <GlobalTransitionContext.Provider value={{ navigateWithTransition }}>
            <div ref={containerRef} className={`opacity-100 ${className}`}>
                {children}
            </div>
        </GlobalTransitionContext.Provider>
    );
}

export function useGlobalTransition() {
    const context = useContext(GlobalTransitionContext);
    if (!context) {
        throw new Error("useGlobalTransition must be used within GlobalTransitionProvider");
    }
    return context;
}
