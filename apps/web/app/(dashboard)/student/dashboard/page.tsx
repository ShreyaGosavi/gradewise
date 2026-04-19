"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getStudentMe, getMyAttendance, getMyNotices } from "@/lib/api/student";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, BookOpen, School } from "lucide-react";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
    ASSIGNMENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TEST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    NOTICE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    EVENT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function StudentDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [attendance, setAttendance] = useState<any>({});
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getStudentMe(), getMyAttendance(), getMyNotices()])
            .then(([p, a, n]) => {
                setProfile(p);
                setAttendance(a);
                setNotices(n.slice(0, 4));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const attendanceSubjects = Object.values(attendance) as any[];
    const avgAttendance = attendanceSubjects.length
        ? Math.round(
            attendanceSubjects.reduce((sum: number, s: any) => sum + s.percentage, 0) /
            attendanceSubjects.length
        )
        : 0;

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
        <AuthGuard allowedRole="student">
            <Topbar
                title={profile ? `Hi, ${profile.name.split(" ")[0]}` : "Dashboard"}
                subtitle={profile?.studentClass?.class
                    ? `${profile.studentClass.class.year}-${profile.studentClass.class.department}-${profile.studentClass.class.division}`
                    : "Not assigned to a class yet"}
            />
            <div className="p-6 space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Info cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border rounded-lg p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Class</p>
                                    <p className="font-semibold text-sm">
                                        {profile?.studentClass?.class
                                            ? `${profile.studentClass.class.year}-${profile.studentClass.class.department}-${profile.studentClass.class.division}`
                                            : "Not assigned"}
                                    </p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Subjects</p>
                                    <p className="font-semibold text-sm">{attendanceSubjects.length}</p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    avgAttendance >= 75
                                        ? "bg-green-50 dark:bg-green-900/20"
                                        : "bg-red-50 dark:bg-red-900/20"
                                )}>
                  <span className={cn(
                      "text-sm font-bold",
                      avgAttendance >= 75
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                  )}>
                    {avgAttendance}%
                  </span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Avg attendance</p>
                                    <p className="font-semibold text-sm">
                                        {avgAttendance >= 75 ? "Good standing" : "Low — needs attention"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Attendance */}
                            <div className="border rounded-lg p-4 space-y-3">
                                <h2 className="text-sm font-medium">Attendance overview</h2>
                                {attendanceSubjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No attendance records yet.</p>
                                ) : (
                                    attendanceSubjects.map((s: any) => (
                                        <div key={s.subjectId} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{s.subjectName}</span>
                                                <span className={cn("text-xs font-medium", getTextColor(s.percentage))}>
                          {s.attended}/{s.totalLectures} ({s.percentage}%)
                        </span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", getColor(s.percentage))}
                                                    style={{ width: `${s.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Recent notices */}
                            <div className="border rounded-lg p-4 space-y-3">
                                <h2 className="text-sm font-medium flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Recent notices
                                </h2>
                                {notices.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No notices yet.</p>
                                ) : (
                                    notices.map((notice: any) => (
                                        <div key={notice.id} className="border-l-2 border-primary/30 pl-3 space-y-0.5">
                                            <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", typeColors[notice.type])}>
                          {notice.type}
                        </span>
                                                <span className="text-sm font-medium">{notice.title}</span>
                                            </div>
                                            {notice.dueDate && (
                                                <p className="text-xs text-muted-foreground">
                                                    Due: {new Date(notice.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthGuard>
    );
}