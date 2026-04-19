"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getMyNotices } from "@/lib/api/student";
import { Loader2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
    ASSIGNMENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TEST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    NOTICE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    EVENT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const borderColors: Record<string, string> = {
    ASSIGNMENT: "border-l-blue-500",
    TEST: "border-l-red-500",
    NOTICE: "border-l-amber-500",
    EVENT: "border-l-green-500",
};

interface Notice {
    id: number;
    title: string;
    content: string;
    type: string;
    dueDate: string | null;
    createdAt: string;
    teacher: { id: number; name: string };
}

export default function StudentNoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        getMyNotices()
            .then(setNotices)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === "ALL"
        ? notices
        : notices.filter((n) => n.type === filter);

    return (
        <AuthGuard allowedRole="student">
            <Topbar title="Notice board" subtitle={`${notices.length} notices`} />
            <div className="p-6 space-y-4">

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {["ALL", "ASSIGNMENT", "TEST", "NOTICE", "EVENT"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                filter === t
                                    ? "bg-primary text-primary-foreground border-transparent"
                                    : "border-border text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg flex flex-col items-center gap-2">
                        <Bell className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No notices found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((notice) => (
                            <div
                                key={notice.id}
                                className={cn(
                                    "border rounded-lg p-4 border-l-4 space-y-2",
                                    borderColors[notice.type]
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeColors[notice.type])}>
                      {notice.type}
                    </span>
                                        <span className="font-semibold text-sm">{notice.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                                </div>

                                <p className="text-sm text-muted-foreground">{notice.content}</p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>By {notice.teacher.name}</span>
                                    {notice.dueDate && (
                                        <span className="font-medium text-amber-600 dark:text-amber-400">
                      Due: {new Date(notice.dueDate).toLocaleDateString()}
                    </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}