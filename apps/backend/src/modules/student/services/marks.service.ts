import { prisma } from "@gradewise/db";

export const getMyMarks = async (studentId: number) => {
    // check student is assigned to a class
    const studentClass = await prisma.studentClass.findUnique({
        where: { studentId },
    });
    if (!studentClass) throw new Error("You are not assigned to any class yet");

    // get all marks for this student
    const marks = await prisma.marks.findMany({
        where: { studentId },
        select: {
            id: true,
            type: true,
            obtained: true,
            total: true,
            subject: { select: { id: true, name: true } },
        },
        orderBy: { type: "asc" },
    });

    // group by subject
    const grouped = marks.reduce(
        (acc, mark) => {
            const subjectName = mark.subject.name;
            const subjectId = mark.subject.id;

            if (!acc[subjectName]) {
                acc[subjectName] = {
                    subjectId,
                    subjectName,
                    marks: [],
                };
            }

            acc[subjectName].marks.push({
                id: mark.id,
                type: mark.type,
                obtained: mark.obtained,
                total: mark.total,
                percentage: Math.round((mark.obtained / mark.total) * 100),
            });

            return acc;
        },
        {} as Record<string, any>
    );

    return grouped;
};