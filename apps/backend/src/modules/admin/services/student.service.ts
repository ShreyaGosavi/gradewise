import { prisma } from "@gradewise/db";
import { Department, Year } from "@gradewise/db";
import * as bcrypt from "bcryptjs";
import { generatePassword } from "../../../shared/utils/passwordGen";
import { sendStudentWelcomeEmail } from "../../../shared/utils/mailer";

// Add student
export const addStudent = async (
    name: string,
    email: string,
    year: Year,
    department: Department
) => {
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) throw new Error("Student with this email already exists");

    const rawPassword = generatePassword(name);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const student = await prisma.student.create({
        data: { name, email, password: hashedPassword, year, department },
    });

    await sendStudentWelcomeEmail(email, name, rawPassword);

    return {
        id: student.id,
        name: student.name,
        email: student.email,
        year: student.year,
        department: student.department,
        createdAt: student.createdAt,
    };
};

// Get all students with filters
export const getAllStudents = async (
    filters: { department?: Department; year?: Year; classId?: number },
    page: number,
    limit: number,
    skip: number
) => {
    const where = {
        ...(filters.department && { department: filters.department }),
        ...(filters.year && { year: filters.year }),
        ...(filters.classId && { studentClass: { classId: filters.classId } }),
    };

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            skip,
            take: limit,
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
                            select: { id: true, year: true, department: true, division: true },
                        },
                    },
                },
            },
        }),
        prisma.student.count({ where }),
    ]);

    return { students, total };
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