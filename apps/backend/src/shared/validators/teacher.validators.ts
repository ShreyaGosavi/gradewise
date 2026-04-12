import { z } from "zod";

const markTypes = ["INSEM1", "INSEM2", "ENDSEM", "INTERNAL", "PRACTICAL", "ORAL"] as const;
const noticeTypes = ["ASSIGNMENT", "TEST", "NOTICE", "EVENT"] as const;

export const markAttendanceSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    subjectId: z.number({ error: "subjectId must be a number" }),
    date: z.string().min(1, "Date is required"),
    lectureNo: z.number({ error: "lectureNo must be a number" }),
    records: z.array(
        z.object({
            studentId: z.number({ error: "studentId must be a number" }),
            isPresent: z.boolean({ error: "isPresent must be a boolean" }),
        })
    ).min(1, "Records must have at least one entry"),
});

export const updateAttendanceSchema = z.object({
    records: z.array(
        z.object({
            studentId: z.number({ error: "studentId must be a number" }),
            isPresent: z.boolean({ error: "isPresent must be a boolean" }),
        })
    ).min(1, "Records must have at least one entry"),
});

export const addMarksSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    subjectId: z.number({ error: "subjectId must be a number" }),
    type: z.enum(markTypes, { error: `Type must be one of: ${markTypes.join(", ")}` }),
    total: z.number({ error: "total must be a number" }).positive("total must be positive"),
    records: z.array(
        z.object({
            studentId: z.number({ error: "studentId must be a number" }),
            obtained: z.number({ error: "obtained must be a number" }).min(0, "obtained must be >= 0"),
        })
    ).min(1, "Records must have at least one entry"),
});

export const updateMarksSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    subjectId: z.number({ error: "subjectId must be a number" }),
    type: z.enum(markTypes, { error: `Type must be one of: ${markTypes.join(", ")}` }),
    records: z.array(
        z.object({
            studentId: z.number({ error: "studentId must be a number" }),
            obtained: z.number({ error: "obtained must be a number" }).min(0, "obtained must be >= 0"),
        })
    ).min(1, "Records must have at least one entry"),
});

export const postNoticeSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    type: z.enum(noticeTypes, { error: `Type must be one of: ${noticeTypes.join(", ")}` }),
    dueDate: z.string().optional(),
});

export const calculateInternalSchema = z.object({
    classId: z.number({ error: "classId must be a number" }),
    subjectId: z.number({ error: "subjectId must be a number" }),
    totalInternal: z.number({ error: "totalInternal must be a number" }).positive("totalInternal must be positive"),
    attendanceMarks: z.number({ error: "attendanceMarks must be a number" }).min(0, "attendanceMarks must be >= 0"),
});