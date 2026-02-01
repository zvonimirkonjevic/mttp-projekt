"use client";

import {
    Settings,
    MoreHorizontal,
    ChevronRight,
    PanelLeft,
    PanelRight,
    Plus,
    Clock
} from "lucide-react";
import { useState, useCallback } from "react";
import Link from "next/link";
import {
    SlideCodeThumbnail,
    EditableScaledSlide
} from "./SlideComponents";

// Initial slides data - in production this would come from a database/API
const INITIAL_SLIDES: string[] = [
    `
    import React from 'react';

    const Slide = () => {
    return (
        <div className="w-[1920px] h-[1080px] bg-[#0038FF] text-[#F5F5F5] relative overflow-hidden font-sans selection:bg-[#FFB800] selection:text-[#1A1A1A]">
        {/* Font Imports */}

        {/* Grid System (Visualizing the Architectural Transparency) */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Vertical Grid Lines - 12 Column Logic (opacity for subtlety) */}
            <div className="absolute left-[200px] h-full w-px bg-[#F5F5F5] opacity-20"></div>
            <div className="absolute left-[460px] h-full w-px bg-[#F5F5F5] opacity-20"></div>
            <div className="absolute right-[200px] h-full w-px bg-[#F5F5F5] opacity-20"></div>
            
            {/* Horizontal Grid Lines - Pipeline Logic */}
            <div className="absolute top-[120px] w-full h-px bg-[#F5F5F5] opacity-20"></div>
            <div className="absolute top-[380px] w-full h-px bg-[#F5F5F5] opacity-20"></div>
            <div className="absolute top-[560px] w-full h-px bg-[#F5F5F5] opacity-20"></div>
            <div className="absolute top-[670px] w-full h-px bg-[#F5F5F5] opacity-20"></div>
            <div className="absolute bottom-[120px] w-full h-px bg-[#F5F5F5] opacity-20"></div>
        </div>

        {/* Meta Data Header - Top Left */}
        <div className="absolute top-[60px] left-[200px] flex flex-col items-start">
            <span className="font-['IBM_Plex_Mono'] text-sm tracking-widest opacity-80 uppercase">
            Project Code
            </span>
            <span className="font-['IBM_Plex_Mono'] text-lg font-medium text-[#FFB800]">
            SA-AI-2025
            </span>
        </div>

        {/* Brand Identity - Top Right */}
        <div className="absolute top-[60px] right-[200px] text-right">
            <h2 className="font-['Inter_Tight'] font-bold text-xl tracking-tight uppercase">
            Smartarzt Analysis
            </h2>
            <span className="font-['IBM_Plex_Mono'] text-sm opacity-60">
            The Diagnostic Blueprint
            </span>
        </div>

        {/* Main Content Area */}
        
        {/* Segment: Title */}
        {/* Coordinates: (200, 380) to (1720, 560) */}
        <div className="absolute top-[380px] left-[200px] w-[1520px] h-[180px] flex items-center">
            <h1 className="font-['Inter_Tight'] font-bold text-[110px] leading-[0.9] tracking-[-0.04em] uppercase text-[#F5F5F5]">
            Analysis of the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F5] to-[#F5F5F5]/70">
                Smartarzt AI Solution
            </span>
            </h1>
        </div>

        {/* Segment: Introduction */}
        {/* Coordinates: (460, 590) to (1460, 670) */}
        {/* Indented to create asymmetrical balance and hierarchy */}
        <div className="absolute top-[590px] left-[460px] w-[1000px] h-[80px] flex flex-col justify-start">
            <div className="w-12 h-1 bg-[#FFB800] mb-6"></div> {/* Accent mark */}
            <p className="font-['IBM_Plex_Mono'] text-[28px] leading-tight font-medium text-[#F5F5F5] opacity-90">
            Technical Audit and Strategic Evaluation
            </p>
        </div>

        {/* Footer / Status Indicators */}
        <div className="absolute bottom-[60px] left-[200px] flex items-center gap-8 font-['IBM_Plex_Mono'] text-xs tracking-wider opacity-60">
            <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F5F5F5]"></div>
            <span>AUDIO PIPELINE</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F5F5F5]"></div>
            <span>LLM INTEGRATION</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#FFB800]"></div>
            <span className="text-[#FFB800]">SECURITY AUDIT</span>
            </div>
        </div>

        {/* Page Number / Coordinates Visual */}
        <div className="absolute bottom-[60px] right-[200px] font-['IBM_Plex_Mono'] text-sm text-right opacity-40">
            01 / 01 <br/>
            COORD: 52.5200° N
        </div>

        </div>
    );
    };

    export default Slide;
    `,

    `
    import React from 'react';

    const Slide = () => {
    return (
        <div className="w-[1920px] h-[1080px] bg-[#F5F5F5] text-[#1A1A1A] overflow-hidden relative font-sans selection:bg-[#0038FF] selection:text-white">
        {/* Font Imports */}

        {/* Grid Layout System (Visual Structure) */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal Pipeline Rule - Moved down to 460px to increase spacing from subtitle */}
            <div className="absolute top-[460px] left-[80px] right-[80px] h-[1px] bg-[#1A1A1A] opacity-20"></div>
            
            {/* Vertical Pipeline Rules - Adjusted top start to match horizontal line */}
            <div className="absolute top-[460px] bottom-[80px] left-[660px] w-[1px] bg-[#1A1A1A] opacity-20"></div>
            <div className="absolute top-[460px] bottom-[80px] left-[1280px] w-[1px] bg-[#1A1A1A] opacity-20"></div>
        </div>

        {/* Segment 1: Title */}
        {/* Reduced font size from 88px to 76px to fix cramping and improve balance */}
        <div className="absolute left-[80px] top-[80px] w-[1760px] h-[140px] flex items-end">
            <h1 className="font-['Inter_Tight'] font-bold text-[76px] leading-[0.95] tracking-[-0.02em] text-[#1A1A1A] uppercase">
            Smartarzt is a functional proof of concept with high technical debt and significant security risks
            </h1>
        </div>

        {/* Segment 2: Introduction */}
        <div className="absolute left-[80px] top-[260px] w-[1760px] h-[120px]">
            <p className="font-['IBM_Plex_Sans'] font-medium text-[42px] leading-[1.2] text-[#0038FF] max-w-[1400px]">
            The solution successfully automates medical documentation but requires a major overhaul for production safety.
            </p>
        </div>

        {/* Segment 3: Descriptive Text (Functional) */}
        {/* Moved down to 510px to align with new grid line position */}
        <div className="absolute left-[80px] top-[510px] w-[540px] h-[420px] flex flex-col gap-6">
            {/* Status Indicator: Square - Increased size to w-6 h-6 for better visibility */}
            <div className="w-6 h-6 bg-[#0038FF]"></div>
            
            <div className="flex flex-col gap-4">
            <span className="font-['IBM_Plex_Mono'] text-[#0038FF] text-sm tracking-widest uppercase font-medium">
                01 // COMPLETENESS
            </span>
            <p className="font-['IBM_Plex_Sans'] text-[32px] leading-[1.4] text-[#1A1A1A]">
                Functional completeness is achieved through a working pipeline from audio to structured medical letters.
            </p>
            </div>
        </div>

        {/* Segment 4: Descriptive Text (Security Risk) */}
        {/* Moved down to 510px */}
        <div className="absolute left-[700px] top-[510px] w-[540px] h-[420px] flex flex-col gap-6">
            {/* Status Indicator: Triangle - Increased size and updated color */}
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-[#D97706]"></div>

            <div className="flex flex-col gap-4">
            {/* Updated color to #D97706 (Darker Amber) for better contrast and accessibility */}
            <span className="font-['IBM_Plex_Mono'] text-[#D97706] text-sm tracking-widest uppercase font-medium">
                02 // CRITICAL RISK
            </span>
            <p className="font-['IBM_Plex_Sans'] text-[32px] leading-[1.4] text-[#1A1A1A]">
                The system carries high risk due to critical security gaps in secret management and privacy compliance.
            </p>
            </div>
        </div>

        {/* Segment 5: Descriptive Text (Architecture) */}
        {/* Moved down to 510px */}
        <div className="absolute left-[1320px] top-[510px] w-[520px] h-[420px] flex flex-col gap-6">
            {/* Status Indicator: Circle - Increased size and updated color */}
            <div className="w-6 h-6 rounded-full bg-[#D97706]"></div>

            <div className="flex flex-col gap-4">
            {/* Updated color to #D97706 (Darker Amber) for better contrast and accessibility */}
            <span className="font-['IBM_Plex_Mono'] text-[#D97706] text-sm tracking-widest uppercase font-medium">
                03 // ARCHITECTURE
            </span>
            <p className="font-['IBM_Plex_Sans'] text-[32px] leading-[1.4] text-[#1A1A1A]">
                There is a fundamental architectural mismatch as AWS Lambda is inefficient for the current long running workloads.
            </p>
            </div>
        </div>

        {/* Footer / Meta Data */}
        <div className="absolute bottom-[40px] left-[80px] right-[80px] flex justify-between items-end border-t border-[#1A1A1A] border-opacity-10 pt-4">
            <span className="font-['IBM_Plex_Mono'] text-sm text-[#1A1A1A] opacity-50">SA-AI-2025</span>
            <span className="font-['IBM_Plex_Mono'] text-sm text-[#1A1A1A] opacity-50">DIAGNOSTIC BLUEPRINT</span>
        </div>
        </div>
    );
    };

    export default Slide;
    `,

    `
    import React from 'react';

    const Slide = () => {
    // Brand Colors
    const colors = {
        paperWhite: '#F5F5F5',
        deepSlate: '#1A1A1A',
        signalBlue: '#0038FF',
        warningAmber: '#FFB800',
    };

    // Helper to process text segments to style the [Tag] differently
    const renderSegment = (text, type = 'body') => {
        const match = text.match(/^(\[.*?\])\s*(.*)$/);
        if (match) {
        const tag = match[1];
        const content = match[2];
        
        return (
            <div className="flex flex-col items-start gap-4 h-full">
            <span className="font-mono text-sm tracking-widest uppercase text-[#0038FF] mb-2 block border-b border-[#0038FF] pb-1">
                {tag.replace('[', '').replace(']', '')}
            </span>
            {/* 
                QA Improvements Implemented:
                1. Title: Increased letter-spacing (tracking-tight instead of tighter) and line-height (leading-tight instead of 1.1).
                2. Body: Increased font size to text-2xl (was text-xl) for better readability and space utilization.
            */}
            <span className={
                type === 'title' 
                ? 'text-6xl font-bold tracking-tight leading-tight' 
                : type === 'intro' 
                ? 'text-3xl font-normal leading-snug' 
                : 'text-2xl leading-relaxed text-[#1A1A1A]'
            }>
                {content}
            </span>
            </div>
        );
        }
        return text;
    };

    return (
        <div 
        className="relative w-[1920px] h-[1080px] overflow-hidden bg-[#F5F5F5] text-[#1A1A1A]"
        style={{
            fontFamily: '"IBM Plex Sans", sans-serif',
        }}
        >
        {/* Font Imports */}

        {/* Grid Overlay (Implicit Visual Structure) */}
        <div className="absolute inset-0 pointer-events-none p-[80px]">
            {/* Top Right Project Code - Brand Identity Element */}
            <div className="absolute top-[80px] right-[80px] text-right">
            <div className="font-mono text-sm text-[#0038FF] font-medium">SA-AI-2025</div>
            <div className="font-mono text-xs text-[#1A1A1A] opacity-50 mt-1">DIAGNOSTIC BLUEPRINT</div>
            </div>

            {/* Decorative Horizontal Rule (The Pipeline Graphic) */}
            <div className="absolute top-[420px] left-[80px] right-[80px] h-[1px] bg-[#1A1A1A] opacity-20"></div>
            
            {/* Decorative Vertical Rules for Columns */}
            <div className="absolute top-[420px] bottom-[80px] left-[653px] w-[1px] bg-[#1A1A1A] opacity-20"></div>
            <div className="absolute top-[420px] bottom-[80px] left-[1266px] w-[1px] bg-[#1A1A1A] opacity-20"></div>
        </div>

        {/* Content Layer */}
        
        {/* Segment 1: Title */}
        <div className="absolute left-[80px] top-[80px] w-[1760px] h-auto font-display text-[#1A1A1A]">
            {renderSegment("[Title] The solution uses a three stage AI pipeline to transform voice recordings into structured medical data", 'title')}
        </div>

        {/* Segment 2: Introduction */}
        {/* QA Improvement: Moved top position from 260px to 300px to reduce vertical crowding with the title. */}
        <div className="absolute left-[80px] top-[300px] w-[1420px] h-[100px] font-body text-[#1A1A1A]">
            {renderSegment("[Introduction] The system aims to reduce administrative burden for doctors by automating the creation of medical letters.", 'intro')}
        </div>

        {/* Bottom Columns Container */}
        
        {/* Segment 3: Column 1 */}
        <div className="absolute left-[80px] top-[480px] w-[533px] h-[420px] flex flex-col justify-between">
            <div>
            {/* Brand Identity: Geometric Shape (Square for Audio) */}
            <div className="w-4 h-4 bg-[#0038FF] mb-6"></div>
            <div className="font-body">
                {renderSegment("[Descriptive text] The pipeline consists of audio transcription via Speechmatics followed by text structuring and letter generation using Claude 4.5.")}
            </div>
            </div>
            <div className="font-mono text-xs text-[#1A1A1A] opacity-40 mt-auto">
            // STAGE_01: INGESTION
            </div>
        </div>

        {/* Segment 4: Column 2 */}
        <div className="absolute left-[693px] top-[480px] w-[533px] h-[420px] flex flex-col justify-between">
            <div>
            {/* Brand Identity: Geometric Shape (Circle for Logic/LLM) */}
            <div className="w-4 h-4 rounded-full bg-[#0038FF] mb-6"></div>
            <div className="font-body">
                {renderSegment("[Descriptive text] The technology stack is built on AWS Lambda with Docker, PostgreSQL, and S3 storage.")}
            </div>
            </div>
            <div className="font-mono text-xs text-[#1A1A1A] opacity-40 mt-auto">
            // STAGE_02: INFRASTRUCTURE
            </div>
        </div>

        {/* Segment 5: Column 3 */}
        <div className="absolute left-[1306px] top-[480px] w-[534px] h-[420px] flex flex-col justify-between">
            <div>
            {/* Brand Identity: Geometric Shape (Triangle for Security/Auth) */}
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-[#0038FF] mb-6"></div>
            <div className="font-body">
                {renderSegment("[Descriptive text] Integrations include Auth0 for identity management and M-Files for patient document context extraction.")}
            </div>
            </div>
            <div className="font-mono text-xs text-[#1A1A1A] opacity-40 mt-auto">
            // STAGE_03: INTEGRATION
            </div>
        </div>

        {/* Footer / Status Bar */}
        <div className="absolute bottom-[40px] left-[80px] right-[80px] flex justify-between items-end border-t border-[#1A1A1A] border-opacity-10 pt-4">
            <div className="font-mono text-xs text-[#1A1A1A] opacity-60">
                SMARTARZT ANALYSIS
            </div>
            <div className="font-mono text-xs text-[#0038FF]">
                STATUS: OPTIMIZED
            </div>
        </div>

        </div>
    );
    };

    export default Slide;
    `,

    `
    import React from 'react';

    const Slide = () => {
    return (
        <div className="w-[1920px] h-[1080px] bg-[#F5F5F5] text-[#1A1A1A] overflow-hidden relative font-sans selection:bg-[#0038FF] selection:text-white">
        {/* Font Imports via Style Tag for standalone functionality */}

        {/* Grid Guide (Invisible but structural foundation) */}
        <div className="absolute inset-0 grid grid-cols-12 gap-5 px-[80px] pointer-events-none">
            {/* Left Content Area: Cols 1-5 */}
            {/* Right Content Area: Cols 7-12 */}
        </div>

        {/* LEFT COLUMN CONTENT */}
        <div className="absolute left-[80px] top-[80px] w-[770px]">
            {/* Segment: Title */}
            {/* QA Fix: Reduced font size to 76px and increased leading to 1.1 to fix "wall of text" effect */}
            <h1 className="font-inter-tight font-bold text-[76px] leading-[1.1] tracking-[-0.03em] text-[#1A1A1A] uppercase">
            Architectural mismatches and inconsistent code quality hinder long term maintainability
            </h1>

            {/* Segment: Introduction */}
            <div className="mt-[60px] w-full border-t-[1px] border-[#0038FF] pt-8">
            <p className="font-ibm-sans text-[42px] leading-[1.3] text-[#0038FF] font-medium">
                Significant refactoring is required to move the solution from a prototype to a stable product.
            </p>
            </div>
        </div>

        {/* RIGHT COLUMN CONTENT - THE AUDIT LOG */}
        {/* QA Fix: Increased left margin (1000px -> 1020px) to reduce cramped feeling against vertical divider */}
        <div className="absolute left-[1020px] top-[80px] w-[820px] flex flex-col gap-[40px]">
            
            {/* Segment 1: Monolithic API */}
            <div className="group relative h-[180px] flex flex-col justify-between border-t-[1px] border-[#1A1A1A] pt-4">
            {/* QA Fix: Changed items-start to items-center for perfect vertical alignment of icon and label */}
            <div className="flex justify-between items-center">
                <span className="font-ibm-mono text-[#0038FF] text-sm tracking-wider uppercase font-medium">
                [Descriptive text]
                </span>
                <div className="w-2 h-2 bg-[#1A1A1A] rounded-full"></div>
            </div>
            <p className="font-ibm-sans text-[32px] leading-[1.3] text-[#1A1A1A]">
                The API server is monolithic and mixes configuration with business logic in a single large file.
            </p>
            </div>

            {/* Segment 2: Asyncio */}
            <div className="group relative h-[180px] flex flex-col justify-between border-t-[1px] border-[#1A1A1A] pt-4">
            {/* QA Fix: Changed items-start to items-center */}
            <div className="flex justify-between items-center">
                <span className="font-ibm-mono text-[#0038FF] text-sm tracking-wider uppercase font-medium">
                [Descriptive text]
                </span>
                <div className="w-2 h-2 bg-[#1A1A1A] rounded-full"></div>
            </div>
            <p className="font-ibm-sans text-[32px] leading-[1.3] text-[#1A1A1A]">
                Improper asyncio implementation creates a fake async pattern that blocks performance and adds complexity.
            </p>
            </div>

            {/* Segment 3: Data Point (Latency) - Warning Amber Accent */}
            <div className="group relative h-[180px] flex flex-col justify-between border-t-[4px] border-[#FFB800] pt-4 bg-white/50 px-4 -mx-4">
            {/* QA Fix: Changed items-start to items-center */}
            <div className="flex justify-between items-center">
                <span className="font-ibm-mono text-[#FFB800] text-sm tracking-wider uppercase font-medium">
                [Data Point]
                </span>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#FFB800]"></div>
            </div>
            <p className="font-ibm-sans text-[32px] leading-[1.3] text-[#1A1A1A]">
                Unnecessary preprocessing steps in the audio pipeline add up to <span className="bg-[#FFB800] px-1 text-white font-medium">60 seconds</span> of latency per job.
            </p>
            </div>

            {/* Segment 4: Conclusion */}
            <div className="group relative h-[180px] flex flex-col justify-between border-t-[1px] border-[#1A1A1A] pt-4">
            {/* QA Fix: Changed items-start to items-center */}
            <div className="flex justify-between items-center">
                {/* QA Fix: Changed color to Indigo (#4F46E5) to differentiate Conclusion from Descriptive Text */}
                <span className="font-ibm-mono text-[#4F46E5] text-sm tracking-wider uppercase font-medium">
                [Conclusion]
                </span>
                <div className="w-2 h-2 bg-[#4F46E5]"></div>
            </div>
            <p className="font-ibm-sans text-[32px] leading-[1.3] text-[#1A1A1A]">
                The system lacks observability with no structured metrics or distributed tracing for debugging.
            </p>
            </div>

        </div>

        {/* Decorative Pipeline Line (Vertical Rule) */}
        <div className="absolute left-[925px] top-[80px] bottom-[80px] w-[1px] bg-[#1A1A1A] opacity-20"></div>

        {/* Brand Identity Marker (Subtle) */}
        {/* QA Fix: Increased opacity and font size for better legibility */}
        <div className="absolute bottom-[40px] left-[80px] font-ibm-mono text-sm text-[#1A1A1A] opacity-60">
            SA-AI-2025 // DIAGNOSTIC BLUEPRINT
        </div>
        </div>
    );
    };

    export default Slide;
    `,

    `
    import React from 'react';

    const Slide = () => {
    return (
        <div className="relative w-[1920px] h-[1080px] bg-[#F5F5F5] text-[#1A1A1A] overflow-hidden font-sans selection:bg-[#0038FF] selection:text-white">
        {/* Font Imports */}

        {/* Grid Visualization (Subtle Architectural Lines) */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Vertical Divider (Centered Gutter at 960px) */}
            <div className="absolute left-[960px] top-[80px] bottom-[260px] w-[1px] bg-[#1A1A1A] opacity-10"></div>
            
            {/* Horizontal Dividers for Right Column */}
            <div className="absolute left-[1040px] right-[80px] top-[300px] h-[1px] bg-[#1A1A1A] opacity-10"></div>
            <div className="absolute left-[1040px] right-[80px] top-[540px] h-[1px] bg-[#1A1A1A] opacity-10"></div>
            <div className="absolute left-[80px] right-[80px] top-[820px] h-[1px] bg-[#0038FF] opacity-100"></div>
        </div>

        {/* Segment 1: Title */}
        {/* Reduced width to 800px to increase gutter space next to vertical divider */}
        <div className="absolute left-[80px] top-[80px] w-[800px] h-[220px] flex flex-col justify-start">
            <span className="font-ibm-mono text-sm tracking-widest text-[#0038FF] mb-6 block uppercase">
            [01] Valuation Assessment
            </span>
            {/* Adjusted kerning to tracking-tight for improved readability */}
            <h1 className="font-inter-tight font-bold text-[64px] leading-[1.05] tracking-tight text-[#1A1A1A]">
            The solution has a realistic market value of <span className="text-[#0038FF]">18,000 USD</span> as a functional proof of concept.
            </h1>
        </div>

        {/* Segment 2: Introduction */}
        <div className="absolute left-[80px] top-[340px] w-[800px] h-[160px] flex flex-col justify-start">
            <p className="font-ibm-sans text-[28px] leading-[1.4] text-[#1A1A1A] opacity-80 max-w-[95%]">
            The valuation reflects the trade off between working features and the cost of fixing technical debt.
            </p>
        </div>

        {/* Segment 3: Descriptive Text */}
        {/* Moved start to 1040px to balance gutters around the center line */}
        <div className="absolute left-[1040px] top-[80px] w-[800px] h-[200px] flex flex-col justify-start">
            <span className="font-ibm-mono text-xs text-[#1A1A1A] opacity-50 mb-4 block uppercase">
            // Primary Value Driver
            </span>
            <p className="font-ibm-sans text-[32px] leading-[1.3] text-[#1A1A1A]">
            The primary value is found in the working integrations and the specialized medical prompt engineering.
            </p>
        </div>

        {/* Segment 4: Data Point (Risk/Cost) */}
        <div className="absolute left-[1040px] top-[320px] w-[800px] h-[200px] flex flex-col justify-center">
            <div className="flex items-start gap-6">
            {/* Adjusted mt to align icon with the cap height of the label text */}
            <div className="w-4 h-4 mt-[1px] bg-[#D97706] flex-shrink-0"></div> 
            <div>
                {/* Darker amber color for better contrast/accessibility */}
                <span className="font-ibm-mono text-xs text-[#D97706] mb-2 block uppercase font-medium">
                [!] Compliance Gap
                </span>
                <p className="font-ibm-sans text-[24px] leading-[1.4] text-[#1A1A1A]">
                An additional investment of <span className="font-ibm-mono font-medium border-b-2 border-[#D97706] pb-0.5">120,000 to 180,000 USD</span> is required to reach production grade security and compliance.
                </p>
            </div>
            </div>
        </div>

        {/* Segment 5: Data Point (Time Saving) */}
        <div className="absolute left-[1040px] top-[560px] w-[800px] h-[200px] flex flex-col justify-center">
            <div className="flex items-start gap-6">
            <div className="w-4 h-4 mt-[1px] bg-[#0038FF] rounded-full flex-shrink-0"></div>
            <div>
                <span className="font-ibm-mono text-xs text-[#0038FF] mb-2 block uppercase font-medium">
                [+] R&D Acceleration
                </span>
                <p className="font-ibm-sans text-[24px] leading-[1.4] text-[#1A1A1A]">
                Buying this solution saves approximately <span className="font-ibm-mono font-medium">3 months</span> of initial research and development time.
                </p>
            </div>
            </div>
        </div>

        {/* Segment 6: Conclusion */}
        {/* Moved up slightly to 840px and used flex items-stretch to align the blue bar with text height */}
        <div className="absolute left-[80px] top-[840px] w-[1760px] flex items-start bg-[#F5F5F5] pt-8">
            <div className="w-[250px] flex-shrink-0 pt-2">
                <span className="font-ibm-mono text-sm text-[#1A1A1A] bg-[#1A1A1A] text-white px-2 py-1 uppercase">
                    Final Verdict
                </span>
            </div>
            <div className="flex-grow flex items-stretch">
                {/* Vertical Bar - Stretches to match text height */}
                <div className="w-1 bg-[#0038FF] mr-8 flex-shrink-0"></div>
                {/* Text Block */}
                <div className="flex-1">
                    <p className="font-inter-tight font-bold text-[42px] leading-[1.1] tracking-tight text-[#1A1A1A]">
                        This is a strong demonstration tool for securing funding but <span className="text-[#D97706]">not a ready to scale product.</span>
                    </p>
                </div>
            </div>
        </div>

        {/* Brand Footer / Meta Data */}
        {/* Increased bottom spacing to 60px to prevent text crowding */}
        <div className="absolute bottom-[60px] left-[80px] right-[80px] flex justify-between items-end font-ibm-mono text-xs text-[#1A1A1A] opacity-40">
            <span>SA-AI-2025 // DIAGNOSTIC BLUEPRINT</span>
            <span>CONFIDENTIAL AUDIT</span>
        </div>
        </div>
    );
    };

    export default Slide;
    `,

    `
    import React from 'react';

    const Slide = () => {
    return (
        <div className="w-[1920px] h-[1080px] bg-[#0038FF] text-[#F5F5F5] relative overflow-hidden font-sans selection:bg-[#FFB800] selection:text-[#1A1A1A]">
        {/* Font Imports via Style Tag for standalone functionality */}
        {/* ---------------------------------------------------------------------------
            BRAND META DATA (Project Code & Status)
            Typography: IBM Plex Mono
        --------------------------------------------------------------------------- */}
        <div className="absolute top-[60px] left-[360px] font-['IBM_Plex_Mono'] text-sm tracking-widest opacity-80">
            PROJECT CODE: SA-AI-2025
        </div>

        <div className="absolute top-[60px] right-[120px] font-['IBM_Plex_Mono'] text-sm tracking-widest opacity-80 text-right">
            STATUS: AUDIT COMPLETE
        </div>

        <div className="absolute bottom-[60px] left-[360px] font-['IBM_Plex_Mono'] text-xs opacity-60">
            DIAGNOSTIC BLUEPRINT // 16:9
        </div>

        {/* ---------------------------------------------------------------------------
            SEGMENT 1: TITLE
            Coordinates: [(360, 400), (1560, 400), (1560, 550), (360, 550)]
            Typography: Inter Tight (Bold), Tight Tracking (-2%)
            Alignment: Flush Left
        --------------------------------------------------------------------------- */}
        <div 
            className="absolute flex flex-col justify-start items-start"
            style={{
            left: '360px',
            top: '400px',
            width: '1200px', // 1560 - 360
            height: '150px'  // 550 - 400
            }}
        >
            {/* Decorative Label above title */}
            <div className="mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#FFB800]" /> {/* Warning Amber Accent */}
            <span className="font-['IBM_Plex_Mono'] text-sm tracking-widest uppercase opacity-80">
                Executive Summary
            </span>
            </div>

            <h1 className="font-['Inter_Tight'] font-bold text-[80px] leading-[0.9] tracking-[-0.04em] text-[#F5F5F5] uppercase">
            Analysis of <br />
            {/* Improved contrast: Removed gradient, set to solid white */}
            <span className="text-[#F5F5F5]">
                Smartarzt AI solution
            </span>
            </h1>
        </div>

        {/* ---------------------------------------------------------------------------
            SEGMENT 2: CONCLUSION
            Coordinates: Adjusted to align with Title (Left 360px)
            Typography: IBM Plex Sans (Workhorse) / Mono Mix
            Alignment: Flush Left
        --------------------------------------------------------------------------- */}
        <div 
            className="absolute flex flex-col justify-center items-start border-l border-[#FFB800] pl-6"
            style={{
            left: '360px', // Aligned with main title axis
            top: '700px',
            width: '400px',
            height: '80px'
            }}
        >
            <div className="font-['IBM_Plex_Mono'] text-xs text-[#FFB800] mb-1 tracking-widest uppercase">
            [ Conclusion ]
            </div>
            <h2 className="font-['IBM_Plex_Sans'] font-medium text-4xl text-[#F5F5F5] tracking-tight">
            Thank You
            </h2>
        </div>

        {/* ---------------------------------------------------------------------------
            DECORATIVE FOOTER ELEMENTS
            Aligned bottom with left metadata (60px)
        --------------------------------------------------------------------------- */}
        <div className="absolute bottom-[60px] right-[120px] flex gap-8">
            <div className="flex flex-col gap-1">
            <span className="font-['IBM_Plex_Mono'] text-[10px] opacity-50 uppercase">System</span>
            <span className="font-['IBM_Plex_Mono'] text-sm">v.2.0.4</span>
            </div>
            <div className="flex flex-col gap-1">
            <span className="font-['IBM_Plex_Mono'] text-[10px] opacity-50 uppercase">Security</span>
            <span className="font-['IBM_Plex_Mono'] text-sm text-[#FFB800]">Flagged</span>
            </div>
        </div>

        </div>
    );
    };

    export default Slide;
    `
];

interface PresentationEditorProps {
    onLogoClick?: () => void;
}

export default function PresentationEditor({ onLogoClick }: PresentationEditorProps = {}) {
    const [slides, setSlides] = useState<string[]>(INITIAL_SLIDES);
    const [activeSlide, setActiveSlide] = useState(0);
    const [chatInput, setChatInput] = useState("");
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

    // Handle slide code updates from inline editing
    const handleSlideUpdate = useCallback((index: number, newCode: string) => {
        setSlides(prev => {
            const updated = [...prev];
            updated[index] = newCode;
            return updated;
        });
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-slate-800 font-sans">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    {onLogoClick ? (
                        <button
                            onClick={onLogoClick}
                            className="text-xl font-light text-brand tracking-tight hover:opacity-80 transition-opacity"
                        >
                            flashslides
                        </button>
                    ) : (
                        <Link href="/dashboard" className="text-xl font-light text-brand tracking-tight hover:opacity-80 transition-opacity">
                            flashslides
                        </Link>
                    )}
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                        <input
                            type="text"
                            defaultValue="Untitled Presentation"
                            className="text-sm text-slate-900 border-none focus:ring-0 p-0 w-48 hover:bg-gray-50 rounded px-2 -ml-2 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-brand transition-colors">
                        <Settings className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Thumbnails */}
                <aside
                    className={`${isLeftSidebarOpen ? "w-60" : "w-0 border-r-0"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden relative`}
                >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 w-60">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slides</span>
                        <button
                            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <PanelRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 w-60">
                        {slides.map((slideCode, index) => (
                            <div key={index} className="content-visibility-auto">
                                <SlideCodeThumbnail
                                    code={slideCode}
                                    isActive={activeSlide === index}
                                    onClick={() => setActiveSlide(index)}
                                    slideNumber={index + 1}
                                />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Collapsed Sidebar Toggle (Visible when closed) */}
                {!isLeftSidebarOpen && (
                    <div className="absolute left-4 top-20 z-20">
                        <button
                            onClick={() => setIsLeftSidebarOpen(true)}
                            className="p-2 bg-white border border-gray-200 shadow-sm text-slate-400 hover:text-brand rounded-lg hover:shadow transition-all"
                        >
                            <PanelLeft className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Center Canvas */}
                <main className="flex-1 bg-gray-100/50 overflow-hidden flex items-center justify-center p-8 relative">
                    <div className="bg-white rounded-sm shadow-lg w-full aspect-[16/9] relative mx-auto transition-all overflow-hidden max-w-[calc((100vh-140px)*16/9)]">
                        {slides[activeSlide] && (
                            <EditableScaledSlide
                                code={slides[activeSlide]}
                                onCodeChange={(newCode) => handleSlideUpdate(activeSlide, newCode)}
                            />
                        )}
                    </div>
                </main>

                {/* Right Sidebar - Chat Interface */}
                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col selection:bg-brand selection:text-white">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Edit with Copilot</span>
                        <div className="flex items-center gap-1">
                            <button
                                className="p-1.5 rounded text-slate-400 hover:text-brand transition-colors"
                                title="New chat"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                className="p-1.5 rounded text-slate-400 hover:text-brand transition-colors"
                                title="Chat history"
                            >
                                <Clock className="w-4 h-4" />
                            </button>
                            <button
                                className="p-1.5 rounded text-slate-400 hover:text-brand transition-colors"
                                title="More options"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Initial system message */}
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                                <div className="w-4 h-4 text-brand font-bold text-[10px] flex items-center justify-center">FS</div>
                            </div>
                            <div className="flex flex-col gap-1 max-w-[85%]">
                                <span className="text-xs font-medium text-slate-900">FlashSlides Copilot</span>
                                <div className="p-3 bg-gray-50 rounded-2xl rounded-tl-none text-sm text-slate-600 leading-relaxed">
                                    I&apos;ve generated your presentation based on the provided content. You can ask me to modify any slide, add images, or rewrite text.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-2 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-2 border-2 border-gray-200 focus-within:border-brand rounded-2xl bg-white transition-all pr-1.5 pl-3">
                            <textarea
                                placeholder="Edit slide with AI..."
                                className="flex-1 py-2 bg-transparent !border-none !ring-0 !outline-none !shadow-none resize-none text-sm text-left text-slate-700 placeholder:text-slate-400 min-h-[36px] leading-5"
                                rows={1}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button
                                disabled={!chatInput.trim()}
                                className="flex-shrink-0 w-7 h-7 !bg-gray-100 !text-slate-400 rounded-lg transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:!bg-brand hover:enabled:!text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-400">
                            AI can make mistakes. Please review generated content.
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

// PropertyItem component - reserved for future use
// function PropertyItem({ icon: Icon, label, hasDropdown = false }: { icon: typeof ChevronRight, label: string, hasDropdown?: boolean }) {
//     return (
//         <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 text-sm text-slate-600 transition-colors group">
//             <div className="flex items-center gap-3">
//                 <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
//                 <span className="font-medium">{label}</span>
//             </div>
//             <ChevronRight className={`w-3.5 h-3.5 text-slate-300 transition-transform ${hasDropdown ? "rotate-90" : ""}`} />
//         </button>
//     );
// }
