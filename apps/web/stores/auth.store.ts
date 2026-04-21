import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "admin" | "teacher" | "student";

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthStore {
    token: string | null;
    user: User | null;
    role: Role | null;
    setAuth: (token: string, user: User, role: Role) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            role: null,
            setAuth: (token, user, role) => set({ token, user, role }),
            logout: () => {
                set({ token: null, user: null, role: null });
                window.location.href = "/login";
            },
            isAuthenticated: () => !!get().token,
        }),
        {
            name: "gradewise-auth", // ← must match what axios reads
        }
    )
);