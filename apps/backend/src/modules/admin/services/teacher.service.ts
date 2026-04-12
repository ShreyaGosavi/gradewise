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
export const getAllTeachers = async (
    filters: { department?: Department },
    page: number,
    limit: number,
    skip: number
) => {
    const where = {
        isActive: true,
        subjectAssignments: filters.department
            ? { some: { class: { department: filters.department } } }
            : undefined,
    };

    const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                classTeacherOf: {
                    select: { id: true, year: true, department: true, division: true },
                },
                subjectAssignments: {
                    select: {
                        id: true,
                        subject: { select: { id: true, name: true } },
                        class: {
                            select: { id: true, year: true, department: true, division: true },
                        },
                    },
                },
            },
        }),
        prisma.teacher.count({ where }),
    ]);

    return { teachers, total };
};

// Get single teacher
export const getTeacherById = async (id: number) => {
    // check exists and is active first
    const exists = await prisma.teacher.findUnique({
        where: { id },
        select: { isActive: true },
    });

    if (!exists || !exists.isActive) throw new Error("Teacher not found");

    // then fetch full details
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

    return teacher;
};

// Delete teacher
export const deleteTeacher = async (id: number) => {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error("Teacher not found");
    if (!teacher.isActive) throw new Error("Teacher already deleted");

    await prisma.teacher.update({
        where: { id },
        data: { isActive: false },
    });
    return { message: "Teacher deleted successfully" };
};