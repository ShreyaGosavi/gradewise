import { z } from "zod";

const years = ["FE", "SE", "TE", "BE"] as const;
const departments = ["CSE", "IT", "ME", "CIVIL", "EXTC"] as const;
const markTypes = ["INSEM1", "INSEM2", "ENDSEM", "INTERNAL", "PRACTICAL", "ORAL"] as const;
const noticeTypes = ["ASSIGNMENT", "TEST", "NOTICE", "EVENT"] as const;

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const addTeacherSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
});

export const addStudentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    year: z.enum(years, { error: `Year must be one of: ${years.join(", ")}` }),
    department: z.enum(departments, { error: `Department must be one of: ${departments.join(", ")}` }),
});

export const addClassSchema = z.object({
    year: z.enum(years, { error: `Year must be one of: ${years.join(", ")}` }),
    department: z.enum(departments, { error: `Department must be one of: ${departments.join(", ")}` }),
    division: z.string().min(1, "Division is required"),
});

export const addSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
});

export const assignClassTeacherSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    teacherId: z.number({ error: "teacherId must be a number" }),
});

export const assignSubjectTeacherSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    subjectId: z.number({ error: "subjectId must be a number" }),
    teacherId: z.number({ error: "teacherId must be a number" }),
});

export const assignStudentClassSchema = z.object({
    studentId: z.number({ error: "studentId must be a number" }),
    classId: z.number({ error: "classId must be a number" }),
});