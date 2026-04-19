"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getTeacherMe, getNotices, postNotice, deleteNotice } from "@/lib/api/teacher";
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
import { Loader2, Plus, Trash2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const noticeTypes = ["ASSIGNMENT", "TEST", "NOTICE", "EVENT"];

const typeColors: Record<string, string> = {
    ASSIGNMENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TEST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    NOTICE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    EVENT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface ClassAssignment {
    id: number;
    class: { id: number; year: string; department: string; division: string };
}

interface Notice {
    id: number;
    title: string;
    content: string;
    type: string;
    dueDate: string | null;
    createdAt: string;
    teacher: { id: number; name: string };
}

export default function TeacherNoticesPage() {
    const [classes, setClasses] = useState<ClassAssignment[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [noticesLoading, setNoticesLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        getTeacherMe()
            .then((profile) => {
                // get unique classes from subject assignments + class teacher
                const uniqueClasses: ClassAssignment[] = [];
                const seen = new Set<number>();

                profile.subjectAssignments.forEach((sa: any) => {
                    if (!seen.has(sa.class.id)) {
                        seen.add(sa.class.id);
                        uniqueClasses.push({ id: sa.id, class: sa.class });
                    }
                });

                if (profile.classTeacherOf && !seen.has(profile.classTeacherOf.id)) {
                    uniqueClasses.unshift({ id: 0, class: profile.classTeacherOf });
                }

                setClasses(uniqueClasses);
                if (uniqueClasses.length > 0) {
                    setSelectedClassId(uniqueClasses[0].class.id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedClassId) return;
        setNoticesLoading(true);
        getNotices(selectedClassId)
            .then(setNotices)
            .catch(console.error)
            .finally(() => setNoticesLoading(false));
    }, [selectedClassId]);

    const handlePostNotice = async () => {
        if (!selectedClassId || !title || !content || !type) return;
        setSubmitting(true);
        setError("");
        try {
            await postNotice({
                classId: selectedClassId,
                title,
                content,
                type,
                dueDate: dueDate || undefined,
            });
            setDialogOpen(false);
            setTitle(""); setContent(""); setType(""); setDueDate("");
            const updated = await getNotices(selectedClassId);
            setNotices(updated);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to post notice");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this notice?")) return;
        setDeleting(id);
        try {
            await deleteNotice(id);
            setNotices((prev) => prev.filter((n) => n.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    const selectedClass = classes.find((c) => c.class.id === selectedClassId);

    return (
        <AuthGuard allowedRole="teacher">
            <Topbar title="Notice board" />
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center h-40 items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Class selector */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-muted/50 border-b">
                                <p className="text-xs font-medium text-muted-foreground">My classes</p>
                            </div>
                            <div className="divide-y">
                                {classes.map((c) => (
                                    <button
                                        key={c.class.id}
                                        onClick={() => setSelectedClassId(c.class.id)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                                            selectedClassId === c.class.id && "bg-primary/5 border-l-2 border-l-primary"
                                        )}
                                    >
                                        <p className="font-medium">
                                            {c.class.year}-{c.class.department}-{c.class.division}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notices */}
                        <div className="md:col-span-2 border rounded-lg p-5 space-y-4">
                            {selectedClass && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                {selectedClass.class.year}-{selectedClass.class.department}-{selectedClass.class.division}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">{notices.length} notices</p>
                                        </div>
                                        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); setError(""); }}>
                                            <DialogTrigger asChild>
                                                <Button size="sm">
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Post notice
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Post notice</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 mt-2">
                                                    <div className="space-y-1.5">
                                                        <Label>Title</Label>
                                                        <Input placeholder="DBMS Assignment 1" value={title} onChange={(e) => setTitle(e.target.value)} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label>Content</Label>
                                                        <textarea
                                                            className="w-full border rounded-md p-2 text-sm bg-background min-h-20 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                                            placeholder="Details about the assignment..."
                                                            value={content}
                                                            onChange={(e) => setContent(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label>Type</Label>
                                                            <Select onValueChange={setType}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {noticeTypes.map((t) => (
                                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>Due date (optional)</Label>
                                                            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                                    <Button className="w-full" onClick={handlePostNotice} disabled={submitting || !title || !content || !type}>
                                                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                        Post notice
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {noticesLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : notices.length === 0 ? (
                                        <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                                            <Bell className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">No notices posted yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {notices.map((notice) => (
                                                <div key={notice.id} className="border rounded-lg p-4 space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeColors[notice.type])}>
                                {notice.type}
                              </span>
                                                            <span className="font-medium text-sm">{notice.title}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleDelete(notice.id)}
                                                            disabled={deleting === notice.id}
                                                        >
                                                            {deleting === notice.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{notice.content}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        {notice.dueDate && (
                                                            <span>Due: {new Date(notice.dueDate).toLocaleDateString()}</span>
                                                        )}
                                                        <span>Posted: {new Date(notice.createdAt).toLocaleDateString()}</span>
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