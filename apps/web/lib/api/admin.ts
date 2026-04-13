import api from "@/lib/axios";

// ─── Stats ───────────────────────────────────────
export const getAdminMe = async () => {
    const res = await api.get("/admin/auth/me");
    return res.data.data;
};

// ─── Teachers ────────────────────────────────────
export const getTeachers = async (params?: {
    page?: number;
    limit?: number;
    department?: string;
}) => {
    const res = await api.get("/admin/teachers", { params });
    return res.data;
};

export const getTeacher = async (id: number) => {
    const res = await api.get(`/admin/teachers/${id}`);
    return res.data.data;
};

export const createTeacher = async (data: {
    name: string;
    email: string;
}) => {
    const res = await api.post("/admin/teachers", data);
    return res.data.data;
};

export const deleteTeacher = async (id: number) => {
    const res = await api.delete(`/admin/teachers/${id}`);
    return res.data;
};

// ─── Students ────────────────────────────────────
export const getStudents = async (params?: {
    page?: number;
    limit?: number;
    year?: string;
    department?: string;
    classId?: number;
}) => {
    const res = await api.get("/admin/students", { params });
    return res.data;
};

export const createStudent = async (data: {
    name: string;
    email: string;
    year: string;
    department: string;
}) => {
    const res = await api.post("/admin/students", data);
    return res.data.data;
};

export const deleteStudent = async (id: number) => {
    const res = await api.delete(`/admin/students/${id}`);
    return res.data;
};

// ─── Classes ─────────────────────────────────────
export const getClasses = async (params?: {
    page?: number;
    limit?: number;
    year?: string;
    department?: string;
}) => {
    const res = await api.get("/admin/classes", { params });
    return res.data;
};

export const createClass = async (data: {
    year: string;
    department: string;
    division: string;
}) => {
    const res = await api.post("/admin/classes", data);
    return res.data.data;
};

export const deleteClass = async (id: number) => {
    const res = await api.delete(`/admin/classes/${id}`);
    return res.data;
};

// ─── Subjects ────────────────────────────────────
export const getSubjects = async (params?: {
    page?: number;
    limit?: number;
}) => {
    const res = await api.get("/admin/subjects", { params });
    return res.data;
};

export const createSubject = async (data: { name: string }) => {
    const res = await api.post("/admin/subjects", data);
    return res.data.data;
};

export const deleteSubject = async (id: number) => {
    const res = await api.delete(`/admin/subjects/${id}`);
    return res.data;
};

// ─── Assignments ──────────────────────────────────
export const assignClassTeacher = async (data: {
    classId: number;
    teacherId: number;
}) => {
    const res = await api.post("/admin/assignments/class-teacher", data);
    return res.data.data;
};

export const removeClassTeacher = async (classId: number) => {
    const res = await api.delete(`/admin/assignments/class-teacher/${classId}`);
    return res.data;
};

export const assignSubjectTeacher = async (data: {
    classId: number;
    subjectId: number;
    teacherId: number;
}) => {
    const res = await api.post("/admin/assignments/subject-teacher", data);
    return res.data.data;
};

export const removeSubjectTeacher = async (assignmentId: number) => {
    const res = await api.delete(`/admin/assignments/subject-teacher/${assignmentId}`);
    return res.data;
};

export const assignStudentClass = async (data: {
    studentId: number;
    classId: number;
}) => {
    const res = await api.post("/admin/assignments/student-class", data);
    return res.data.data;
};

export const removeStudentClass = async (studentId: number) => {
    const res = await api.delete(`/admin/assignments/student-class/${studentId}`);
    return res.data;
};