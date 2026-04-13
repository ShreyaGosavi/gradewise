"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { adminLogin, teacherLogin, studentLogin } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";

type Role = "admin" | "teacher" | "student";

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [role, setRole] = useState<Role>("admin");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError("");

        try {
            let result;

            if (role === "admin") {
                result = await adminLogin(data.email, data.password);
                setAuth(result.token, result.admin, "admin");
                router.push("/admin/dashboard");
            } else if (role === "teacher") {
                result = await teacherLogin(data.email, data.password);
                setAuth(result.token, result.teacher, "teacher");
                router.push("/teacher/dashboard");
            } else {
                result = await studentLogin(data.email, data.password);
                setAuth(result.token, result.student, "student");
                router.push("/student/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const roles: { key: Role; label: string }[] = [
        { key: "admin", label: "Admin" },
        { key: "teacher", label: "Teacher" },
        { key: "student", label: "Student" },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-semibold">Gradewise</span>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Sign in</CardTitle>
                        <CardDescription>
                            Select your role and enter your credentials
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Role switcher */}
                        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
                            {roles.map((r) => (
                                <button
                                    key={r.key}
                                    onClick={() => { setRole(r.key); setError(""); }}
                                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
                                        role === r.key
                                            ? "bg-background shadow-sm font-medium text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@gradewise.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Sign in as {role}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Gradewise · Student Performance Monitoring
                </p>
            </div>
        </div>
    );
}