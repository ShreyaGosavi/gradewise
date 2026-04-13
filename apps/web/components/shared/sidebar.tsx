"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    Bell,
    BarChart2,
    Calculator,
    School,
    LogOut,
    ChevronRight,
} from "lucide-react";

const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Classes", href: "/admin/classes", icon: School },
    { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
];

const teacherNav = [
    { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
    { label: "Marks", href: "/teacher/marks", icon: BarChart2 },
    { label: "Internal calc", href: "/teacher/internal", icon: Calculator },
    { label: "Notice board", href: "/teacher/notices", icon: Bell },
];

const studentNav = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Attendance", href: "/student/attendance", icon: ClipboardList },
    { label: "Marks", href: "/student/marks", icon: BarChart2 },
    { label: "Notice board", href: "/student/notices", icon: Bell },
];

export function Sidebar() {
    const { role, user, logout } = useAuthStore();
    const pathname = usePathname();

    const navItems =
        role === "admin"
            ? adminNav
            : role === "teacher"
                ? teacherNav
                : studentNav;

    const roleLabel =
        role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student";

    const roleColor =
        role === "admin"
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : role === "teacher"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    return (
        <div className="w-56 h-screen border-r bg-background flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="px-4 py-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-sm">Gradewise</span>
                </div>
            </div>

            {/* User info */}
            <div className="px-4 py-3 border-b">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleColor)}>
          {roleLabel}
        </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-2 py-3 border-t">
                <button
                    onClick={logout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    );
}