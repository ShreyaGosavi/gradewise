"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getSubjects, createSubject, deleteSubject } from "@/lib/api/admin";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus,
    Loader2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    BookOpen,
} from "lucide-react";

const addSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
});

type AddSubjectForm = z.infer<typeof addSubjectSchema>;

interface Subject {
    id: number;
    name: string;
    createdAt: string;
    subjectAssignments: {
        id: number;
        class: { year: string; department: string; division: string };
        teacher: { name: string };
    }[];
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset, formState: { errors } } =
        useForm<AddSubjectForm>({ resolver: zodResolver(addSubjectSchema) });

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await getSubjects({ page, limit: 12 });
            setSubjects(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [page]);

    const onSubmit = async (data: AddSubjectForm) => {
        setAdding(true);
        setError("");
        try {
            await createSubject(data);
            setDialogOpen(false);
            reset();
            fetchSubjects();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create subject");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this subject?")) return;
        setDeleting(id);
        try {
            await deleteSubject(id);
            fetchSubjects();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <AuthGuard allowedRole="admin">
            <Topbar title="Subjects" subtitle={`${meta.total} total`} />
            <div className="p-6 space-y-4">

                {/* Actions */}
                <div className="flex justify-end">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Add subject
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add new subject</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                                <div className="space-y-1.5">
                                    <Label>Subject name</Label>
                                    <Input placeholder="e.g. DBMS, CN, SE" {...register("name")} />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <Button type="submit" className="w-full" disabled={adding}>
                                    {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Add subject
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
                        No subjects found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/20 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{subject.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {subject.subjectAssignments.length} class{subject.subjectAssignments.length !== 1 ? "es" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(subject.id)}
                                        disabled={deleting === subject.id}
                                    >
                                        {deleting === subject.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </Button>
                                </div>

                                {subject.subjectAssignments.length > 0 && (
                                    <>
                                        <div className="border-t" />
                                        <div className="space-y-1.5">
                                            {subject.subjectAssignments.map((sa) => (
                                                <div key={sa.id} className="flex items-center justify-between">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {sa.class.year}-{sa.class.department}-{sa.class.division}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{sa.teacher.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Showing {subjects.length} of {meta.total} subjects
          </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
              Page {page} of {meta.totalPages}
            </span>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

            </div>
        </AuthGuard>
    );
}