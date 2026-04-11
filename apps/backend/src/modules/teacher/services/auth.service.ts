import { prisma } from "@gradewise/db";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginTeacher = async (email: string, password: string) => {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign(
        { id: teacher.id, email: teacher.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );

    return {
        token,
        teacher: { id: teacher.id, email: teacher.email, name: teacher.name },
    };
};

export const getTeacherProfile = async (id: number) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            // class they are class teacher of
            classTeacherOf: {
                select: {
                    id: true,
                    year: true,
                    department: true,
                    division: true,
                },
            },
            // all subject assignments
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