import { prisma } from "@gradewise/db";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginTeacher = async (email: string, password: string) => {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign(
        { id: teacher.id, email: teacher.email, role: "teacher" },
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
            classTeacherOf: {
                select: {
                    id: true,
                    year: true,
                    department: true,
                    division: true,
                    students: { select: { id: true } },
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

    // unique classes teaching
    const uniqueClassIds = [
        ...new Set(teacher.subjectAssignments.map((a) => a.class.id)),
    ];

    // total students across all classes teaching
    const studentsInClasses = await prisma.studentClass.count({
        where: { classId: { in: uniqueClassIds } },
    });

    // total lectures taken
    const totalLecturesTaken = await prisma.attendance.count({
        where: { teacherId: id },
    });

    return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        createdAt: teacher.createdAt,
        classTeacherOf: teacher.classTeacherOf
            ? {
                id: teacher.classTeacherOf.id,
                year: teacher.classTeacherOf.year,
                department: teacher.classTeacherOf.department,
                division: teacher.classTeacherOf.division,
            }
            : null,
        subjectAssignments: teacher.subjectAssignments,
        stats: {
            isClassTeacher: !!teacher.classTeacherOf,
            totalSubjectsTeaching: teacher.subjectAssignments.length,
            totalClassesTeaching: uniqueClassIds.length,
            totalStudents: studentsInClasses,
            totalLecturesTaken,
        },
    };
};