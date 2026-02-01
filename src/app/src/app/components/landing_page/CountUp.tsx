"use client";

import { useState, useRef, useEffect } from "react";

interface CountUpProps {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
}

const CountUp = ({ end, suffix = "", prefix = "", duration = 2 }: CountUpProps) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    const startTime = performance.now();
                    const durationMs = duration * 1000;

                    const animate = (currentTime: number) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / durationMs, 1);

                        // easeInQuad: starts slow, speeds up
                        const eased = progress * progress;
                        const current = Math.floor(eased * end);

                        setCount(current);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(end);
                        }
                    };

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default CountUp;
