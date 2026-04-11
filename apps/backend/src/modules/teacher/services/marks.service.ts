import { prisma } from "@gradewise/db";
import { MarksType } from "@gradewise/db";

// Add marks for all students at once
export const addMarks = async (
    teacherId: number,
    classId: number,
    subjectId: number,
    type: MarksType,
    total: number,
    records: { studentId: number; obtained: number }[]
) => {
    // check teacher is assigned to this subject in this class
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (!assignment || assignment.teacherId !== teacherId)
        throw new Error("You are not assigned to this subject in this class");

    // check if marks already exist for this type
    const existing = await prisma.marks.findFirst({
        where: { subjectId, classId, type },
    });
    if (existing)
        throw new Error(
            `Marks for ${type} already exist. Use update instead.`
        );

    // create all marks at once
    await prisma.marks.createMany({
        data: records.map((r) => ({
            studentId: r.studentId,
            subjectId,
            classId,
            type,
            obtained: r.obtained,
            total,
        })),
    });

    // return all created marks
    return await prisma.marks.findMany({
        where: { subjectId, classId, type },
        select: {
            id: true,
            type: true,
            obtained: true,
            total: true,
            student: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
        },
    });
};

// Update marks for students
export const updateMarks = async (
    teacherId: number,
    classId: number,
    subjectId: number,
    type: MarksType,
    records: { studentId: number; obtained: number }[]
) => {
    // check teacher is assigned to this subject in this class
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (!assignment || assignment.teacherId !== teacherId)
        throw new Error("You are not assigned to this subject in this class");

    // update each student's marks
    await Promise.all(
        records.map((r) =>
            prisma.marks.updateMany({
                where: {
                    studentId: r.studentId,
                    subjectId,
                    classId,
                    type,
                },
                data: { obtained: r.obtained },
            })
        )
    );

    // return updated marks
    return await prisma.marks.findMany({
        where: { subjectId, classId, type },
        select: {
            id: true,
            type: true,
            obtained: true,
            total: true,
            student: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
        },
    });
};

// View all marks for a class+subject
export const getMarks = async (
    teacherId: number,
    classId: number,
    subjectId: number
) => {
    // check teacher is assigned to this subject in this class
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (!assignment || assignment.teacherId !== teacherId)
        throw new Error("You are not assigned to this subject in this class");

    // get all marks grouped by type
    const allMarks = await prisma.marks.findMany({
        where: { subjectId, classId },
        orderBy: { type: "asc" },
        select: {
            id: true,
            type: true,
            obtained: true,
            total: true,
            student: { select: { id: true, name: true } },
        },
    });

    // group by type for cleaner response
    const grouped = allMarks.reduce(
        (acc, mark) => {
            if (!acc[mark.type]) acc[mark.type] = [];
            acc[mark.type]!.push({
                id: mark.id,
                obtained: mark.obtained,
                total: mark.total,
                student: mark.student,
            });
            return acc;
        },
        {} as Record<string, any[]>
    );

    return grouped;
};