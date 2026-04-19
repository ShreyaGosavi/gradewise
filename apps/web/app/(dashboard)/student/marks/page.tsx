"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getMyMarks } from "@/lib/api/student";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
    INSEM1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    INSEM2: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    ENDSEM: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    INTERNAL: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PRACTICAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ORAL: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export default function StudentMarksPage() {
    const [marks, setMarks] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
        getMyMarks()
            .then((data) => {
                setMarks(data);
                const first = Object.keys(data)[0];
                if (first) setSelected(first);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const subjects = Object.keys(marks);
    const selectedMarks = selected ? Object.entries(marks[selected] || {}) : [];

    return (
        <AuthGuard allowedRole="student">
            <Topbar title="My marks" />
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                        No marks available yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Subject selector */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-muted/50 border-b">
                                <p className="text-xs font-medium text-muted-foreground">Subjects</p>
                            </div>
                            <div className="divide-y">
                                {subjects.map((subject) => {
                                    const subjectMarks = Object.values(marks[subject]) as any[];
                                    const internal = subjectMarks.find((m: any) => m.type === "INTERNAL");
                                    return (
                                        <button
                                            key={subject}
                                            onClick={() => setSelected(subject)}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                                                selected === subject && "bg-primary/5 border-l-2 border-l-primary"
                                            )}
                                        >
                                            <p className="font-medium">{subject}</p>
                                            {internal && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                                    Internal: {internal.obtained}/{internal.total}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Marks detail */}
                        <div className="md:col-span-2 border rounded-lg p-5 space-y-4">
                            {selected && (
                                <>
                                    <h3 className="font-semibold">{selected}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {selectedMarks.map(([type, markData]: [string, any]) => {
                                            const pct = Math.round((markData.obtained / markData.total) * 100);
                                            return (
                                                <div
                                                    key={type}
                                                    className="border rounded-lg p-3 space-y-2 text-center"
                                                >
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium inline-block", typeColors[type])}>
                            {type}
                          </span>
                                                    <div>
                                                        <p className="text-2xl font-bold">{markData.obtained}</p>
                                                        <p className="text-xs text-muted-foreground">/ {markData.total}</p>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                pct >= 60 ? "bg-green-500" : "bg-red-500"
                                                            )}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{pct}%</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}