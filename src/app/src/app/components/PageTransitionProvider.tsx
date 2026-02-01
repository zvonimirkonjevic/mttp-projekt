"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

interface PageTransitionContextType {
    triggerTransition: (url: string) => void;
    triggerSubtleTransition: (url: string) => void;
    isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

export const usePageTransition = () => {
    const context = useContext(PageTransitionContext);
    if (!context) {
        throw new Error("usePageTransition must be used within a PageTransitionProvider");
    }
    return context;
};

interface PageTransitionProviderProps {
    children: ReactNode;
}

export default function PageTransitionProvider({ children }: PageTransitionProviderProps) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const subtleOverlayRef = useRef<HTMLDivElement>(null);
    const transitionType = useRef<"standard" | "subtle" | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Ensure overlays are properly initialized after mount
    useEffect(() => {
        setIsMounted(true);

        // Force a reflow to ensure elements are in the DOM
        if (subtleOverlayRef.current) {
            subtleOverlayRef.current.getBoundingClientRect();
        }
        if (overlayRef.current) {
            overlayRef.current.getBoundingClientRect();
        }
    }, []);

    // Handle exit animations when pathname changes
    useEffect(() => {
        if (!isTransitioning || !transitionType.current) return;

        // Execute exit animation based on the active transition type
        if (transitionType.current === "standard") {
            const overlay = overlayRef.current;
            if (overlay) {
                gsap.to(overlay, {
                    y: "-100%",
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        gsap.set(overlay, {
                            display: "none",
                            width: "0px",
                            height: "0px",
                            y: 0,
                        });
                        setIsTransitioning(false);
                        transitionType.current = null;
                    },
                });
            }
        } else if (transitionType.current === "subtle") {
            const overlay = subtleOverlayRef.current;
            if (overlay) {
                // Phase 2: After page loads (pathname changed), slide up to reveal
                gsap.to(overlay, {
                    yPercent: -100,
                    duration: 0.6,
                    ease: "power3.out",
                    onComplete: () => {
                        gsap.set(overlay, {
                            visibility: "hidden",
                            opacity: 0,
                            yPercent: 0,
                            y: 0,
                        });
                        setIsTransitioning(false);
                        transitionType.current = null;
                    },
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // Only trigger exit animation when pathname actually changes, not when isTransitioning changes

    // Standard transition - blue square expanding
    const triggerTransition = useCallback((url: string) => {
        if (isTransitioning || !overlayRef.current || !isMounted) return;

        // Prevent getting stuck if navigating to current page
        if (url === pathname || url === window.location.pathname) return;

        setIsTransitioning(true);
        transitionType.current = "standard";
        const overlay = overlayRef.current;

        router.prefetch(url);

        gsap.set(overlay, {
            display: "block",
            position: "fixed",
            width: "60px",
            height: "60px",
            left: "50%",
            top: "50%",
            right: "auto",
            bottom: "auto",
            xPercent: -50,
            yPercent: -50,
            y: 0,
            opacity: 1,
            borderRadius: "0px",
        });

        gsap.to(overlay, {
            width: "250vmax",
            height: "250vmax",
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.set(overlay, {
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    xPercent: 0,
                    yPercent: 0,
                    y: 0,
                });

                router.push(url);
                // Exit animation is now handled by the useEffect on pathname
            },
        });

    }, [isTransitioning, isMounted, router, pathname]);

    // Subtle transition - smooth fade for login button
    const triggerSubtleTransition = useCallback((url: string) => {
        if (isTransitioning || !subtleOverlayRef.current || !isMounted) return;

        // Prevent getting stuck if navigating to current page
        if (url === pathname || url === window.location.pathname) return;

        setIsTransitioning(true);
        transitionType.current = "subtle";
        const overlay = subtleOverlayRef.current;

        router.prefetch(url);

        // Kill any existing animations and reset state completely
        gsap.killTweensOf(overlay);

        // Force reflow before animation
        overlay.getBoundingClientRect();

        // Phase 1: Set initial state and animate fade in
        gsap.set(overlay, {
            opacity: 0,
            y: 0,
            yPercent: 0,
            visibility: "visible",
        });

        // Small delay to ensure styles are applied
        requestAnimationFrame(() => {
            gsap.to(overlay, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.inOut",
                onComplete: () => {
                    router.push(url);
                    // Exit animation is now handled by the useEffect on pathname
                },
            });
        });

    }, [isTransitioning, isMounted, router, pathname]);

    return (
        <PageTransitionContext.Provider value={{ triggerTransition, triggerSubtleTransition, isTransitioning }}>
            {children}

            {/* Standard Transition Overlay - Blue Square */}
            <div
                ref={overlayRef}
                style={{
                    display: "none",
                    position: "fixed",
                    zIndex: 9999,
                    backgroundColor: "#1a2fee",
                    pointerEvents: "none",
                    willChange: "transform, opacity, width, height",
                }}
            />

            {/* Subtle Transition Overlay - Full screen fade */}
            <div
                ref={subtleOverlayRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    backgroundColor: "#ffffff",
                    pointerEvents: "none",
                    visibility: "hidden",
                    opacity: 0,
                    willChange: "transform, opacity",
                }}
            />
        </PageTransitionContext.Provider>
    );
}