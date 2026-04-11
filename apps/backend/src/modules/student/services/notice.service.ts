import { prisma } from "@gradewise/db";

export const getMyNotices = async (studentId: number) => {
    // get student's class
    const studentClass = await prisma.studentClass.findUnique({
        where: { studentId },
    });
    if (!studentClass) throw new Error("You are not assigned to any class yet");

    return await prisma.noticeBoard.findMany({
        where: { classId: studentClass.classId },
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