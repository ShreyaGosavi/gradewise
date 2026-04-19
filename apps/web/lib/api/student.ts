import api from "@/lib/axios";

export const getStudentMe = async () => {
    const res = await api.get("/student/auth/me");
    return res.data.data;
};

export const getMyAttendance = async () => {
    const res = await api.get("/student/attendance");
    return res.data.data;
};

export const getMyMarks = async () => {
    const res = await api.get("/student/marks");
    return res.data.data;
};

export const getMyNotices = async () => {
    const res = await api.get("/student/notices");
    return res.data.data;
};