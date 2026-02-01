"use client";

import { ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { usePageTransition } from "./PageTransitionProvider";

interface SubtleTransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export default function SubtleTransitionLink({ href, children, className }: SubtleTransitionLinkProps) {
    const { triggerSubtleTransition, isTransitioning } = usePageTransition();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
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
            triggerSubtleTransition(href);
        }
    };

    return (
        <Link href={href} onClick={handleClick} className={className}>
            {children}
        </Link>
    );
}
