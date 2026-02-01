"use client";

import { useState } from "react";
import Link from "next/link";
import SubtleTransitionLink from "../SubtleTransitionLink";
import dynamic from "next/dynamic";

const HeroBackground = dynamic(() => import("../HeroBackground"), { ssr: false });

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle forgot password logic here
        console.log("Password reset requested for:", email);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Full Page Animated Background */}
            <HeroBackground
                speed={3}
                scale={0.8}
                color="#1a2fee"
                noiseIntensity={0}
                rotation={0.2}
                className="absolute inset-0"
            />

            {/* Centered Form Card */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
                <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <Link href="/" className="text-3xl font-light text-brand tracking-tight">
                            flashslides
                        </Link>
                    </div>

                    {submitted ? (
                        /* Success Message */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-navy mb-2">Check your email</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                We&apos;ve sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <SubtleTransitionLink
                                href="/login"
                                className="inline-block px-6 py-2.5 bg-brand text-white font-medium rounded-full hover:bg-brand-dark transition-colors"
                            >
                                Back to Login
                            </SubtleTransitionLink>
                        </div>
                    ) : (
                        <>
                            {/* Title */}
                            <div className="mb-6 text-center">
                                <h1 className="text-2xl font-semibold text-navy mb-2">Reset your password</h1>
                                <p className="text-gray-500 text-sm">
                                    Enter your email address and we&apos;ll send you instructions to reset your password.
                                </p>
                            </div>

                            {/* Forgot Password Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                                        E-Mail
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-brand text-white font-medium rounded-full hover:bg-brand-dark transition-colors"
                                >
                                    Reset Password
                                </button>

                                {/* Back to Login Link */}
                                <div className="text-center pt-2">
                                    <SubtleTransitionLink href="/login" className="text-sm text-brand hover:text-brand-dark transition-colors">
                                        ← Back to login
                                    </SubtleTransitionLink>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
