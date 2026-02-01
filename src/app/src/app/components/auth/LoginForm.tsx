"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction, LoginState } from "@/app/actions/auth";
import SubtleTransitionLink from "../SubtleTransitionLink";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";

const HeroBackground = dynamic(() => import("../HeroBackground"), { ssr: false });

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-brand text-white font-medium rounded-full hover:bg-brand-dark transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? "Signing In..." : "Login"}
        </button>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

const LoginForm = () => {
    const [state, formAction] = useActionState(loginAction, { } as LoginState);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [oauthError, setOauthError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        const message = searchParams.get('message');
        if (error === 'oauth_failed') {
            setOauthError(message ? decodeURIComponent(message) : 'Google sign-in failed');
        }
    }, [searchParams]);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setOauthError(null);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });

        if (error) {
            setOauthError(error.message);
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <HeroBackground
                    speed={3}
                    scale={0.75}
                    color="#1a2fee"
                    noiseIntensity={0}
                    rotation={0.2}
                    className="absolute inset-0"
                />
                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
                    <div className="max-w-lg">
                        <h1 className="text-3xl xl:text-4xl font-semibold text-white mb-4 tracking-tight">
                            Welcome back!
                        </h1>
                        <p className="text-white/70 text-base leading-relaxed">
                            Log in to continue creating professional presentations with AI-powered automation.
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen bg-white">
                <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 xl:px-24">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-12">
                            <span className="text-3xl font-light text-brand tracking-tight">
                                flashslides
                            </span>
                        </div>

                        <form action={formAction} className="space-y-3">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                                    E-Mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="E-Mail"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-navy mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                                    required
                                />
                                <div className="mt-2 text-right">
                                    <SubtleTransitionLink href="/forgot-password" className="text-sm text-brand hover:text-brand-dark transition-colors">
                                        Forgot password?
                                    </SubtleTransitionLink>
                                </div>
                            </div>

                            {(state?.error || oauthError) && (
                                <p className="text-red-500 text-sm py-2">{state?.error || oauthError}</p>
                            )}

                            <SubmitButton />
                        </form>

                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-gray-400">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <GoogleIcon />
                            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                        </button>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Don&apos;t have an account?{" "}
                            <SubtleTransitionLink href="/signup" className="text-brand hover:text-brand-dark font-medium transition-colors">
                                Sign up
                            </SubtleTransitionLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
