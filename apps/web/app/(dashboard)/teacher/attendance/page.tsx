"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getTeacherMe, getAttendanceSummary, markAttendance } from "@/lib/api/teacher";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assignment {
    id: number;
    subject: { id: number; name: string };
    class: { id: number; year: string; department: string; division: string };
}

interface StudentSummary {
    student: { id: number; name: string; email: string };
    totalLectures: number;
    attended: number;
    percentage: number;
}

export default function TeacherAttendancePage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selected, setSelected] = useState<Assignment | null>(null);
    const [summary, setSummary] = useState<StudentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // mark attendance form
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [lectureNo, setLectureNo] = useState(1);
    const [records, setRecords] = useState<{ studentId: number; name: string; isPresent: boolean }[]>([]);

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

    useEffect(() => {
        if (!selected) return;
        setSummaryLoading(true);
        getAttendanceSummary(selected.class.id, selected.subject.id)
            .then((data) => {
                setSummary(data);
                setRecords(data.map((s: StudentSummary) => ({
                    studentId: s.student.id,
                    name: s.student.name,
                    isPresent: true,
                })));
            })
            .catch(console.error)
            .finally(() => setSummaryLoading(false));
    }, [selected]);

    const togglePresent = (studentId: number) => {
        setRecords((prev) =>
            prev.map((r) =>
                r.studentId === studentId ? { ...r, isPresent: !r.isPresent } : r
            )
        );
    };

    const handleMarkAttendance = async () => {
        if (!selected) return;
        setSubmitting(true);
        setError("");
        try {
            await markAttendance({
                classId: selected.class.id,
                subjectId: selected.subject.id,
                date,
                lectureNo,
                records: records.map((r) => ({ studentId: r.studentId, isPresent: r.isPresent })),
            });
            setDialogOpen(false);
            // refresh summary
            const data = await getAttendanceSummary(selected.class.id, selected.subject.id);
            setSummary(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to mark attendance");
        } finally {
            setSubmitting(false);
        }
    };

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

    return (
        <AuthGuard allowedRole="teacher">
            <Topbar title="Attendance" />
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Assignment selector */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-muted/50 border-b">
                                <p className="text-xs font-medium text-muted-foreground">My subjects</p>
                            </div>
                            <div className="divide-y">
                                {assignments.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelected(a)}
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

                        {/* Summary */}
                        <div className="md:col-span-2 border rounded-lg p-5 space-y-4">
                            {selected && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{selected.subject.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {selected.class.year}-{selected.class.department}-{selected.class.division}
                                            </p>
                                        </div>
                                        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); setError(""); }}>
                                            <DialogTrigger asChild>
                                                <Button size="sm">
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Mark lecture
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Mark attendance</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 mt-2">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label>Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={date}
                                                                onChange={(e) => setDate(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>Lecture no.</Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={lectureNo}
                                                                onChange={(e) => setLectureNo(Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Label>Students</Label>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="text-xs text-green-600 hover:underline"
                                                                    onClick={() => setRecords((r) => r.map((s) => ({ ...s, isPresent: true })))}
                                                                >
                                                                    All present
                                                                </button>
                                                                <button
                                                                    className="text-xs text-red-600 hover:underline"
                                                                    onClick={() => setRecords((r) => r.map((s) => ({ ...s, isPresent: false })))}
                                                                >
                                                                    All absent
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto space-y-1.5">
                                                            {records.map((r) => (
                                                                <div
                                                                    key={r.studentId}
                                                                    onClick={() => togglePresent(r.studentId)}
                                                                    className={cn(
                                                                        "flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                                                                        r.isPresent
                                                                            ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                                                                            : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
                                                                    )}
                                                                >
                                                                    <span className="text-sm">{r.name}</span>
                                                                    {r.isPresent ? (
                                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {error && <p className="text-sm text-destructive">{error}</p>}

                                                    <Button className="w-full" onClick={handleMarkAttendance} disabled={submitting}>
                                                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                        Save attendance
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {summaryLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : summary.length === 0 ? (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground">No attendance records yet. Mark the first lecture!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                <span>Student</span>
                                                <span>{summary[0]?.totalLectures ?? 0} total lectures</span>
                                            </div>
                                            {summary.map((s) => (
                                                <div key={s.student.id} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">{s.student.name}</span>
                                                        <span className={cn("text-xs font-medium", getTextColor(s.percentage))}>
                              {s.attended}/{s.totalLectures} ({s.percentage}%)
                            </span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all", getColor(s.percentage))}
                                                            style={{ width: `${s.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
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