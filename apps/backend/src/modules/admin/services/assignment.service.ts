import { prisma } from "@gradewise/db";

// ─── Class Teacher ───────────────────────────────────────

export const assignClassTeacher = async (
    classId: number,
    teacherId: number
) => {
    // check class exists
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    // check teacher exists
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error("Teacher not found");

    // check if class already has a class teacher
    if (cls.classTeacherId)
        throw new Error("Class already has a class teacher. Remove them first.");

    // check if teacher is already a class teacher of another class
    const alreadyClassTeacher = await prisma.class.findFirst({
        where: { classTeacherId: teacherId },
    });
    if (alreadyClassTeacher)
        throw new Error("Teacher is already a class teacher of another class");

    return await prisma.class.update({
        where: { id: classId },
        data: { classTeacherId: teacherId },
        select: {
            id: true,
            year: true,
            department: true,
            division: true,
            classTeacher: { select: { id: true, name: true, email: true } },
        },
    });
};

export const removeClassTeacher = async (classId: number) => {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (!cls.classTeacherId)
        throw new Error("Class does not have a class teacher");

    return await prisma.class.update({
        where: { id: classId },
        data: { classTeacherId: null },
        select: {
            id: true,
            year: true,
            department: true,
            division: true,
        },
    });
};

// ─── Subject Teacher ─────────────────────────────────────

export const assignSubjectTeacher = async (
    classId: number,
    subjectId: number,
    teacherId: number
) => {
    // check all three exist
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new Error("Subject not found");

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error("Teacher not found");

    // check if subject already has a teacher in this class
    const existing = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (existing)
        throw new Error("This subject already has a teacher in this class. Remove them first.");

    return await prisma.subjectAssignment.create({
        data: { classId, subjectId, teacherId },
        select: {
            id: true,
            teacher: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
            class: {
                select: { id: true, year: true, department: true, division: true },
            },
        },
    });
};

export const removeSubjectTeacher = async (assignmentId: number) => {
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { id: assignmentId },
    });
    if (!assignment) throw new Error("Assignment not found");

    await prisma.subjectAssignment.delete({ where: { id: assignmentId } });
    return { message: "Subject teacher removed successfully" };
};

// ─── Student Class ────────────────────────────────────────

export const assignStudentToClass = async (
    studentId: number,
    classId: number
) => {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error("Student not found");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    // check student is not already in a class
    const existing = await prisma.studentClass.findUnique({
        where: { studentId },
    });
    if (existing)
        throw new Error("Student is already assigned to a class. Remove them first.");

    // check year + department matches
    if (student.year !== cls.year || student.department !== cls.department)
        throw new Error(
            `Student is ${student.year} ${student.department} but class is ${cls.year} ${cls.department}`
        );

    return await prisma.studentClass.create({
        data: { studentId, classId },
        select: {
            id: true,
            student: { select: { id: true, name: true, email: true } },
            class: {
                select: { id: true, year: true, department: true, division: true },
            },
        },
    });
};

export const removeStudentFromClass = async (studentId: number) => {
    const existing = await prisma.studentClass.findUnique({
        where: { studentId },
    });
    if (!existing) throw new Error("Student is not assigned to any class");

    await prisma.studentClass.delete({ where: { studentId } });
    return { message: "Student removed from class successfully" };
};