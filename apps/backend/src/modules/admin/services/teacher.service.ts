import { prisma } from "@gradewise/db";
import { Department } from "@gradewise/db";
import bcrypt from "bcryptjs";
import { generatePassword } from "../../../shared/utils/passwordGen";
import { sendTeacherWelcomeEmail } from "../../../shared/utils/mailer";

// Add teacher
export const addTeacher = async (name: string, email: string) => {
    // check if already exists
    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) throw new Error("Teacher with this email already exists");

    // generate + hash password
    const rawPassword = generatePassword(name);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const teacher = await prisma.teacher.create({
        data: { name, email, password: hashedPassword },
    });

    // send welcome email — don't fail if email fails
    try {
        await sendTeacherWelcomeEmail(email, name, rawPassword);
    } catch (emailErr) {
        console.error("❌ Email failed:", emailErr);
    }

    return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        createdAt: teacher.createdAt,
    };
};

// Get all teachers with optional filters
export const getAllTeachers = async (filters: {
    department?: Department;
}) => {
    const teachers = await prisma.teacher.findMany({
        where: {
            subjectAssignments: filters.department
                ? {
                    some: {
                        class: { department: filters.department },
                    },
                }
                : undefined,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            classTeacherOf: {
                select: {
                    id: true,
                    year: true,
                    department: true,
                    division: true,
                },
            },
            subjectAssignments: {
                select: {
                    id: true,
                    subject: { select: { id: true, name: true } },
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

    return teachers;
};

// Get single teacher
export const getTeacherById = async (id: number) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            classTeacherOf: {
                select: {
                    id: true,
                    year: true,
                    department: true,
                    division: true,
                },
            },
            subjectAssignments: {
                select: {
                    id: true,
                    subject: { select: { id: true, name: true } },
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

    if (!teacher) throw new Error("Teacher not found");
    return teacher;
};

// Delete teacher
export const deleteTeacher = async (id: number) => {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error("Teacher not found");

    await prisma.teacher.delete({ where: { id } });
    return { message: "Teacher deleted successfully" };
};