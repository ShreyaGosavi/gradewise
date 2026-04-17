"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getClasses, createClass, deleteClass } from "@/lib/api/admin";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus,
    Loader2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    BookOpen,
} from "lucide-react";

const departments = ["CSE", "IT", "ME", "CIVIL", "EXTC"];
const years = ["FE", "SE", "TE", "BE"];

const addClassSchema = z.object({
    year: z.enum(["FE", "SE", "TE", "BE"] as const, { error: "Select a year" }),
    department: z.enum(["CSE", "IT", "ME", "CIVIL", "EXTC"] as const, { error: "Select a department" }),
    division: z.string().min(1, "Division is required"),
});

type AddClassForm = z.infer<typeof addClassSchema>;

interface Class {
    id: number;
    year: string;
    department: string;
    division: string;
    createdAt: string;
    classTeacher: { id: number; name: string } | null;
    subjectAssignments: { id: number; subject: { name: string }; teacher: { name: string } }[];
    students: { student: { id: number } }[];
}

const yearColors: Record<string, string> = {
    FE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    SE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    BE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
    const [department, setDepartment] = useState("all");
    const [year, setYear] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset, setValue, formState: { errors } } =
        useForm<AddClassForm>({ resolver: zodResolver(addClassSchema) });

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await getClasses({
                page,
                limit: 10,
                department: department === "all" ? undefined : department,
                year: year === "all" ? undefined : year,
            });
            setClasses(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [page, department, year]);

    const onSubmit = async (data: AddClassForm) => {
        setAdding(true);
        setError("");
        try {
            await createClass(data);
            setDialogOpen(false);
            reset();
            fetchClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create class");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this class?")) return;
        setDeleting(id);
        try {
            await deleteClass(id);
            fetchClasses();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <AuthGuard allowedRole="admin">
            <Topbar title="Classes" subtitle={`${meta.total} total`} />
            <div className="p-6 space-y-4">

                {/* Actions row */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Select value={year} onValueChange={(v) => { setYear(v); setPage(1); }}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All years</SelectItem>
                            {years.map((y) => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={department} onValueChange={(v) => { setDepartment(v); setPage(1); }}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All departments</SelectItem>
                            {departments.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="ml-auto">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Create class
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create new class</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>Year</Label>
                                            <Select onValueChange={(v) => setValue("year", v as any)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((y) => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Department</Label>
                                            <Select onValueChange={(v) => setValue("department", v as any)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select dept" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((d) => (
                                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Division</Label>
                                        <Input placeholder="A" {...register("division")} />
                                        {errors.division && <p className="text-xs text-destructive">{errors.division.message}</p>}
                                    </div>
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                    <Button type="submit" className="w-full" disabled={adding}>
                                        {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Create class
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Grid of class cards */}
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
                        No classes found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls) => (
                            <div key={cls.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/20 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${yearColors[cls.year]}`}>
                        {cls.year}
                      </span>
                                            <Badge variant="outline">{cls.department}</Badge>
                                            <span className="font-semibold">Division {cls.division}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {cls.year}-{cls.department}-{cls.division}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(cls.id)}
                                        disabled={deleting === cls.id}
                                    >
                                        {deleting === cls.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </Button>
                                </div>

                                <div className="divider border-t" />

                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="w-3.5 h-3.5" />
                                        <span className="text-xs">Class teacher:</span>
                                        <span className="text-xs font-medium text-foreground">
                      {cls.classTeacher?.name ?? (
                          <span className="text-amber-600 dark:text-amber-400">Not assigned</span>
                      )}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span className="text-xs">Subjects:</span>
                                        <span className="text-xs font-medium text-foreground">
                      {cls.subjectAssignments.length}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="w-3.5 h-3.5" />
                                        <span className="text-xs">Students:</span>
                                        <span className="text-xs font-medium text-foreground">
                      {cls.students.length}
                    </span>
                                    </div>
                                </div>

                                {cls.subjectAssignments.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {cls.subjectAssignments.map((sa) => (
                                            <Badge key={sa.id} variant="secondary" className="text-xs">
                                                {sa.subject.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Showing {classes.length} of {meta.total} classes
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