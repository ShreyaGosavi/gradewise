"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { StatCard } from "@/components/shared/stat-card";
import { getTeachers, getStudents, getClasses, getSubjects } from "@/lib/api/admin";
import { Users, GraduationCap, School, BookOpen, Loader2, AlertCircle } from "lucide-react";

interface DashboardStats {
    teachers: number;
    students: number;
    classes: number;
    subjects: number;
    unassignedStudents: number;
    classesWithoutTeacher: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [teachersRes, studentsRes, classesRes, subjectsRes] = await Promise.all([
                    getTeachers({ limit: 1 }),
                    getStudents({ limit: 1 }),
                    getClasses({ limit: 100 }),
                    getSubjects({ limit: 1 }),
                ]);

                const allStudents = await getStudents({ limit: 500 });
                const unassigned = allStudents.data.filter((s: any) => !s.studentClass).length;
                const noTeacher = classesRes.data.filter((c: any) => !c.classTeacher).length;

                setStats({
                    teachers: teachersRes.meta.total,
                    students: studentsRes.meta.total,
                    classes: classesRes.meta.total,
                    subjects: subjectsRes.meta.total,
                    unassignedStudents: unassigned,
                    classesWithoutTeacher: noTeacher,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const hasAlerts =
        (stats?.unassignedStudents ?? 0) > 0 ||
        (stats?.classesWithoutTeacher ?? 0) > 0;

    return (
        <AuthGuard allowedRole="admin">
            <Topbar title="Dashboard" subtitle="Gradewise college system" />
            <div className="p-6 space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Teachers" value={stats?.teachers ?? 0} icon={Users} color="blue" />
                            <StatCard label="Students" value={stats?.students ?? 0} icon={GraduationCap} color="green" />
                            <StatCard label="Classes" value={stats?.classes ?? 0} icon={School} color="amber" />
                            <StatCard label="Subjects" value={stats?.subjects ?? 0} icon={BookOpen} color="red" />
                        </div>

                        {hasAlerts ? (
                            <div className="border rounded-lg p-4 space-y-3">
                                <h2 className="text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    Action needed
                                </h2>
                                {(stats?.unassignedStudents ?? 0) > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Students without a class</span>
                                        <span className="font-medium text-amber-600 dark:text-amber-400">
                      {stats?.unassignedStudents}
                    </span>
                                    </div>
                                )}
                                {(stats?.classesWithoutTeacher ?? 0) > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Classes without a class teacher</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">
                      {stats?.classesWithoutTeacher}
                    </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4">
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    ✓ Everything is assigned correctly
                                </p>
                            </div>
                        )}

                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm font-medium mb-3">Quick actions</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <a href="/admin/teachers" className="text-xs text-center py-2 px-3 border rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                    Add teacher
                                </a>
                                <a href="/admin/students" className="text-xs text-center py-2 px-3 border rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                    Add student
                                </a>
                                <a href="/admin/classes" className="text-xs text-center py-2 px-3 border rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                    Create class
                                </a>
                                <a href="/admin/assignments" className="text-xs text-center py-2 px-3 border rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                    Assignments
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
