"use client";

import { ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { usePageTransition } from "./PageTransitionProvider";

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export default function TransitionLink({ href, children, className }: TransitionLinkProps) {
    const { triggerTransition, isTransitioning } = usePageTransition();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // Don't intercept if it's an external link or modifier keys are pressed
        if (
            href.startsWith("http") ||
            href.startsWith("mailto:") ||
            e.metaKey ||
            e.ctrlKey
        ) {
            return;
        }

        e.preventDefault();

        if (!isTransitioning) {
            triggerTransition(href);
        }
    };

    return (
        <Link href={href} onClick={handleClick} className={className}>
            {children}
        </Link>
    );
}
