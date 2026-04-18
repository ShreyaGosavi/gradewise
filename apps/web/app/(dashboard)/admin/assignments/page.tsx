"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import {
    getClasses,
    getTeachers,
    getSubjects,
    assignClassTeacher,
    removeClassTeacher,
    assignSubjectTeacher,
    removeSubjectTeacher,
    assignStudentClass,
    removeStudentClass,
    getStudents,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, UserCheck, BookOpen, GraduationCap } from "lucide-react";

interface Class {
    id: number;
    year: string;
    department: string;
    division: string;
    classTeacher: { id: number; name: string } | null;
    subjectAssignments: {
        id: number;
        subject: { id: number; name: string };
        teacher: { id: number; name: string };
    }[];
    students: { student: { id: number; name: string; email: string } }[];
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    year: string;
    department: string;
    studentClass: any;
}

export default function AssignmentsPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    // dialog states
    const [ctDialog, setCtDialog] = useState(false);
    const [stDialog, setStDialog] = useState(false);
    const [scDialog, setScDialog] = useState(false);

    // form states
    const [ctTeacherId, setCtTeacherId] = useState("");
    const [stTeacherId, setStTeacherId] = useState("");
    const [stSubjectId, setStSubjectId] = useState("");
    const [scStudentId, setScStudentId] = useState("");
    const [scClassId, setScClassId] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [classRes, teacherRes, subjectRes, studentRes] = await Promise.all([
                getClasses({ limit: 100 }),
                getTeachers({ limit: 100 }),
                getSubjects({ limit: 100 }),
                getStudents({ limit: 500 }),
            ]);
            setClasses(classRes.data);
            setTeachers(teacherRes.data);
            setSubjects(subjectRes.data);
            setStudents(studentRes.data);
            if (classRes.data.length > 0 && !selectedClass) {
                setSelectedClass(classRes.data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const refreshSelectedClass = async () => {
        const res = await getClasses({ limit: 100 });
        setClasses(res.data);
        const updated = res.data.find((c: Class) => c.id === selectedClass?.id);
        if (updated) setSelectedClass(updated);
    };

    // ─── Class Teacher ───────────────────────────────
    const handleAssignClassTeacher = async () => {
        if (!selectedClass || !ctTeacherId) return;
        setSubmitting(true);
        setError("");
        try {
            await assignClassTeacher({
                classId: selectedClass.id,
                teacherId: Number(ctTeacherId),
            });
            setCtDialog(false);
            setCtTeacherId("");
            await refreshSelectedClass();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveClassTeacher = async () => {
        if (!selectedClass) return;
        if (!confirm("Remove class teacher?")) return;
        try {
            await removeClassTeacher(selectedClass.id);
            await refreshSelectedClass();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    // ─── Subject Teacher ─────────────────────────────
    const handleAssignSubjectTeacher = async () => {
        if (!selectedClass || !stTeacherId || !stSubjectId) return;
        setSubmitting(true);
        setError("");
        try {
            await assignSubjectTeacher({
                classId: selectedClass.id,
                subjectId: Number(stSubjectId),
                teacherId: Number(stTeacherId),
            });
            setStDialog(false);
            setStTeacherId("");
            setStSubjectId("");
            await refreshSelectedClass();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveSubjectTeacher = async (assignmentId: number) => {
        if (!confirm("Remove this subject teacher?")) return;
        try {
            await removeSubjectTeacher(assignmentId);
            await refreshSelectedClass();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    // ─── Student Class ────────────────────────────────
    const handleAssignStudentClass = async () => {
        if (!scStudentId || !scClassId) return;
        setSubmitting(true);
        setError("");
        try {
            await assignStudentClass({
                studentId: Number(scStudentId),
                classId: Number(scClassId),
            });
            setScDialog(false);
            setScStudentId("");
            setScClassId("");
            await fetchAll();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveStudentClass = async (studentId: number) => {
        if (!confirm("Remove student from class?")) return;
        try {
            await removeStudentClass(studentId);
            await refreshSelectedClass();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const unassignedStudents = students.filter((s) => !s.studentClass);

    if (loading) {
        return (
            <AuthGuard allowedRole="admin">
                <Topbar title="Assignments" />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard allowedRole="admin">
            <Topbar title="Assignments" subtitle="Manage teacher and student assignments" />
            <div className="p-6">
                <Tabs defaultValue="class-teacher">
                    <TabsList className="mb-6">
                        <TabsTrigger value="class-teacher">
                            <UserCheck className="w-4 h-4 mr-1.5" />
                            Class teachers
                        </TabsTrigger>
                        <TabsTrigger value="subject-teacher">
                            <BookOpen className="w-4 h-4 mr-1.5" />
                            Subject teachers
                        </TabsTrigger>
                        <TabsTrigger value="student-class">
                            <GraduationCap className="w-4 h-4 mr-1.5" />
                            Student–class
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── CLASS TEACHER TAB ─── */}
                    <TabsContent value="class-teacher">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Class selector */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="px-4 py-3 bg-muted/50 border-b">
                                    <p className="text-xs font-medium text-muted-foreground">Select class</p>
                                </div>
                                <div className="divide-y max-h-96 overflow-y-auto">
                                    {classes.map((cls) => (
                                        <button
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls)}
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${
                                                selectedClass?.id === cls.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                                            }`}
                                        >
                                            <p className="font-medium">{cls.year}-{cls.department}-{cls.division}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {cls.classTeacher ? cls.classTeacher.name : (
                                                    <span className="text-amber-600 dark:text-amber-400">No class teacher</span>
                                                )}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Class teacher detail */}
                            <div className="md:col-span-2 border rounded-lg p-5 space-y-4">
                                {selectedClass ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {selectedClass.year}-{selectedClass.department}-{selectedClass.division}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">Class teacher assignment</p>
                                            </div>
                                            {selectedClass.classTeacher ? (
                                                <Button variant="destructive" size="sm" onClick={handleRemoveClassTeacher}>
                                                    Remove
                                                </Button>
                                            ) : (
                                                <Dialog open={ctDialog} onOpenChange={(o) => { setCtDialog(o); setError(""); }}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm">
                                                            <Plus className="w-4 h-4 mr-1" />
                                                            Assign
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Assign class teacher</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 mt-2">
                                                            <div className="space-y-1.5">
                                                                <Label>Select teacher</Label>
                                                                <Select onValueChange={setCtTeacherId}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Choose a teacher" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {teachers.map((t) => (
                                                                            <SelectItem key={t.id} value={String(t.id)}>
                                                                                {t.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            {error && <p className="text-sm text-destructive">{error}</p>}
                                                            <Button className="w-full" onClick={handleAssignClassTeacher} disabled={submitting || !ctTeacherId}>
                                                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                                Assign class teacher
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>

                                        {selectedClass.classTeacher ? (
                                            <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                    {selectedClass.classTeacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{selectedClass.classTeacher.name}</p>
                                                    <p className="text-xs text-muted-foreground">Class teacher</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                                    No class teacher assigned to this class yet.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Select a class to manage</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── SUBJECT TEACHER TAB ─── */}
                    <TabsContent value="subject-teacher">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Class selector */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="px-4 py-3 bg-muted/50 border-b">
                                    <p className="text-xs font-medium text-muted-foreground">Select class</p>
                                </div>
                                <div className="divide-y max-h-96 overflow-y-auto">
                                    {classes.map((cls) => (
                                        <button
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls)}
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${
                                                selectedClass?.id === cls.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                                            }`}
                                        >
                                            <p className="font-medium">{cls.year}-{cls.department}-{cls.division}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {cls.subjectAssignments.length} subject{cls.subjectAssignments.length !== 1 ? "s" : ""}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject assignments */}
                            <div className="md:col-span-2 border rounded-lg p-5 space-y-4">
                                {selectedClass && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {selectedClass.year}-{selectedClass.department}-{selectedClass.division}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">Subject teacher assignments</p>
                                            </div>
                                            <Dialog open={stDialog} onOpenChange={(o) => { setStDialog(o); setError(""); }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Assign subject
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Assign subject teacher</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-2">
                                                        <div className="space-y-1.5">
                                                            <Label>Subject</Label>
                                                            <Select onValueChange={setStSubjectId}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Choose subject" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {subjects.map((s) => (
                                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                                            {s.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>Teacher</Label>
                                                            <Select onValueChange={setStTeacherId}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Choose teacher" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {teachers.map((t) => (
                                                                        <SelectItem key={t.id} value={String(t.id)}>
                                                                            {t.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {error && <p className="text-sm text-destructive">{error}</p>}
                                                        <Button
                                                            className="w-full"
                                                            onClick={handleAssignSubjectTeacher}
                                                            disabled={submitting || !stSubjectId || !stTeacherId}
                                                        >
                                                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                            Assign
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {selectedClass.subjectAssignments.length === 0 ? (
                                            <div className="bg-muted/50 rounded-lg p-4">
                                                <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedClass.subjectAssignments.map((sa) => (
                                                    <div key={sa.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="secondary">{sa.subject.name}</Badge>
                                                            <span className="text-sm text-muted-foreground">→</span>
                                                            <span className="text-sm font-medium">{sa.teacher.name}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleRemoveSubjectTeacher(sa.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── STUDENT CLASS TAB ─── */}
                    <TabsContent value="student-class">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Class selector */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="px-4 py-3 bg-muted/50 border-b">
                                    <p className="text-xs font-medium text-muted-foreground">Select class</p>
                                </div>
                                <div className="divide-y max-h-96 overflow-y-auto">
                                    {classes.map((cls) => (
                                        <button
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls)}
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${
                                                selectedClass?.id === cls.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                                            }`}
                                        >
                                            <p className="font-medium">{cls.year}-{cls.department}-{cls.division}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {cls.students.length} student{cls.students.length !== 1 ? "s" : ""}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Students in class */}
                            <div className="md:col-span-2 border rounded-lg p-5 space-y-4">
                                {selectedClass && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {selectedClass.year}-{selectedClass.department}-{selectedClass.division}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {selectedClass.students.length} students enrolled
                                                </p>
                                            </div>
                                            <Dialog open={scDialog} onOpenChange={(o) => { setScDialog(o); setError(""); }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add student
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Assign student to class</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-2">
                                                        <div className="space-y-1.5">
                                                            <Label>Student</Label>
                                                            <Select onValueChange={setScStudentId}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Choose student" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {unassignedStudents.map((s) => (
                                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                                            {s.name} ({s.year}-{s.department})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {unassignedStudents.length === 0 && (
                                                                <p className="text-xs text-muted-foreground">No unassigned students</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>Class</Label>
                                                            <Select
                                                                defaultValue={String(selectedClass.id)}
                                                                onValueChange={setScClassId}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {classes.map((c) => (
                                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                                            {c.year}-{c.department}-{c.division}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {error && <p className="text-sm text-destructive">{error}</p>}
                                                        <Button
                                                            className="w-full"
                                                            onClick={handleAssignStudentClass}
                                                            disabled={submitting || !scStudentId}
                                                        >
                                                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                            Assign to class
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {selectedClass.students.length === 0 ? (
                                            <div className="bg-muted/50 rounded-lg p-4">
                                                <p className="text-sm text-muted-foreground">No students in this class yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                                {selectedClass.students.map(({ student }) => (
                                                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium">{student.name}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleRemoveStudentClass(student.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthGuard>
    );
}