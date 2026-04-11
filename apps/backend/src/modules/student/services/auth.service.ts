import { prisma } from "@gradewise/db";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginStudent = async (email: string, password: string) => {
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign(
        { id: student.id, email: student.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );

    return {
        token,
        student: {
            id: student.id,
            email: student.email,
            name: student.name,
            year: student.year,
            department: student.department,
        },
    };
};

export const getStudentProfile = async (id: number) => {
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
                            classTeacher: { select: { id: true, name: true } },
                        },
                    },
                },
            },
        },
    });

    if (!student) throw new Error("Student not found");
    return student;
};