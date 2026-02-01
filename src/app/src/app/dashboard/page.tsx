"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PresentationCard from "../components/dashboard/PresentationCard";
import { Search, FileText, LayoutGrid, List, Filter, ArrowUpDown, ChevronDown, Check, Plus, Sparkles, CheckCircle, X } from "lucide-react";
import { useActiveUI } from "../contexts/ActiveUIContext";
import { useGlobalTransition } from "./contexts/GlobalTransitionContext";
import { useUser } from "../contexts/UserContext";

// Sample presentations data - in production this would come from an API
const presentations = [
    {
        id: 1,
        title: "Smartarzt AI Solution Analysis",
        createdAt: "Created 3 days ago",
        lastModified: "Modified 2 hours ago",
        lastModifiedDate: "2023-11-15T14:00:00Z",
        owner: { name: "Dr. Sarah Weber" },
        status: "published" as const,
        slideCount: 12,
        viewCount: 1240
    },
    {
        id: 2,
        title: "FinAI",
        createdAt: "Created 2 months ago",
        lastModified: "Modified 1 day ago",
        lastModifiedDate: "2023-11-14T10:00:00Z",
        owner: { name: "You" },
        status: "draft" as const,
        slideCount: 8,
        viewCount: 45
    },
    {
        id: 3,
        title: "Quarterly Business Review",
        createdAt: "Created 2 months ago",
        lastModified: "Modified 3 days ago",
        lastModifiedDate: "2023-11-12T09:30:00Z",
        owner: { name: "Mark Johnson" },
        status: "shared" as const,
        slideCount: 15,
        viewCount: 890
    },
    {
        id: 4,
        title: "Marketing Strategy",
        createdAt: "Created 2 months ago",
        lastModified: "Modified 1 week ago",
        lastModifiedDate: "2023-11-08T16:20:00Z",
        owner: { name: "You" },
        status: "draft" as const,
        slideCount: 10,
        viewCount: 120
    },
    {
        id: 5,
        title: "Investment Pitch Deck",
        createdAt: "Created 2 months ago",
        lastModified: "Modified 2 weeks ago",
        lastModifiedDate: "2023-11-01T11:00:00Z",
        owner: { name: "You" },
        status: "draft" as const,
        slideCount: 18,
        viewCount: 340
    },
    {
        id: 6,
        title: "FinAI: AI-Powered Personal Finance",
        createdAt: "Created 2 months ago",
        lastModified: "Modified 1 month ago",
        lastModifiedDate: "2023-10-15T13:45:00Z",
        owner: { name: "Alex Chen" },
        status: "shared" as const,
        slideCount: 22,
        viewCount: 2100
    },
];


// Reserved for future animated text feature
// const ROTATING_TEXTS = [
//     "Transforming Strategy Docs...",
//     "Transforming Rough Bullets...",
//     "Transforming PDFs...",
// ];

// Separate component for handling payment success (uses useSearchParams which needs Suspense)
function PaymentSuccessHandler({ onSuccess }: { onSuccess: () => void }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshProfile } = useUser();

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            onSuccess();

            // Refresh profile to update credit balance after payment
            refreshProfile();

            // Clean URL to prevent toast reappearing on refresh
            router.replace('/dashboard');
        }
    }, [searchParams, router, onSuccess, refreshProfile]);

    return null;
}

export default function DashboardPage() {
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    const handlePaymentSuccess = useCallback(() => {
        setShowPaymentSuccess(true);
        // Auto-hide toast after 5 seconds
        setTimeout(() => setShowPaymentSuccess(false), 5000);
    }, []);

    const [searchQuery, setSearchQuery] = useState("");

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState<"latest" | "alphabetical" | "viewed">("latest");
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const { activeElement, setActiveElement } = useActiveUI();
    const isSearchActive = activeElement === "search";
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { navigateWithTransition } = useGlobalTransition();

    const sortMenuRef = useRef<HTMLDivElement>(null);

    // Click outside handler for Sort Menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSortMenuOpen && sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSortMenuOpen]);


    const handleNewPresentation = () => {
        const presentationId = crypto.randomUUID();
        const targetUrl = `/presentations/${presentationId}`;

        navigateWithTransition(targetUrl);
    };

    const filteredPresentations = presentations.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedPresentations = [...filteredPresentations].sort((a, b) => {
        if (sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'viewed') {
            return b.viewCount - a.viewCount;
        } else {
            // latest
            return new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime();
        }
    });

    const handleActivateSearch = () => {
        setActiveElement("search");
    };

    const handleExitSearch = useCallback(() => {
        setActiveElement(null);
        setSearchQuery("");
    }, [setActiveElement]);

    // Focus input when search becomes active
    useEffect(() => {
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchActive]);

    // Clear search query when search is deactivated by another element
    useEffect(() => {
        if (!isSearchActive) {
            setSearchQuery("");
        }
    }, [isSearchActive]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSearchActive && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                handleExitSearch();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchActive, handleExitSearch]);

    // Keyboard navigation handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isSearchActive) return;

            if (event.key === "Escape") {
                event.preventDefault();
                handleExitSearch();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSearchActive, handleExitSearch]);

    const getSortLabel = (sort: typeof sortBy) => {
        switch (sort) {
            case 'latest': return 'Latest';
            case 'alphabetical': return 'Alphabetical';
            case 'viewed': return 'Most Viewed';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Payment Success Handler - wrapped in Suspense for useSearchParams */}
            <Suspense fallback={null}>
                <PaymentSuccessHandler onSuccess={handlePaymentSuccess} />
            </Suspense>

            {/* Payment Success Toast */}
            <AnimatePresence>
                {showPaymentSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-3.5 rounded-xl shadow-lg"
                    >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium text-sm">Payment Successful!</p>
                            <p className="text-xs text-green-600">Credits have been added to your account.</p>
                        </div>
                        <button
                            onClick={() => setShowPaymentSuccess(false)}
                            className="ml-2 p-1 hover:bg-green-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Header with Search Bar and View Toggle */}
            <div className="px-8 pt-4 pb-6">
                <div className="flex items-center justify-between gap-8">
                    <div>
                        <h1 className="text-lg font-medium text-gray-900 tracking-wide">Your presentations</h1>
                        <p className="text-sm text-gray-500 mt-1 font-normal">{filteredPresentations.length} presentations</p>
                    </div>

                    {/* Right Side: Search + Filter + Sort + Toggle */}
                    <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            {isSearchActive ? (
                                <div ref={searchContainerRef} className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 w-full shadow-sm transition-all">
                                    <Search className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search presentations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 text-[13px] text-gray-900 placeholder-gray-500 bg-transparent outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleExitSearch}
                                        className="text-[10px] bg-gray-200/80 text-gray-500 px-1.5 py-0.5 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors tracking-wide font-medium uppercase"
                                    >
                                        Esc
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleActivateSearch}
                                    className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                                >
                                    <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-500" strokeWidth={1.5} />
                                    <span className="flex-1 text-[13px]">Search presentations...</span>
                                </button>
                            )}
                        </div>

                        {/* Filter Button */}
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-600">
                            <Filter size={15} strokeWidth={1.5} />
                            <span className="text-[13px] font-medium hidden sm:inline">Filter</span>
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative" ref={sortMenuRef}>
                            <button
                                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-600 min-w-[140px]"
                            >
                                <ArrowUpDown size={14} strokeWidth={1.5} />
                                <span className="text-[13px] font-medium flex-1 text-left">Sort: {getSortLabel(sortBy)}</span>
                                <ChevronDown size={14} strokeWidth={1.5} className="text-gray-400" />
                            </button>

                            {/* Sort Menu */}
                            <AnimatePresence>
                                {isSortMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1"
                                    >
                                        {(['latest', 'alphabetical', 'viewed'] as const).map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSortBy(option);
                                                    setIsSortMenuOpen(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 text-gray-700"
                                            >
                                                <span>{getSortLabel(option)}</span>
                                                {sortBy === option && <Check size={14} className="text-brand" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        {/* View Toggle */}
                        <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-brand shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <LayoutGrid size={18} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-brand shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <List size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Presentations Content */}
            <div className="px-8 pb-8">
                {filteredPresentations.length > 0 ? (
                    <>
                        {viewMode === "list" && (
                            <div className="flex items-center gap-6 px-6 py-2 border-b border-gray-100 mb-2">
                                <div className="flex-[2] text-xs font-medium text-gray-400 uppercase tracking-wider">Presentation</div>
                                <div className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</div>
                                <div className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</div>
                                <div className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Modified</div>
                                <div className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</div>
                                <div className="w-8"></div>
                            </div>
                        )}
                        <div
                            className="w-full"
                            style={{
                                display: viewMode === 'grid' ? 'grid' : 'flex',
                                flexDirection: 'column',
                                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(240px, 1fr))' : 'none',
                                gap: viewMode === 'grid' ? '1.5rem' : '0'
                            }}
                        >
                            {sortedPresentations.map((p) => (
                                <PresentationCard
                                    key={p.id}
                                    title={p.title}
                                    createdAt={p.createdAt}
                                    viewMode={viewMode}
                                    lastModified={p.lastModified}
                                    owner={p.owner}
                                    status={p.status}
                                    slideCount={p.slideCount}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        {searchQuery ? (
                            <>
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No presentations found</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                    We couldn&apos;t find any presentations matching &quot;{searchQuery}&quot;. Try a different search term.
                                </p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-6 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear search
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-brand/5 rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Sparkles className="w-10 h-10 text-brand" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create your first presentation</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
                                    Get started by generating a presentation with AI or creating one from scratch using our advanced editor.
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleNewPresentation}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-full font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <Plus className="w-4 h-4" strokeWidth={2} />
                                        <span>New Presentation</span>
                                    </button>
                                    <button
                                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-400 text-sm font-medium rounded-full cursor-not-allowed flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                                        <span>Browse Templates</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom spacing */}
            <div className="h-8"></div>
        </div>
    );
}