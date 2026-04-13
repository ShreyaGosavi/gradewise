"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getTeachers, createTeacher, deleteTeacher } from "@/lib/api/admin";
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
} from "lucide-react";

const departments = ["CSE", "IT", "ME", "CIVIL", "EXTC"];

const addTeacherSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
});

type AddTeacherForm = z.infer<typeof addTeacherSchema>;

interface Teacher {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    classTeacherOf: { year: string; department: string; division: string } | null;
    subjectAssignments: { id: number; subject: { name: string }; class: { year: string; department: string; division: string } }[];
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
    const [department, setDepartment] = useState("all");
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddTeacherForm>({
        resolver: zodResolver(addTeacherSchema),
    });

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await getTeachers({
                page,
                limit: 10,
                department: department === "all" ? undefined : department,
            });
            setTeachers(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [page, department]);

    const onSubmit = async (data: AddTeacherForm) => {
        setAdding(true);
        setError("");
        try {
            await createTeacher(data);
            setDialogOpen(false);
            reset();
            fetchTeachers();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add teacher");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this teacher?")) return;
        setDeleting(id);
        try {
            await deleteTeacher(id);
            fetchTeachers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = teachers.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthGuard allowedRole="admin">
            <Topbar title="Teachers" subtitle={`${meta.total} total`} />
            <div className="p-6 space-y-4">

                {/* Actions row */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search teachers..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

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

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Add teacher
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add new teacher</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                                <div className="space-y-1.5">
                                    <Label>Name</Label>
                                    <Input placeholder="Mr. Patil" {...register("name")} />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email</Label>
                                    <Input placeholder="patil@gradewise.com" {...register("email")} />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <p className="text-xs text-muted-foreground">
                                    A welcome email with login credentials will be sent automatically.
                                </p>
                                <Button type="submit" className="w-full" disabled={adding}>
                                    {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Add teacher
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
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Class teacher of</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subjects</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                                    No teachers found
                                </td>
                            </tr>
                        ) : (
                            filtered.map((teacher) => (
                                <tr key={teacher.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{teacher.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{teacher.email}</td>
                                    <td className="px-4 py-3">
                                        {teacher.classTeacherOf ? (
                                            <Badge variant="secondary">
                                                {teacher.classTeacherOf.year}-{teacher.classTeacherOf.department}-{teacher.classTeacherOf.division}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.subjectAssignments.length === 0 ? (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            ) : (
                                                teacher.subjectAssignments.slice(0, 2).map((sa) => (
                                                    <Badge key={sa.id} variant="outline" className="text-xs">
                                                        {sa.subject.name}
                                                    </Badge>
                                                ))
                                            )}
                                            {teacher.subjectAssignments.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{teacher.subjectAssignments.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(teacher.id)}
                                            disabled={deleting === teacher.id}
                                        >
                                            {deleting === teacher.id ? (
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
                <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">
            Showing {filtered.length} of {meta.total} teachers
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