"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRole: "admin" | "teacher" | "student";
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
    const { token, role } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        if (role !== allowedRole) {
            router.push("/login");
        }
    }, [token, role, allowedRole, router]);

    if (!token || role !== allowedRole) return null;

    return <>{children}</>;
}