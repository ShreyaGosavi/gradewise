"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Topbar } from "@/components/shared/topbar";
import { getTeacherMe } from "@/lib/api/teacher";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    BookOpen,
    School,
    ClipboardList,
    Loader2,
} from "lucide-react";

interface TeacherProfile {
    id: number;
    name: string;
    email: string;
    classTeacherOf: { id: number; year: string; department: string; division: string } | null;
    subjectAssignments: {
        id: number;
        subject: { id: number; name: string };
        class: { id: number; year: string; department: string; division: string };
    }[];
    stats: {
        isClassTeacher: boolean;
        totalSubjectsTeaching: number;
        totalClassesTeaching: number;
        totalStudents: number;
        totalLecturesTaken: number;
    };
}

export default function TeacherDashboard() {
    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTeacherMe()
            .then(setProfile)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthGuard allowedRole="teacher">
            <Topbar
                title={profile ? `Welcome, ${profile.name.split(" ")[0]}` : "Dashboard"}
                subtitle={profile?.email}
            />
            <div className="p-6 space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : profile ? (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Subjects teaching" value={profile.stats.totalSubjectsTeaching} icon={BookOpen} color="blue" />
                            <StatCard label="Classes" value={profile.stats.totalClassesTeaching} icon={School} color="green" />
                            <StatCard label="Students" value={profile.stats.totalStudents} icon={Users} color="amber" />
                            <StatCard label="Lectures taken" value={profile.stats.totalLecturesTaken} icon={ClipboardList} color="red" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Class teacher */}
                            <div className="border rounded-lg p-4 space-y-3">
                                <h2 className="text-sm font-medium">Class teacher of</h2>
                                {profile.classTeacherOf ? (
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                            <School className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {profile.classTeacherOf.year}-{profile.classTeacherOf.department}-{profile.classTeacherOf.division}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Class teacher</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Not a class teacher</p>
                                )}
                            </div>

                            {/* Subject assignments */}
                            <div className="border rounded-lg p-4 space-y-3">
                                <h2 className="text-sm font-medium">Subject assignments</h2>
                                {profile.subjectAssignments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No subject assignments</p>
                                ) : (
                                    <div className="space-y-2">
                                        {profile.subjectAssignments.map((sa) => (
                                            <div key={sa.id} className="flex items-center justify-between p-2.5 border rounded-lg">
                                                <Badge variant="secondary">{sa.subject.name}</Badge>
                                                <span className="text-xs text-muted-foreground">
                          {sa.class.year}-{sa.class.department}-{sa.class.division}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </AuthGuard>
    );
}