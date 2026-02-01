"use client";

import Image from "next/image";

const LogoCarousel = () => {
    // Company logos from public/assets directory
    const logos = [
        { name: "McKinsey", src: "/assets/mckinsey-company-logo.svg.png" },
        { name: "Bain", src: "/assets/bain-company-logo.svg.png" },
        { name: "Citadel", src: "/assets/citadel-logo.svg.png" },
        { name: "Jane Street", src: "/assets/jane-street-capital-logo.svg.png" },
        { name: "McKinsey", src: "/assets/mckinsey-company-logo.svg.png" },
        { name: "Bain", src: "/assets/bain-company-logo.svg.png" },
        { name: "Citadel", src: "/assets/citadel-logo.svg.png" },
        { name: "Jane Street", src: "/assets/jane-street-capital-logo.svg.png" },
    ];

    return (
        <section className="pt-12 pb-12 bg-white overflow-hidden">
            {/* Infinite Logo Carousel */}
            <div className="relative">
                {/* Gradient fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white to-transparent z-10" />

                {/* Scrolling container */}
                <div className="flex animate-scroll items-center">
                    {/* First set of logos */}
                    {logos.map((logo, i) => (
                        <div
                            key={`logo-1-${i}`}
                            className="flex-shrink-0 mx-16 flex items-center justify-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                width={144}
                                height={40}
                                className="h-10 w-36 object-contain grayscale opacity-70"
                            />
                        </div>
                    ))}
                    {/* Second set for seamless loop */}
                    {logos.map((logo, i) => (
                        <div
                            key={`logo-2-${i}`}
                            className="flex-shrink-0 mx-16 flex items-center justify-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                width={144}
                                height={40}
                                className="h-10 w-36 object-contain grayscale opacity-70"
                            />
                        </div>
                    ))}
                    {/* Third set to ensure coverage on wide screens */}
                    {logos.map((logo, i) => (
                        <div
                            key={`logo-3-${i}`}
                            className="flex-shrink-0 mx-16 flex items-center justify-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                width={144}
                                height={40}
                                className="h-10 w-36 object-contain grayscale opacity-70"
                            />
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
};

export default LogoCarousel;
