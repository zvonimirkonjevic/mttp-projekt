import Image from "next/image";
import { MoreHorizontal, Presentation, Calendar, Layers, Clock, User, CheckCircle2, Circle } from "lucide-react";

interface PresentationCardProps {
    title: string;
    createdAt: string;
    thumbnailUrl?: string;
    viewMode?: "grid" | "list";
    slideCount?: number;
    lastModified?: string;
    owner?: {
        name: string;
        avatar?: string;
    };
    status?: "draft" | "published" | "shared";
}

export default function PresentationCard({
    title,
    createdAt,
    thumbnailUrl,
    viewMode = "grid",
    slideCount = 12,
    lastModified = "Just now",
    owner = { name: "You" },
    status = "draft",
}: PresentationCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-green-100 text-green-700 border-green-200";
            case "shared": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    // List view - Detailed row layout
    if (viewMode === "list") {
        return (
            <div className="group flex items-center gap-6 px-6 py-4 bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-all cursor-pointer">
                {/* 1. Thumbnail + Title (Grow) */}
                <div className="flex items-center gap-4 flex-[2] min-w-0">
                    <div className="w-14 h-9 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200/60 rounded">
                        <Presentation className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-brand transition-colors">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Layers className="w-3 h-3" strokeWidth={1.5} />
                                {slideCount} slides
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Owner */}
                <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                    <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {owner.avatar ? (
                            <Image src={owner.avatar} alt={owner.name} width={24} height={24} className="object-cover" />
                        ) : (
                            <User className="w-3.5 h-3.5 text-gray-400" />
                        )}
                    </div>
                    <span className="text-sm text-gray-600 truncate">{owner.name}</span>
                </div>

                {/* 3. Status */}
                <div className="flex-1 min-w-[100px]">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status === "published" && <CheckCircle2 className="w-3 h-3" />}
                        {status === "draft" && <Circle className="w-3 h-3" />}
                        {status === "shared" && <User className="w-3 h-3" />}
                        <span className="capitalize">{status}</span>
                    </span>
                </div>

                {/* 4. Last Modified */}
                <div className="flex-1 min-w-[140px] text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{lastModified}</span>
                    </div>
                </div>

                {/* 5. Created */}
                <div className="flex-1 min-w-[140px] text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{createdAt}</span>
                    </div>
                </div>

                {/* Actions */}
                <button className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal size={16} strokeWidth={1.5} />
                </button>
            </div>
        );
    }

    // Grid view - card with thumbnail
    return (
        <div className="group relative flex flex-col w-full cursor-pointer">
            {/* Card Thumbnail */}
            <div className="relative aspect-[16/10] w-full bg-white border border-gray-200/80 overflow-hidden mb-4 group-hover:border-gray-300 group-hover:shadow-sm transition-all duration-300 rounded-lg">
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 p-6 flex flex-col">
                        {/* Professional slide preview */}
                        <div className="flex-1 flex flex-col">
                            {/* Title bar */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-brand/60" />
                                    <div className="w-20 h-1.5 bg-gray-200/80" />
                                </div>
                                <div className="w-8 h-1.5 bg-gray-100" />
                            </div>

                            {/* Content area */}
                            <div className="flex-1 flex gap-4">
                                {/* Left - Text lines */}
                                <div className="flex-1 space-y-2">
                                    <div className="w-full h-2 bg-gray-200/60" />
                                    <div className="w-4/5 h-2 bg-gray-150/50" />
                                    <div className="w-3/5 h-2 bg-gray-100/60" />
                                    <div className="mt-4 space-y-1.5">
                                        <div className="w-full h-1 bg-gray-100/80" />
                                        <div className="w-5/6 h-1 bg-gray-100/60" />
                                        <div className="w-4/6 h-1 bg-gray-100/40" />
                                    </div>
                                </div>

                                {/* Right - Chart */}
                                <div className="w-1/3 flex items-end gap-1 pb-2">
                                    <div className="w-1/4 h-2/5 bg-brand/15" />
                                    <div className="w-1/4 h-3/5 bg-brand/25" />
                                    <div className="w-1/4 h-4/5 bg-brand/35" />
                                    <div className="w-1/4 h-full bg-brand/50" />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 mt-auto border-t border-gray-100/80">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-1 bg-gray-100" />
                                <div className="text-[8px] text-gray-300 font-medium tracking-widest">FLASHSLIDES</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* More button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button className="p-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-white transition-all shadow-sm rounded">
                        <MoreHorizontal size={14} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Slide count badge */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm border border-gray-200 text-xs text-gray-600 shadow-sm rounded">
                        <Layers className="w-3 h-3" strokeWidth={1.5} />
                        <span>{slideCount}</span>
                    </div>
                </div>
            </div>

            {/* Card Metadata */}
            <div className="flex flex-col gap-1 px-1">
                <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-brand transition-colors leading-snug">
                    {title}
                </h3>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" strokeWidth={1.5} />
                        {createdAt}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize border border-gray-200">
                        {status}
                    </span>
                </div>
            </div>
        </div>
    );
}


