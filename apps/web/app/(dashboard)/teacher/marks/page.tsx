"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getTeacherMe, getMarks, addMarks, calculateInternal } from "@/lib/api/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const markTypes = ["INSEM1", "INSEM2", "ENDSEM", "PRACTICAL", "ORAL"];

interface Assignment {
    id: number;
    subject: { id: number; name: string };
    class: { id: number; year: string; department: string; division: string };
}

export default function TeacherMarksPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selected, setSelected] = useState<Assignment | null>(null);
    const [marks, setMarks] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [marksLoading, setMarksLoading] = useState(false);

    // add marks dialog
    const [addDialog, setAddDialog] = useState(false);
    const [markType, setMarkType] = useState("");
    const [total, setTotal] = useState(30);
    const [studentMarks, setStudentMarks] = useState<{ studentId: number; name: string; obtained: number }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // internal dialog
    const [internalDialog, setInternalDialog] = useState(false);
    const [totalInternal, setTotalInternal] = useState(25);
    const [attendanceMarks, setAttendanceMarks] = useState(5);
    const [internalResult, setInternalResult] = useState<any>(null);
    const [calculating, setCalculating] = useState(false);

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
        setMarksLoading(true);
        getMarks(selected.class.id, selected.subject.id)
            .then(setMarks)
            .catch(console.error)
            .finally(() => setMarksLoading(false));
    }, [selected]);

    const handleAddMarks = async () => {
        if (!selected || !markType) return;
        setSubmitting(true);
        setError("");
        try {
            await addMarks({
                classId: selected.class.id,
                subjectId: selected.subject.id,
                type: markType,
                total,
                records: studentMarks.map((s) => ({ studentId: s.studentId, obtained: s.obtained })),
            });
            setAddDialog(false);
            const updated = await getMarks(selected.class.id, selected.subject.id);
            setMarks(updated);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add marks");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCalculateInternal = async () => {
        if (!selected) return;
        setCalculating(true);
        setError("");
        try {
            const result = await calculateInternal({
                classId: selected.class.id,
                subjectId: selected.subject.id,
                totalInternal,
                attendanceMarks,
            });
            setInternalResult(result);
            const updated = await getMarks(selected.class.id, selected.subject.id);
            setMarks(updated);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to calculate");
        } finally {
            setCalculating(false);
        }
    };

    // get students from marks for adding new marks
    const allStudents = Object.values(marks).flat().reduce((acc: any[], m: any) => {
        if (!acc.find((s) => s.studentId === m.student.id)) {
            acc.push({ studentId: m.student.id, name: m.student.name, obtained: 0 });
        }
        return acc;
    }, []);

    return (
        <AuthGuard allowedRole="teacher">
            <Topbar title="Marks" />
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center h-40 items-center">
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

                        {/* Marks */}
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
                                        <div className="flex gap-2">
                                            {/* Internal Calculator */}
                                            <Dialog open={internalDialog} onOpenChange={(o) => { setInternalDialog(o); setInternalResult(null); setError(""); }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Calculator className="w-4 h-4 mr-1" />
                                                        Internal
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Calculate internal marks</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-2">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <Label>Total internal marks</Label>
                                                                <Input type="number" value={totalInternal} onChange={(e) => setTotalInternal(Number(e.target.value))} />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label>Attendance marks</Label>
                                                                <Input type="number" value={attendanceMarks} onChange={(e) => setAttendanceMarks(Number(e.target.value))} />
                                                            </div>
                                                        </div>
                                                        {error && <p className="text-sm text-destructive">{error}</p>}
                                                        <Button className="w-full" onClick={handleCalculateInternal} disabled={calculating}>
                                                            {calculating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                            Calculate & save
                                                        </Button>
                                                        {internalResult && (
                                                            <div className="space-y-2 mt-2">
                                                                <p className="text-xs font-medium text-muted-foreground">Results</p>
                                                                {internalResult.results.map((r: any) => (
                                                                    <div key={r.studentId} className="flex justify-between text-sm border rounded-lg px-3 py-2">
                                                                        <span>{r.studentName}</span>
                                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                      {r.internalObtained} / {r.totalInternal}
                                    </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Add Marks */}
                                            <Dialog open={addDialog} onOpenChange={(o) => { setAddDialog(o); setError(""); }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add marks
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add marks</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-2">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <Label>Exam type</Label>
                                                                <Select onValueChange={setMarkType}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {markTypes.map((t) => (
                                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label>Total marks</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={total}
                                                                    onChange={(e) => setTotal(Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {allStudents.length === 0 ? (
                                                                <p className="text-xs text-muted-foreground">No students found. Add attendance first.</p>
                                                            ) : (
                                                                allStudents.map((s) => (
                                                                    <div key={s.studentId} className="flex items-center justify-between gap-3">
                                                                        <span className="text-sm flex-1">{s.name}</span>
                                                                        <Input
                                                                            type="number"
                                                                            className="w-20"
                                                                            min={0}
                                                                            max={total}
                                                                            defaultValue={0}
                                                                            onChange={(e) => {
                                                                                setStudentMarks((prev) => {
                                                                                    const existing = prev.find((x) => x.studentId === s.studentId);
                                                                                    if (existing) {
                                                                                        return prev.map((x) =>
                                                                                            x.studentId === s.studentId
                                                                                                ? { ...x, obtained: Number(e.target.value) }
                                                                                                : x
                                                                                        );
                                                                                    }
                                                                                    return [...prev, { ...s, obtained: Number(e.target.value) }];
                                                                                });
                                                                            }}
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">/ {total}</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                        {error && <p className="text-sm text-destructive">{error}</p>}
                                                        <Button className="w-full" onClick={handleAddMarks} disabled={submitting || !markType}>
                                                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                            Save marks
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>

                                    {marksLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : Object.keys(marks).length === 0 ? (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground">No marks added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(marks).map(([type, entries]) => (
                                                <div key={type}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">{type}</Badge>
                                                        <span className="text-xs text-muted-foreground">/ {entries[0]?.total}</span>
                                                    </div>
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <tbody>
                                                            {entries.map((entry: any) => (
                                                                <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                                                                    <td className="px-3 py-2 font-medium">{entry.student.name}</td>
                                                                    <td className="px-3 py-2 text-right">
                                      <span className={cn(
                                          "font-medium",
                                          entry.obtained / entry.total >= 0.6
                                              ? "text-green-600 dark:text-green-400"
                                              : "text-red-600 dark:text-red-400"
                                      )}>
                                        {entry.obtained}
                                      </span>
                                                                        <span className="text-muted-foreground"> / {entry.total}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
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