"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";

const Features = () => {
    return (
        <section className="pt-16 pb-16 bg-white relative overflow-hidden">
            <div className="w-full px-6 lg:px-12">
                {/* Header */}
                <div className="max-w-4xl mb-20">
                    <h2 className="text-2xl md:text-3xl font-normal text-navy mb-3 tracking-tight leading-[1.15]">
                        The new standard for enterprise presentations.
                    </h2>
                    <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
                        Modern teams demand a zero-friction environment — automated slide production, intelligent design assistance, and absolute sovereignty over sensitive IP.
                    </p>
                </div>

                {/* Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {/* Card 01: Instant Generation */}
                    <div className="bg-[#F5F7FA] rounded-2xl overflow-hidden group transition-all duration-500">
                        {/* Abstract Visual */}
                        <div className="h-64 relative flex items-center justify-center overflow-hidden">
                            {/* Idea to Slides Transformation */}
                            <motion.div
                                className="relative flex items-center gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ amount: 0.5, once: true }}
                                transition={{ duration: 0.5, staggerChildren: 0.15 }}
                            >
                                {/* Lightbulb / Idea Icon */}
                                <motion.div
                                    className="w-20 h-20 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ amount: 0.5, once: true }}
                                    transition={{ delay: 0.1, duration: 0.4 }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
                                        <path d="M9 18h6" />
                                        <path d="M10 22h4" />
                                        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                                    </svg>
                                </motion.div>

                                {/* Arrow */}
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    whileInView={{ scaleX: 1, opacity: 1 }}
                                    viewport={{ amount: 0.5, once: true }}
                                    transition={{ delay: 0.25, duration: 0.3 }}
                                    className="origin-left"
                                >
                                    <svg width="32" height="12" viewBox="0 0 32 12" fill="none" className="text-brand/40">
                                        <path d="M0 6h28M24 1l6 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>

                                {/* Realistic Slide */}
                                <motion.div
                                    className="w-28 h-20 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ amount: 0.5, once: true }}
                                    transition={{ delay: 0.4, duration: 0.4 }}
                                >
                                    {/* Slide Header Bar */}
                                    <div className="h-2.5 bg-gradient-to-r from-brand to-brand/80 flex items-center px-1.5">
                                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                                    </div>
                                    {/* Slide Content */}
                                    <div className="p-2 flex gap-2 h-[calc(100%-10px)]">
                                        {/* Left - Text Content */}
                                        <div className="flex-1 flex flex-col gap-1">
                                            {/* Title */}
                                            <div className="h-1.5 bg-slate-700/70 rounded w-3/4" />
                                            {/* Bullet Points - Two column layout */}
                                            <div className="flex gap-1.5 mt-1">
                                                {/* Bullets Column */}
                                                <div className="flex flex-col gap-1.5 pt-0.5">
                                                    <div className="w-1 h-1 bg-brand rounded-full" />
                                                    <div className="w-1 h-1 bg-brand rounded-full" />
                                                    <div className="w-1 h-1 bg-brand rounded-full" />
                                                </div>
                                                {/* Text Lines Column */}
                                                <div className="flex-1 flex flex-col gap-1.5">
                                                    <div className="h-1.5 bg-slate-300 rounded w-full" />
                                                    <div className="h-1.5 bg-slate-200 rounded w-4/5" />
                                                    <div className="h-1.5 bg-slate-300 rounded w-3/5" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Right - Pie Chart */}
                                        <div className="w-8 h-8 relative shrink-0 self-center">
                                            <svg viewBox="0 0 32 32" className="w-full h-full">
                                                {/* Pie segments */}
                                                <circle cx="16" cy="16" r="12" fill="#e2e8f0" />
                                                <path d="M16 4 A12 12 0 0 1 28 16 L16 16 Z" fill="#1a2fee" />
                                                <path d="M16 16 L28 16 A12 12 0 0 1 16 28 Z" fill="#6366f1" />
                                                <path d="M16 16 L16 28 A12 12 0 0 1 4 16 Z" fill="#818cf8" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                        {/* Content */}
                        <div className="p-10">
                            <h3 className="text-base font-medium text-navy mb-0.5 font-inter">Focus on your idea, not tweaking pixels</h3>
                            <p className="text-sm text-slate leading-relaxed font-inter">
                                Paste your raw content—bullets, docs, or just ideas. FlashSlides transforms it into compelling slide copy with clear structure and narrative flow.
                            </p>
                        </div>
                    </div>

                    {/* Card 02: Professional Design */}
                    <div className="bg-[#F5F7FA] rounded-2xl overflow-hidden group transition-all duration-500">
                        {/* Abstract Visual */}
                        <div className="h-64 relative flex items-center justify-center overflow-hidden">
                            {/* App Container with Slide + Chat */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ amount: 0.5, once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* App Window Frame */}
                                <div className="w-80 h-48 bg-slate-100 rounded-xl shadow-xl overflow-hidden border border-slate-200">
                                    {/* App Header Bar */}
                                    <div className="h-5 bg-white flex items-center px-3 gap-1.5 border-b border-slate-100">
                                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                    </div>

                                    {/* App Content Area */}
                                    <div className="flex h-[calc(100%-20px)] p-1.5 gap-1.5 bg-slate-50">
                                        {/* Left - Slide Thumbnails List */}
                                        <div className="w-12 flex flex-col gap-1 overflow-hidden">
                                            {/* Slide 1 - Selected */}
                                            <div className="w-full aspect-[4/3] bg-white rounded border-2 border-brand shadow-sm flex flex-col p-1 gap-0.5">
                                                <div className="h-0.5 bg-slate-400 rounded w-2/3" />
                                                <div className="h-0.5 bg-slate-200 rounded w-full" />
                                            </div>
                                            {/* Slide 2 */}
                                            <div className="w-full aspect-[4/3] bg-white rounded border border-slate-200 flex flex-col p-1 gap-0.5 opacity-60">
                                                <div className="h-0.5 bg-slate-300 rounded w-1/2" />
                                                <div className="h-0.5 bg-slate-200 rounded w-3/4" />
                                            </div>
                                            {/* Slide 3 */}
                                            <div className="w-full aspect-[4/3] bg-white rounded border border-slate-200 flex flex-col p-1 gap-0.5 opacity-60">
                                                <div className="h-0.5 bg-slate-300 rounded w-3/4" />
                                                <div className="h-0.5 bg-slate-200 rounded w-1/2" />
                                            </div>
                                            {/* Slide 4 */}
                                            <div className="w-full aspect-[4/3] bg-white rounded border border-slate-200 flex flex-col p-1 gap-0.5 opacity-40">
                                                <div className="h-0.5 bg-slate-300 rounded w-2/3" />
                                                <div className="h-0.5 bg-slate-200 rounded w-full" />
                                            </div>
                                        </div>

                                        {/* Center - Large Slide Canvas */}
                                        <div className="flex-1 bg-white rounded-lg shadow-sm p-3 flex flex-col">
                                            {/* Slide Title */}
                                            <div className="h-2 bg-slate-700 rounded w-1/2 mb-2" />
                                            {/* Slide Content - Two columns */}
                                            <div className="flex-1 flex gap-3">
                                                {/* Left content - bullet points */}
                                                <div className="flex-1 flex flex-col gap-1.5">
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-1 bg-brand rounded-full mt-0.5 shrink-0" />
                                                        <div className="flex-1 flex flex-col gap-0.5">
                                                            <div className="h-1 bg-slate-300 rounded w-full" />
                                                            <div className="h-1 bg-slate-200 rounded w-2/3" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-1 bg-brand rounded-full mt-0.5 shrink-0" />
                                                        <div className="flex-1 flex flex-col gap-0.5">
                                                            <div className="h-1 bg-slate-300 rounded w-4/5" />
                                                            <div className="h-1 bg-slate-200 rounded w-1/2" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-1 bg-brand rounded-full mt-0.5 shrink-0" />
                                                        <div className="flex-1 flex flex-col gap-0.5">
                                                            <div className="h-1 bg-slate-300 rounded w-3/4" />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Right content - chart */}
                                                <div className="w-12 h-12 shrink-0 self-center">
                                                    <svg viewBox="0 0 32 32" className="w-full h-full">
                                                        <circle cx="16" cy="16" r="12" fill="#e2e8f0" />
                                                        <path d="M16 4 A12 12 0 0 1 28 16 L16 16 Z" fill="#1a2fee" />
                                                        <path d="M16 16 L28 16 A12 12 0 0 1 16 28 Z" fill="#6366f1" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right - AI Chat Interface */}
                                        <div className="w-20 bg-white rounded-lg border border-slate-200 flex flex-col p-1.5 overflow-hidden">
                                            {/* Chat Header */}
                                            <div className="flex items-center gap-1 mb-1.5 pb-1 border-b border-slate-100">
                                                <div className="w-2 h-2 bg-brand rounded-full" />
                                                <div className="text-[6px] text-slate-500 font-medium">AI Copilot</div>
                                            </div>
                                            {/* Chat Messages */}
                                            <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                                                {/* AI Message */}
                                                <div className="bg-slate-100 rounded p-1 max-w-[90%]">
                                                    <div className="h-1 bg-slate-300 rounded w-full mb-0.5" />
                                                    <div className="h-1 bg-slate-300 rounded w-3/4" />
                                                </div>
                                                {/* User Message */}
                                                <div className="bg-brand/10 rounded p-1 max-w-[85%] self-end">
                                                    <div className="h-1 bg-brand/40 rounded w-full" />
                                                </div>
                                                {/* AI Response */}
                                                <div className="bg-slate-100 rounded p-1 max-w-[90%]">
                                                    <div className="h-1 bg-slate-300 rounded w-full mb-0.5" />
                                                    <div className="h-1 bg-slate-300 rounded w-2/3" />
                                                </div>
                                            </div>
                                            {/* Chat Input */}
                                            <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-slate-100">
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full" />
                                                <div className="w-3 h-3 bg-brand rounded-full flex items-center justify-center shrink-0">
                                                    <svg width="5" height="5" viewBox="0 0 24 24" fill="white">
                                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        {/* Content */}
                        <div className="p-10">
                            <h3 className="text-base font-medium text-navy mb-0.5 font-inter">Refine with an AI Copilot</h3>
                            <p className="text-sm text-slate leading-relaxed font-inter">
                                Tag slides, draw to isolate specific zones for editing, or just move things around - the AI interprets your intent and renders a polished composition.
                            </p>
                        </div>
                    </div>

                    {/* Card 03: Audit-Ready */}
                    <div className="bg-[#F5F7FA] rounded-2xl overflow-hidden group transition-all duration-500">
                        {/* Abstract Visual */}
                        <div className="h-64 relative flex items-center justify-center overflow-hidden">
                            <div className="h-64 relative flex items-center justify-center overflow-visible">
                                {/* Main Grid Container - Tighter packing */}
                                <div className="relative flex flex-col items-center gap-4">
                                    {/* Top Row - 2 Faded Cards */}
                                    <div className="flex gap-4 opacity-50 scale-90">
                                        <motion.div
                                            className="w-56 h-20 bg-white rounded-lg border border-slate-100/50 flex items-center px-5 gap-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ amount: 0.5, once: true }}
                                            transition={{ delay: 0.1, duration: 0.6 }}
                                        >
                                            <div className="w-8 h-10 bg-slate-200 rounded" />
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="h-3 bg-slate-300/60 rounded w-3/4" />
                                                <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="w-56 h-20 bg-white rounded-lg border border-slate-100/50 flex items-center px-5 gap-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ amount: 0.5, once: true }}
                                            transition={{ delay: 0.2, duration: 0.6 }}
                                        >
                                            <div className="w-8 h-10 bg-slate-200 rounded" />
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="h-3 bg-slate-300/60 rounded w-3/4" />
                                                <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Middle Row - Hero Card */}
                                    <motion.div
                                        className="relative w-72 h-24 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 z-20 flex items-center px-6 gap-5"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ amount: 0.5, once: true }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        {/* Blue Shield Icon */}
                                        <div className="relative w-12 h-14 flex items-center justify-center shrink-0">
                                            <motion.div
                                                className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full"
                                                animate={{ opacity: [0.4, 0.7, 0.4] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            />
                                            <motion.svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="w-full h-full absolute inset-0 text-[#1a2fee]"
                                                initial={{ scale: 0.8 }}
                                                whileInView={{ scale: 1 }}
                                                viewport={{ amount: 0.5, once: true }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" />
                                            </motion.svg>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ amount: 0.5, once: true }}
                                                transition={{ delay: 0.2, type: "spring" }}
                                                className="relative z-10"
                                            >
                                                <Scale className="text-white w-4 h-4" strokeWidth={2} />
                                            </motion.div>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full pt-1">
                                            <div className="h-4 bg-slate-300 rounded w-3/4" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </motion.div>

                                    {/* Bottom Row - 2 Faded Cards */}
                                    <div className="flex gap-4 opacity-50 scale-90">
                                        <motion.div
                                            className="w-56 h-20 bg-white rounded-lg border border-slate-100/50 flex items-center px-5 gap-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ amount: 0.5, once: true }}
                                            transition={{ delay: 0.3, duration: 0.6 }}
                                        >
                                            <div className="w-8 h-10 bg-slate-200 rounded" />
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="h-3 bg-slate-300/60 rounded w-3/4" />
                                                <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="w-56 h-20 bg-white rounded-lg border border-slate-100/50 flex items-center px-5 gap-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ amount: 0.5, once: true }}
                                            transition={{ delay: 0.4, duration: 0.6 }}
                                        >
                                            <div className="w-8 h-10 bg-slate-200 rounded" />
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="h-3 bg-slate-300/60 rounded w-3/4" />
                                                <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-radial from-blue-50/50 to-transparent z-0 pointer-events-none" />
                            </div>
                        </div>
                        {/* Content */}
                        <div className="p-10">
                            <h3 className="text-base font-medium text-navy mb-0.5 font-inter">Your content stays yours</h3>
                            <p className="text-sm text-slate leading-relaxed font-inter">
                                Enterprise-grade privacy. Your data never trains our models and never leaves your secure environment—zero compromises.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Features;
