import { prisma } from "@gradewise/db";

// Mark new lecture attendance (all students at once)
export const markAttendance = async (
    teacherId: number,
    classId: number,
    subjectId: number,
    date: string,
    lectureNo: number,
    records: { studentId: number; isPresent: boolean }[]
) => {
    // check teacher is assigned to this subject in this class
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (!assignment || assignment.teacherId !== teacherId)
        throw new Error("You are not assigned to this subject in this class");

    // check lecture doesn't already exist
    const existing = await prisma.attendance.findUnique({
        where: {
            classId_subjectId_date_lectureNo: {
                classId,
                subjectId,
                date: new Date(date),
                lectureNo,
            },
        },
    });
    if (existing)
        throw new Error(
            "Attendance for this lecture already exists. Use update instead."
        );

    // create attendance + all records at once
    const attendance = await prisma.attendance.create({
        data: {
            classId,
            subjectId,
            teacherId,
            date: new Date(date),
            lectureNo,
            records: {
                create: records.map((r) => ({
                    studentId: r.studentId,
                    isPresent: r.isPresent,
                })),
            },
        },
        select: {
            id: true,
            date: true,
            lectureNo: true,
            subject: { select: { id: true, name: true } },
            class: {
                select: { id: true, year: true, department: true, division: true },
            },
            records: {
                select: {
                    id: true,
                    isPresent: true,
                    student: { select: { id: true, name: true } },
                },
            },
        },
    });

    return attendance;
};

// Update existing lecture attendance
export const updateAttendance = async (
    teacherId: number,
    attendanceId: number,
    records: { studentId: number; isPresent: boolean }[]
) => {
    // check attendance exists
    const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
    });
    if (!attendance) throw new Error("Attendance not found");

    // check this teacher owns this attendance
    if (attendance.teacherId !== teacherId)
        throw new Error("You are not authorized to update this attendance");

    // update each record
    const updated = await Promise.all(
        records.map((r) =>
            prisma.attendanceRecord.updateMany({
                where: {
                    attendanceId,
                    studentId: r.studentId,
                },
                data: { isPresent: r.isPresent },
            })
        )
    );

    // return updated attendance
    return await prisma.attendance.findUnique({
        where: { id: attendanceId },
        select: {
            id: true,
            date: true,
            lectureNo: true,
            subject: { select: { id: true, name: true } },
            class: {
                select: { id: true, year: true, department: true, division: true },
            },
            records: {
                select: {
                    id: true,
                    isPresent: true,
                    student: { select: { id: true, name: true } },
                },
            },
        },
    });
};

// View all lectures + records for a class+subject
export const getAttendance = async (
    teacherId: number,
    classId: number,
    subjectId: number
) => {
    // check teacher is assigned to this subject in this class
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (!assignment || assignment.teacherId !== teacherId)
        throw new Error("You are not assigned to this subject in this class");

    return await prisma.attendance.findMany({
        where: { classId, subjectId },
        orderBy: [{ date: "asc" }, { lectureNo: "asc" }],
        select: {
            id: true,
            date: true,
            lectureNo: true,
            records: {
                select: {
                    id: true,
                    isPresent: true,
                    student: { select: { id: true, name: true } },
                },
            },
        },
    });
};