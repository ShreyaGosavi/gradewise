"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getStudents, createStudent, deleteStudent } from "@/lib/api/admin";
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
    Search,
    Upload,
} from "lucide-react";

const departments = ["CSE", "IT", "ME", "CIVIL", "EXTC"];
const years = ["FE", "SE", "TE", "BE"];

const addStudentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    year: z.enum(["FE", "SE", "TE", "BE"] as const, {
        error: "Select a year",
    }),
    department: z.enum(["CSE", "IT", "ME", "CIVIL", "EXTC"] as const, {
        error: "Select a department",
    }),
});

type AddStudentForm = z.infer<typeof addStudentSchema>;

interface Student {
    id: number;
    name: string;
    email: string;
    year: string;
    department: string;
    createdAt: string;
    studentClass: { class: { year: string; department: string; division: string } } | null;
}

const yearColors: Record<string, string> = {
    FE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    SE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    BE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
    const [department, setDepartment] = useState("all");
    const [year, setYear] = useState("all");
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset, setValue, formState: { errors } } =
        useForm<AddStudentForm>({ resolver: zodResolver(addStudentSchema) });

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await getStudents({
                page,
                limit: 10,
                department: department === "all" ? undefined : department,
                year: year === "all" ? undefined : year,
            });
            setStudents(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page, department, year]);

    const onSubmit = async (data: AddStudentForm) => {
        setAdding(true);
        setError("");
        try {
            await createStudent(data);
            setDialogOpen(false);
            reset();
            fetchStudents();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add student");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this student?")) return;
        setDeleting(id);
        try {
            await deleteStudent(id);
            fetchStudents();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthGuard allowedRole="admin">
            <Topbar title="Students" subtitle={`${meta.total} total`} />
            <div className="p-6 space-y-4">

                {/* Actions row */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

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

                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload CSV
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Add student
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add new student</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                                <div className="space-y-1.5">
                                    <Label>Name</Label>
                                    <Input placeholder="Rahul Sharma" {...register("name")} />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email</Label>
                                    <Input placeholder="rahul@college.com" {...register("email")} />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>
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
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <p className="text-xs text-muted-foreground">
                                    A welcome email with login credentials will be sent automatically.
                                </p>
                                <Button type="submit" className="w-full" disabled={adding}>
                                    {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Add student
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Year</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Department</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Class</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    No students found
                                </td>
                            </tr>
                        ) : (
                            filtered.map((student) => (
                                <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{student.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{student.email}</td>
                                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${yearColors[student.year]}`}>
                        {student.year}
                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline">{student.department}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {student.studentClass ? (
                                            <Badge variant="secondary">
                                                {student.studentClass.class.year}-{student.studentClass.class.department}-{student.studentClass.class.division}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-amber-600 dark:text-amber-400">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(student.id)}
                                            disabled={deleting === student.id}
                                        >
                                            {deleting === student.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Showing {filtered.length} of {meta.total} students
          </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p - 1)}
                            disabled={!meta.hasPrev}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
              Page {page} of {meta.totalPages}
            </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!meta.hasNext}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

            </div>
        </AuthGuard>
    );
}
