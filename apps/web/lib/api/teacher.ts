import api from "@/lib/axios";

export const getTeacherMe = async () => {
    const res = await api.get("/teacher/auth/me");
    return res.data.data;
};

// ─── Attendance ───────────────────────────────────
export const getAttendance = async (classId: number, subjectId: number) => {
    const res = await api.get(`/teacher/attendance/${classId}/${subjectId}`);
    return res.data.data;
};

export const getAttendanceSummary = async (classId: number, subjectId: number) => {
    const res = await api.get(`/teacher/attendance/${classId}/${subjectId}/summary`);
    return res.data.data;
};

export const markAttendance = async (data: {
    classId: number;
    subjectId: number;
    date: string;
    lectureNo: number;
    records: { studentId: number; isPresent: boolean }[];
}) => {
    const res = await api.post("/teacher/attendance", data);
    return res.data.data;
};

export const updateAttendance = async (
    attendanceId: number,
    records: { studentId: number; isPresent: boolean }[]
) => {
    const res = await api.put(`/teacher/attendance/${attendanceId}`, { records });
    return res.data.data;
};

// ─── Marks ────────────────────────────────────────
export const getMarks = async (classId: number, subjectId: number) => {
    const res = await api.get(`/teacher/marks/${classId}/${subjectId}`);
    return res.data.data;
};

export const addMarks = async (data: {
    classId: number;
    subjectId: number;
    type: string;
    total: number;
    records: { studentId: number; obtained: number }[];
}) => {
    const res = await api.post("/teacher/marks", data);
    return res.data.data;
};

export const updateMarks = async (data: {
    classId: number;
    subjectId: number;
    type: string;
    records: { studentId: number; obtained: number }[];
}) => {
    const res = await api.put("/teacher/marks", data);
    return res.data.data;
};

export const calculateInternal = async (data: {
    classId: number;
    subjectId: number;
    totalInternal: number;
    attendanceMarks: number;
}) => {
    const res = await api.post("/teacher/internal-marks/calculate", data);
    return res.data.data;
};

// ─── Notices ──────────────────────────────────────
export const getNotices = async (classId: number) => {
    const res = await api.get(`/teacher/notices/${classId}`);
    return res.data.data;
};

export const postNotice = async (data: {
    classId: number;
    title: string;
    content: string;
    type: string;
    dueDate?: string;
}) => {
    const res = await api.post("/teacher/notices", data);
    return res.data.data;
};

export const deleteNotice = async (noticeId: number) => {
    const res = await api.delete(`/teacher/notices/${noticeId}`);
    return res.data;
};

export const getClassStudents = async (classId: number) => {
    const res = await api.get(`/admin/students`, { params: { classId, limit: 100 } });
    return res.data.data;
};