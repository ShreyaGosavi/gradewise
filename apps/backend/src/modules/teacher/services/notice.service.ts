import { prisma } from "@gradewise/db";
import { NoticeType } from "@gradewise/db";

// Post a notice
export const createNotice = async (
    teacherId: number,
    classId: number,
    title: string,
    content: string,
    type: NoticeType,
    dueDate?: string
) => {
    // check teacher is assigned to this class
    // either as class teacher or subject teacher
    const isClassTeacher = await prisma.class.findFirst({
        where: { id: classId, classTeacherId: teacherId },
    });

    const isSubjectTeacher = await prisma.subjectAssignment.findFirst({
        where: { classId, teacherId },
    });

    if (!isClassTeacher && !isSubjectTeacher)
        throw new Error("You are not assigned to this class");

    return await prisma.noticeBoard.create({
        data: {
            title,
            content,
            type,
            classId,
            teacherId,
            dueDate: dueDate ? new Date(dueDate) : null,
        },
        select: {
            id: true,
            title: true,
            content: true,
            type: true,
            dueDate: true,
            createdAt: true,
            teacher: { select: { id: true, name: true } },
            class: {
                select: { id: true, year: true, department: true, division: true },
            },
        },
    });
};

// Get all notices for a class
export const getNotices = async (
    teacherId: number,
    classId: number
) => {
    // check teacher is assigned to this class
    const isClassTeacher = await prisma.class.findFirst({
        where: { id: classId, classTeacherId: teacherId },
    });

    const isSubjectTeacher = await prisma.subjectAssignment.findFirst({
        where: { classId, teacherId },
    });

    if (!isClassTeacher && !isSubjectTeacher)
        throw new Error("You are not assigned to this class");

    return await prisma.noticeBoard.findMany({
        where: { classId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            content: true,
            type: true,
            dueDate: true,
            createdAt: true,
            teacher: { select: { id: true, name: true } },
        },
    });
};

// Delete a notice
export const deleteNotice = async (
    teacherId: number,
    noticeId: number
) => {
    const notice = await prisma.noticeBoard.findUnique({
        where: { id: noticeId },
    });

    if (!notice) throw new Error("Notice not found");

    // only the teacher who posted it can delete it
    if (notice.teacherId !== teacherId)
        throw new Error("You are not authorized to delete this notice");

    await prisma.noticeBoard.delete({ where: { id: noticeId } });
    return { message: "Notice deleted successfully" };
};