import { prisma } from "@gradewise/db";
import { Department, Year } from "@gradewise/db";

// Add student
export const addStudent = async (
    name: string,
    email: string,
    year: Year,
    department: Department
) => {
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) throw new Error("Student with this email already exists");

    const student = await prisma.student.create({
        data: { name, email, year, department },
    });

    return student;
};

// Get all students with filters
export const getAllStudents = async (filters: {
    department?: Department;
    year?: Year;
    classId?: number;
}) => {
    const students = await prisma.student.findMany({
        where: {
            ...(filters.department && { department: filters.department }),
            ...(filters.year && { year: filters.year }),
            ...(filters.classId && {
                studentClass: { classId: filters.classId },
            }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            year: true,
            department: true,
            createdAt: true,
            studentClass: {
                select: {
                    class: {
                        select: {
                            id: true,
                            year: true,
                            department: true,
                            division: true,
                        },
                    },
                },
            },
        },
    });

    return students;
};

// Get single student
export const getStudentById = async (id: number) => {
    const student = await prisma.student.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            year: true,
            department: true,
            createdAt: true,
            studentClass: {
                select: {
                    class: {
                        select: {
                            id: true,
                            year: true,
                            department: true,
                            division: true,
                        },
                    },
                },
            },
        },
    });

    if (!student) throw new Error("Student not found");
    return student;
};

// Delete student
export const deleteStudent = async (id: number) => {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new Error("Student not found");

    await prisma.student.delete({ where: { id } });
    return { message: "Student deleted successfully" };
};