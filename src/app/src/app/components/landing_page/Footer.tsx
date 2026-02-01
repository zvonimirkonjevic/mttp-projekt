"use client";

const Footer = () => {
    return (
        <footer className="bg-[#020957] text-white rounded-t-[24px]">
            {/* Main Footer Content */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12 lg:gap-16">

                    {/* Brand Column */}
                    <div className="lg:pr-8">
                        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
                            flashslides
                        </h2>
                        <p className="text-white text-sm leading-relaxed mb-2">
                            The leading AI-powered presentation software for enterprises.
                        </p>
                        <p className="text-white text-sm leading-relaxed mb-8">
                            With AI, strategy and a partner at your side.
                        </p>
                        <button className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-full transition-colors">
                            Contact us
                        </button>
                    </div>

                    {/* Links Grid - 2x2 Layout */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                        {/* Solutions Column */}
                        <div>
                            <h3 className="text-sm font-medium text-white/70 mb-1 tracking-widest">Solutions</h3>
                            <ul className="space-y-0.5">
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Generate presentations</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">AI design automation</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Enterprise security</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Brand compliance</a></li>
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div>
                            <h3 className="text-sm font-medium text-white/70 mb-1 tracking-widest">Resources</h3>
                            <ul className="space-y-0.5">
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Blog</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Academy</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Webinars</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Events</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Guides & Reports</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Documentation</a></li>
                            </ul>
                        </div>

                        {/* Customers Column */}
                        <div>
                            <h3 className="text-sm font-medium text-white/70 mb-1 tracking-widest">Customers</h3>
                            <ul className="space-y-0.5">
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">View all references</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Financial services</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Management consulting</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Technology companies</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Healthcare & Life sciences</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Marketing agencies</a></li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h3 className="text-sm font-medium text-white/70 mb-1 tracking-widest">Company</h3>
                            <ul className="space-y-0.5">
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">About us</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Careers</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Partner</a></li>
                                <li><a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Press</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/30">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-white">
                        © FlashSlides AI Inc. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Legal notice</a>
                        <a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Data protection declaration</a>
                        <a href="#" className="text-sm text-white hover:text-white/70 transition-colors">Cookie declaration</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
