import { prisma } from "@gradewise/db";

export const createSubject = async (name: string) => {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) throw new Error("Subject already exists");

    return await prisma.subject.create({
        data: { name },
    });
};

export const getAllSubjects = async () => {
    return await prisma.subject.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            subjectAssignments: {
                select: {
                    id: true,
                    class: {
                        select: { id: true, year: true, department: true, division: true },
                    },
                    teacher: { select: { id: true, name: true } },
                },
            },
        },
    });
};

export const getSubjectById = async (id: number) => {
    const subject = await prisma.subject.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            createdAt: true,
            subjectAssignments: {
                select: {
                    id: true,
                    class: {
                        select: { id: true, year: true, department: true, division: true },
                    },
                    teacher: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!subject) throw new Error("Subject not found");
    return subject;
};

export const deleteSubject = async (id: number) => {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new Error("Subject not found");
    await prisma.subject.delete({ where: { id } });
    return { message: "Subject deleted successfully" };
};