"use client";

import { useState, useRef, useLayoutEffect } from "react";
import type { gsap as GsapType } from "gsap";
import TransitionLink from "../TransitionLink";
import SubtleTransitionLink from "../SubtleTransitionLink";

// Lazy-load GSAP only when dropdown animations are needed
let gsapPromise: Promise<typeof GsapType> | null = null;
const getGsap = () => {
    if (!gsapPromise) {
        gsapPromise = import("gsap").then((mod) => mod.gsap);
    }
    return gsapPromise;
};

const Navbar = () => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const previousDropdown = useRef<string | null>(null);

    // Handle mouse enter on nav item
    const handleMouseEnter = (itemName: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setActiveDropdown(itemName);
    };

    // Handle mouse leave with delay
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    // Keep dropdown open when hovering over it
    const handleDropdownMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // GSAP animation for dropdown - smooth professional implementation
    useLayoutEffect(() => {
        const runAnimations = async () => {
            const gsap = await getGsap();
            const allDropdownKeys = Object.keys(dropdownRefs.current);
            const isTransitioning = previousDropdown.current !== null && activeDropdown !== null && previousDropdown.current !== activeDropdown;
            const isOpening = previousDropdown.current === null && activeDropdown !== null;
            const isClosing = previousDropdown.current !== null && activeDropdown === null;

            // Handle ALL dropdowns in a coordinated way
            allDropdownKeys.forEach((key) => {
                const dropdown = dropdownRefs.current[key];
                if (!dropdown) return;

                const leftColumn = dropdown.querySelector('.dropdown-left');
                const rightColumn = dropdown.querySelector('.dropdown-right');
                const links = dropdown.querySelectorAll('.dropdown-link');

                if (key === activeDropdown) {
                    // This is the dropdown we want to show
                    gsap.killTweensOf(dropdown);
                    gsap.killTweensOf([leftColumn, rightColumn]);
                    gsap.killTweensOf(links);

                    if (isTransitioning) {
                        // Switching between dropdowns - instant show with content fade
                        gsap.set(dropdown, {
                            display: 'block',
                            opacity: 1,
                            clipPath: 'inset(0 0 0% 0)'
                        });
                        gsap.set([leftColumn, rightColumn], { opacity: 0, y: -8 });
                        gsap.set(links, { opacity: 0, x: -6 });

                        // Subtle content reveal
                        gsap.to([leftColumn, rightColumn], {
                            opacity: 1,
                            y: 0,
                            duration: 0.25,
                            stagger: 0.04,
                            ease: 'power2.out'
                        });
                        gsap.to(links, {
                            opacity: 1,
                            x: 0,
                            duration: 0.2,
                            stagger: 0.02,
                            delay: 0.05,
                            ease: 'power2.out'
                        });
                    } else if (isOpening) {
                        // Opening for first time - elegant reveal from top using clipPath
                        gsap.set(dropdown, {
                            display: 'block',
                            opacity: 1,
                            clipPath: 'inset(0 0 100% 0)'
                        });
                        gsap.set([leftColumn, rightColumn], { opacity: 0, y: -8 });
                        gsap.set(links, { opacity: 0, x: -8 });

                        // Smooth choreographed entrance - clip reveals from top
                        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

                        tl.to(dropdown, {
                            clipPath: 'inset(0 0 0% 0)',
                            duration: 0.35
                        })
                            .to([leftColumn, rightColumn], {
                                opacity: 1,
                                y: 0,
                                duration: 0.3,
                                stagger: 0.05
                            }, '-=0.2')
                            .to(links, {
                                opacity: 1,
                                x: 0,
                                duration: 0.2,
                                stagger: 0.025
                            }, '-=0.15');
                    }
                } else if (key === previousDropdown.current) {
                    // This is the dropdown we're leaving
                    gsap.killTweensOf(dropdown);
                    gsap.killTweensOf([leftColumn, rightColumn]);
                    gsap.killTweensOf(links);

                    if (isTransitioning) {
                        // Switching - instant hide (new one appears on top)
                        gsap.set(dropdown, { display: 'none', clipPath: 'inset(0 0 100% 0)' });
                    } else if (isClosing) {
                        // Closing completely - smooth exit with clipPath
                        gsap.to(dropdown, {
                            clipPath: 'inset(0 0 100% 0)',
                            duration: 0.25,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                gsap.set(dropdown, { display: 'none' });
                            }
                        });
                    }
                } else {
                    // Other dropdowns - ensure hidden
                    gsap.set(dropdown, { display: 'none', clipPath: 'inset(0 0 100% 0)' });
                }
            });

            // Update previous dropdown reference
            previousDropdown.current = activeDropdown;
        };

        runAnimations();
    }, [activeDropdown]);

    const navItems = [
        { name: "Solutions", hasDropdown: true },
        { name: "Customers", hasDropdown: true },
        { name: "Company", hasDropdown: true },
        { name: "Resources", hasDropdown: true },
    ];

    const solutionsLinks = [
        { title: "Generate presentations", href: "#" },
        { title: "AI design automation", href: "#" },
        { title: "Enterprise security", href: "#" },
        { title: "Brand compliance", href: "#" },
    ];

    const contentFeatures = [
        { num: "01", label: "Analyze and structure content" },
        { num: "02", label: "Transform into slide copy" },
        { num: "03", label: "Refine message and tone" },
    ];

    const designFeatures = [
        { num: "01", label: "Apply intelligent layouts" },
        { num: "02", label: "Optimize typography" },
        { num: "03", label: "Ensure visual consistency" },
    ];

    return (
        <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <TransitionLink href="/" className="text-xl font-light text-brand tracking-tight">
                        flashslides
                    </TransitionLink>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-12">
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter(item.name)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    className={`flex items-center gap-1.5 text-base font-normal tracking-wide transition-colors ${activeDropdown === item.name ? "text-gray-500" : "text-gray-700 hover:text-gray-500"
                                        }`}
                                >
                                    {item.name}
                                    {item.hasDropdown && (
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.name ? "rotate-180" : ""
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <SubtleTransitionLink href="/book-demo" className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                            Book a demo
                        </SubtleTransitionLink>
                        <SubtleTransitionLink href="/login" className="px-5 py-2 text-sm font-medium text-white bg-brand rounded-full hover:bg-brand-dark transition-colors">
                            Login / Sign up
                        </SubtleTransitionLink>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2">
                        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded Dropdown - Solutions */}
            <div
                ref={(el) => { dropdownRefs.current["Solutions"] = el; }}
                className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg origin-top hidden"
                suppressHydrationWarning
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="dropdown-content max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
                    {/* Top - Solutions Label */}
                    <div className="border-b border-gray-100 pb-4 mb-6">
                        <span className="text-sm text-gray-500 tracking-widest">Solutions</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 items-start py-6">
                        {/* Left Column - Navigation Links */}
                        <div className="dropdown-left space-y-2">
                            {solutionsLinks.map((link, idx) => (
                                <TransitionLink
                                    key={idx}
                                    href={link.href}
                                    className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4"
                                >
                                    {link.title}
                                </TransitionLink>
                            ))}
                        </div>

                        {/* Right Column - Feature Content with Background */}
                        <div className="dropdown-right bg-gray-50 rounded-2xl p-8 lg:p-10">
                            <div className="flex flex-col gap-8">
                                {/* Title and Description */}
                                <div>
                                    <h4 className="text-lg font-semibold text-navy mb-2">
                                        Our FlashSlides approach: integrated presentation creation
                                    </h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                                        FlashSlides is the world&apos;s first software for integrated presentation management.
                                        Content structuring, intelligent design refinement, and enterprise-grade privacy
                                        in one place & AI-based automation.
                                    </p>
                                </div>

                                {/* Diagram Section with Labels on Each Side */}
                                <div className="flex items-center justify-center gap-8 lg:gap-12 py-4">
                                    {/* Left Labels - Content Structuring */}
                                    <div className="text-right space-y-4 max-w-[200px]">
                                        <h5 className="text-brand font-medium text-sm mb-4">Content Structuring</h5>
                                        {contentFeatures.map((feature, idx) => (
                                            <div key={idx} className="text-xs text-gray-500">
                                                <span className="text-brand mr-1">{feature.num}</span>
                                                {feature.label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Circular Diagram */}
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        <svg className="w-full h-full" viewBox="0 0 200 200">
                                            {/* Left Arc - Blue */}
                                            <path
                                                d="M 100 15 A 85 85 0 0 0 15 100 A 85 85 0 0 0 100 185"
                                                fill="none"
                                                stroke="#1a2fee"
                                                strokeWidth="28"
                                            />
                                            {/* Right Arc - Dark Blue */}
                                            <path
                                                d="M 100 185 A 85 85 0 0 0 185 100 A 85 85 0 0 0 100 15"
                                                fill="none"
                                                stroke="#020957"
                                                strokeWidth="28"
                                            />
                                        </svg>
                                        {/* Center Circle */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-[#4f5eff] rounded-full flex items-center justify-center">
                                                <span className="text-[8px] text-center font-medium text-white leading-tight">
                                                    Presentation<br />Creation
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Labels - Slide Design */}
                                    <div className="text-left space-y-4 max-w-[200px]">
                                        <h5 className="text-[#020957] font-medium text-sm mb-4">Slide Design</h5>
                                        {designFeatures.map((feature, idx) => (
                                            <div key={idx} className="text-xs text-gray-500">
                                                <span className="text-[#020957] mr-1">{feature.num}</span>
                                                {feature.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Dropdown - Customers */}
            <div
                ref={(el) => { dropdownRefs.current["Customers"] = el; }}
                className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg origin-top hidden"
                suppressHydrationWarning
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="dropdown-content max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
                    {/* Top - Customers Label */}
                    <div className="border-b border-gray-100 pb-4 mb-6">
                        <span className="text-sm text-gray-500 tracking-widest">Customers</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 items-start py-6">
                        {/* Left Column - Navigation Links */}
                        <div className="dropdown-left space-y-2">
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Financial Services</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Management Consulting</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Technology Companies</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Healthcare & Life Sciences</TransitionLink>
                        </div>

                        {/* Right Column - Feature Content with Background */}
                        <div className="dropdown-right bg-gray-50 rounded-2xl p-8 lg:p-10">
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h4 className="text-lg font-semibold text-navy mb-2">
                                        Trusted by industry leaders
                                    </h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                                        From Fortune 500 companies to fast-growing startups, FlashSlides powers
                                        presentation creation for teams that demand excellence and efficiency.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-4">
                                    <div className="space-y-4">
                                        <h5 className="text-brand font-medium text-sm mb-4">By Industry</h5>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">01</span>Investment Banking & PE</div>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">02</span>Strategy Consulting</div>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">03</span>Enterprise Technology</div>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="text-[#020957] font-medium text-sm mb-4">Case Studies</h5>
                                        <div className="text-xs text-gray-500"><span className="text-[#020957] mr-1">01</span>View all references</div>
                                        <div className="text-xs text-gray-500"><span className="text-[#020957] mr-1">02</span>Marketing agencies</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Dropdown - Company */}
            <div
                ref={(el) => { dropdownRefs.current["Company"] = el; }}
                className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg origin-top hidden"
                suppressHydrationWarning
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="dropdown-content max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
                    {/* Top - Company Label */}
                    <div className="border-b border-gray-100 pb-4 mb-6">
                        <span className="text-sm text-gray-500 tracking-widest">Company</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 items-start py-6">
                        {/* Left Column - Navigation Links */}
                        <div className="dropdown-left space-y-2">
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">About us</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Careers</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Partner</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Press</TransitionLink>
                        </div>

                        {/* Right Column - Feature Content with Background */}
                        <div className="dropdown-right bg-gray-50 rounded-2xl p-8 lg:p-10">
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h4 className="text-lg font-semibold text-navy mb-2">
                                        Building the future of presentations
                                    </h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                                        We&apos;re on a mission to eliminate busywork and empower professionals
                                        to focus on what matters most—their ideas and insights.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-4">
                                    <div className="space-y-4">
                                        <h5 className="text-brand font-medium text-sm mb-4">Our Mission</h5>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">01</span>Eliminate presentation busywork</div>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">02</span>Enterprise-grade AI solutions</div>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">03</span>Privacy-first approach</div>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="text-[#020957] font-medium text-sm mb-4">Join Us</h5>
                                        <div className="text-xs text-gray-500"><span className="text-[#020957] mr-1">01</span>Open positions</div>
                                        <div className="text-xs text-gray-500"><span className="text-[#020957] mr-1">02</span>Our culture</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Dropdown - Resources */}
            <div
                ref={(el) => { dropdownRefs.current["Resources"] = el; }}
                className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg origin-top hidden"
                suppressHydrationWarning
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="dropdown-content max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
                    {/* Top - Resources Label */}
                    <div className="border-b border-gray-100 pb-4 mb-6">
                        <span className="text-sm text-gray-500 tracking-widest">Resources</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 items-start py-6">
                        {/* Left Column - Navigation Links */}
                        <div className="dropdown-left space-y-2">
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Blog</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Academy</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Webinars</TransitionLink>
                            <TransitionLink href="#" className="dropdown-link block text-base text-gray-800 hover:text-white hover:bg-[#1a2fee] transition-all font-normal px-4 py-3 rounded-lg -mx-4">Events</TransitionLink>
                        </div>

                        {/* Right Column - Feature Content with Background */}
                        <div className="dropdown-right bg-gray-50 rounded-2xl p-8 lg:p-10">
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h4 className="text-lg font-semibold text-navy mb-2">
                                        Learn and grow with FlashSlides
                                    </h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                                        Explore our library of guides, tutorials, and best practices to master
                                        AI-powered presentation creation.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-4">
                                    <div className="space-y-4">
                                        <h5 className="text-brand font-medium text-sm mb-4">Learn</h5>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">01</span>Getting started guides</div>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">02</span>Best practices</div>
                                        <div className="text-xs text-gray-500"><span className="text-brand mr-1">03</span>Video tutorials</div>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="text-[#020957] font-medium text-sm mb-4">Support</h5>
                                        <div className="text-xs text-gray-500"><span className="text-[#020957] mr-1">01</span>Guides & Reports</div>
                                        <div className="text-xs text-gray-500"><span className="text-[#020957] mr-1">02</span>Documentation</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
