"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SubtleTransitionLink from "../SubtleTransitionLink";

const HeroBackground = dynamic(() => import("../HeroBackground"), { ssr: false });

const BookDemoForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [teamSize, setTeamSize] = useState("");
    const [useCase, setUseCase] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Demo booking:", { firstName, lastName, email, phone, teamSize, useCase });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Dark Background with Info */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#020957]">
                {/* Background Animation */}
                <HeroBackground
                    speed={3}
                    scale={0.75}
                    color="#1a2fee"
                    noiseIntensity={0}
                    rotation={0.2}
                    className="absolute inset-0 opacity-50"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">
                    {/* Go Back Link */}
                    <SubtleTransitionLink href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-12">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Go back
                    </SubtleTransitionLink>

                    {/* Logo */}
                    <div className="mb-16">
                        <span className="text-3xl font-light text-white tracking-tight">
                            flashslides
                        </span>
                    </div>

                    {/* Benefits Section */}
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white mb-8">
                            Talk to a Sales consultant to:
                        </h2>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    <strong className="text-white font-medium block mb-1">Eliminate manual design work</strong>
                                    See how FlashSlides turns raw content into professional decks instantly, allowing your team to focus on the message, not the pixels.
                                </p>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    <strong className="text-white font-medium block mb-1">Scale design expertise</strong>
                                    Learn how our AI Copilot acts as an always-on designer, ensuring every presentation is on-brand and visually compelling.
                                </p>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    <strong className="text-white font-medium block mb-1">Secure your intellectual property</strong>
                                    Discuss our isolated deployment options and zero-retention policies that ensure your sensitive data remains exclusively yours.
                                </p>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Support Link */}
                    <div className="mt-auto pt-12">
                        <a href="mailto:support@flashslides.ai" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
                            Contact our support team
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Right Side - White Form */}
            <div className="w-full lg:w-[55%] flex flex-col min-h-screen bg-white">
                <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12">
                    <div className="max-w-md mx-auto w-full">
                        {/* Mobile Go Back */}
                        <div className="lg:hidden mb-8">
                            <SubtleTransitionLink href="/" className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors text-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Go back
                            </SubtleTransitionLink>
                        </div>

                        {/* Headline */}
                        <h1 className="text-3xl xl:text-4xl font-light text-navy mb-2 tracking-tight leading-tight">
                            Enterprise team? Get a personalized{" "}
                            <span className="text-brand">30-minute demo.</span>
                        </h1>
                        <p className="text-gray-500 text-sm mb-10">
                            Teams of 20+ are eligible for a custom walkthrough.
                        </p>

                        {/* Form */}
                        <form id="demo-form" onSubmit={handleSubmit} className="space-y-3">
                            {/* Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-navy mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-navy mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                                    Company Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@company.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-navy mb-2">
                                    Phone number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                />
                            </div>

                            {/* Team Size Dropdown */}
                            <div>
                                <label htmlFor="teamSize" className="block text-sm font-medium text-navy mb-2">
                                    How many people will be using FlashSlides?
                                </label>
                                <select
                                    id="teamSize"
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 bg-white appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                                    required
                                >
                                    <option value="" disabled>Please Select</option>
                                    <option value="1-10">1-10 people</option>
                                    <option value="11-50">11-50 people</option>
                                    <option value="51-200">51-200 people</option>
                                    <option value="201-500">201-500 people</option>
                                    <option value="500+">500+ people</option>
                                </select>
                            </div>

                            {/* Use Case Dropdown */}
                            <div>
                                <label htmlFor="useCase" className="block text-sm font-medium text-navy mb-2">
                                    What is your main presentation need?
                                </label>
                                <select
                                    id="useCase"
                                    value={useCase}
                                    onChange={(e) => setUseCase(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 bg-white appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                                    required
                                >
                                    <option value="" disabled>Please Select</option>
                                    <option value="pitch-decks">Pitch Decks & Investor Reports</option>
                                    <option value="consulting">Consulting Deliverables</option>
                                    <option value="sales">Sales Presentations</option>
                                    <option value="training">Training & Onboarding</option>
                                    <option value="marketing">Marketing Collateral</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </form>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            form="demo-form"
                            className="w-full py-2.5 bg-brand text-white font-medium rounded-full hover:bg-brand-dark transition-colors mt-10"
                        >
                            Book a demo
                        </button>

                        {/* Terms */}
                        <p className="text-center text-xs text-gray-500 mt-4">
                            By contacting us you agree to our{" "}
                            <a href="/terms" className="text-brand hover:text-brand-dark transition-colors">Terms of Service</a>
                            {" "}and{" "}
                            <a href="/privacy" className="text-brand hover:text-brand-dark transition-colors">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDemoForm;
