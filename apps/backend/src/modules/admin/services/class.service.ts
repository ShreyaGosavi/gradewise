import { prisma } from "@gradewise/db";
import { Department, Year } from "@gradewise/db";

// Create class
export const createClass = async (
    year: Year,
    department: Department,
    division: string
) => {
    const existing = await prisma.class.findUnique({
        where: { year_department_division: { year, department, division } },
    });
    if (existing) throw new Error("Class already exists");

    return await prisma.class.create({
        data: { year, department, division },
    });
};

// Get all classes with filters
export const getAllClasses = async (filters: {
    year?: Year;
    department?: Department;
}) => {
    return await prisma.class.findMany({
        where: {
            ...(filters.year && { year: filters.year }),
            ...(filters.department && { department: filters.department }),
        },
        select: {
            id: true,
            year: true,
            department: true,
            division: true,
            createdAt: true,
            classTeacher: {
                select: { id: true, name: true, email: true },
            },
            subjectAssignments: {
                select: {
                    id: true,
                    subject: { select: { id: true, name: true } },
                    teacher: { select: { id: true, name: true } },
                },
            },
            students: {
                select: {
                    student: { select: { id: true, name: true, email: true } },
                },
            },
        },
    });
};

// Get single class
export const getClassById = async (id: number) => {
    const cls = await prisma.class.findUnique({
        where: { id },
        select: {
            id: true,
            year: true,
            department: true,
            division: true,
            createdAt: true,
            classTeacher: {
                select: { id: true, name: true, email: true },
            },
            subjectAssignments: {
                select: {
                    id: true,
                    subject: { select: { id: true, name: true } },
                    teacher: { select: { id: true, name: true } },
                },
            },
            students: {
                select: {
                    student: { select: { id: true, name: true, email: true } },
                },
            },
        },
    });

    if (!cls) throw new Error("Class not found");
    return cls;
};

// Delete class
export const deleteClass = async (id: number) => {
    const cls = await prisma.class.findUnique({ where: { id } });
    if (!cls) throw new Error("Class not found");
    await prisma.class.delete({ where: { id } });
    return { message: "Class deleted successfully" };
};