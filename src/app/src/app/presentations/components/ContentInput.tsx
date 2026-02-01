"use client";

import { FileText, Upload } from "lucide-react";

export default function ContentInput() {
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-brand" />
                <h2 className="text-sm text-black">Input content for slides</h2>
            </div>

            <textarea
                className="w-full flex-grow resize-none border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-brand focus:border-transparent text-sm text-gray-700 placeholder-gray-400 leading-relaxed mb-4"
                style={{ minHeight: "200px", caretColor: "#1a2fee" }}
                placeholder="Paste your content here - documents, notes, research, or any text you want to turn into a presentation..."
            />

            <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50 opacity-60 cursor-not-allowed">
                <div className="absolute top-3 right-3">
                    <span className="bg-gray-100/80 backdrop-blur-sm text-gray-500 text-[10px] px-2.5 py-1 rounded-full font-medium border border-gray-200 uppercase tracking-wider">Coming Soon</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-brand/60" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Upload documents</h3>
                <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
                    Upload PDF, DOCX, or TXT files to create a presentation directly from your documents
                </p>
            </div>
        </div>
    );
}
