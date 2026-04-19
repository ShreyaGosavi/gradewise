"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getMyAttendance } from "@/lib/api/student";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentAttendancePage() {
    const [attendance, setAttendance] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyAttendance()
            .then(setAttendance)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const subjects = Object.values(attendance) as any[];

    const getColor = (pct: number) => {
        if (pct >= 75) return "bg-green-500";
        if (pct >= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    const getTextColor = (pct: number) => {
        if (pct >= 75) return "text-green-600 dark:text-green-400";
        if (pct >= 60) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    const getBgColor = (pct: number) => {
        if (pct >= 75) return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800";
        if (pct >= 60) return "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800";
        return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800";
    };

    return (
        <AuthGuard allowedRole="student">
            <Topbar title="My attendance" />
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((s: any) => (
                            <div key={s.subjectId} className={cn("border rounded-lg p-4 space-y-3", getBgColor(s.percentage))}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">{s.subjectName}</h3>
                                    <span className={cn("text-lg font-bold", getTextColor(s.percentage))}>
                    {s.percentage}%
                  </span>
                                </div>

                                <div className="h-2 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all", getColor(s.percentage))}
                                        style={{ width: `${s.percentage}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{s.attended} lectures attended</span>
                                    <span>{s.totalLectures} total lectures</span>
                                </div>

                                {s.percentage < 75 && (
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                        ⚠ Below 75% — attendance is low
                                    </p>
                                )}

                                {/* Lecture breakdown */}
                                {s.lectures.length > 0 && (
                                    <div className="space-y-1 pt-1 border-t border-current/10">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Lecture history</p>
                                        <div className="flex flex-wrap gap-1">
                                            {s.lectures.map((l: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-6 h-6 rounded text-xs flex items-center justify-center font-medium",
                                                        l.isPresent
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-400 text-white"
                                                    )}
                                                    title={`${new Date(l.date).toLocaleDateString()} - Lecture ${l.lectureNo}`}
                                                >
                                                    {l.isPresent ? "P" : "A"}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}