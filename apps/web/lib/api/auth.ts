import api from "@/lib/axios";

export const adminLogin = async (email: string, password: string) => {
    const res = await api.post("/admin/auth/login", { email, password });
    return res.data.data;
};

export const teacherLogin = async (email: string, password: string) => {
    const res = await api.post("/teacher/auth/login", { email, password });
    return res.data.data;
};

export const studentLogin = async (email: string, password: string) => {
    const res = await api.post("/student/auth/login", { email, password });
    return res.data.data;
};