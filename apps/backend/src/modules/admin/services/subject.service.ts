import { prisma } from "@gradewise/db";

export const createSubject = async (name: string) => {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) throw new Error("Subject already exists");

    return await prisma.subject.create({
        data: { name },
    });
};

export const getAllSubjects = async (
    page: number,
    limit: number,
    skip: number
) => {
    const [subjects, total] = await Promise.all([
        prisma.subject.findMany({
            where: { isActive: true },
            skip,
            take: limit,
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
        }),
        prisma.subject.count(),
    ]);

    return { subjects, total };
};

export const getSubjectById = async (id: number) => {
    const exists = await prisma.subject.findUnique({
        where: { id },
        select: { isActive: true },
    });

    if (!exists || !exists.isActive) throw new Error("Subject not found");

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
    if (!subject.isActive) throw new Error("Subject already deleted");

    await prisma.subject.update({
        where: { id },
        data: { isActive: false },
    });
    return { message: "Subject deleted successfully" };
};