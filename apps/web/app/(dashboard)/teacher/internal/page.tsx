"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getTeacherMe, calculateInternal } from "@/lib/api/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assignment {
    id: number;
    subject: { id: number; name: string };
    class: { id: number; year: string; department: string; division: string };
}

export default function InternalMarksPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selected, setSelected] = useState<Assignment | null>(null);
    const [totalInternal, setTotalInternal] = useState(25);
    const [attendanceMarks, setAttendanceMarks] = useState(5);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getTeacherMe()
            .then((profile) => {
                setAssignments(profile.subjectAssignments);
                if (profile.subjectAssignments.length > 0) {
                    setSelected(profile.subjectAssignments[0]);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCalculate = async () => {
        if (!selected) return;
        setCalculating(true);
        setError("");
        setResult(null);
        try {
            const res = await calculateInternal({
                classId: selected.class.id,
                subjectId: selected.subject.id,
                totalInternal,
                attendanceMarks,
            });
            setResult(res);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to calculate");
        } finally {
            setCalculating(false);
        }
    };

    return (
        <AuthGuard allowedRole="teacher">
            <Topbar title="Internal marks calculator" />
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Subject selector */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-muted/50 border-b">
                                <p className="text-xs font-medium text-muted-foreground">Select subject</p>
                            </div>
                            <div className="divide-y">
                                {assignments.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => { setSelected(a); setResult(null); setError(""); }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                                            selected?.id === a.id && "bg-primary/5 border-l-2 border-l-primary"
                                        )}
                                    >
                                        <p className="font-medium">{a.subject.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {a.class.year}-{a.class.department}-{a.class.division}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calculator */}
                        <div className="md:col-span-2 border rounded-lg p-5 space-y-5">
                            {selected && (
                                <>
                                    <div>
                                        <h3 className="font-semibold">{selected.subject.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {selected.class.year}-{selected.class.department}-{selected.class.division}
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">How it works</p>
                                        <p className="text-sm text-muted-foreground">
                                            All mark slots get equal weightage from
                                            <span className="font-medium text-foreground"> (total − attendance marks)</span>.
                                            Attendance is converted proportionally.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Total internal marks</Label>
                                            <Input
                                                type="number"
                                                value={totalInternal}
                                                onChange={(e) => setTotalInternal(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Marks for attendance</Label>
                                            <Input
                                                type="number"
                                                value={attendanceMarks}
                                                onChange={(e) => setAttendanceMarks(Number(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Marks for exam slots: {totalInternal - attendanceMarks}
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                                            {error}
                                        </div>
                                    )}

                                    <Button onClick={handleCalculate} disabled={calculating} className="w-full">
                                        {calculating
                                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            : <Calculator className="w-4 h-4 mr-2" />
                                        }
                                        Calculate & save internal marks
                                    </Button>

                                    {result && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Slots: {result.markSlots.join(", ")} + Attendance</span>
                                                <span>Per slot: {result.weightagePerSlot} marks</span>
                                            </div>
                                            <div className="space-y-2">
                                                {result.results.map((r: any) => (
                                                    <div key={r.studentId} className="flex items-center justify-between border rounded-lg px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-sm">{r.studentName}</p>
                                                            <div className="flex gap-3 mt-1 flex-wrap">
                                                                {r.breakdown.markTypes.map((m: any) => (
                                                                    <span key={m.type} className="text-xs text-muted-foreground">
                                    {m.type}: {m.score}
                                  </span>
                                                                ))}
                                                                <span className="text-xs text-muted-foreground">
                                  Att: {r.breakdown.attendance.score} ({r.breakdown.attendance.percentage}%)
                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                {r.internalObtained}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">/ {r.totalInternal}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}