import { prisma } from "@gradewise/db";

export const calculateInternalMarks = async (
    teacherId: number,
    classId: number,
    subjectId: number,
    totalInternal: number,
    attendanceMarks: number
) => {
    // check teacher is assigned
    const assignment = await prisma.subjectAssignment.findUnique({
        where: { subjectId_classId: { subjectId, classId } },
    });
    if (!assignment || assignment.teacherId !== teacherId)
        throw new Error("You are not assigned to this subject in this class");

    // get all students in class
    const studentsInClass = await prisma.studentClass.findMany({
        where: { classId },
        select: {
            student: { select: { id: true, name: true } },
        },
    });

    if (studentsInClass.length === 0)
        throw new Error("No students found in this class");

    // get all mark slots for this subject+class (exclude INTERNAL)
    const allMarks = await prisma.marks.findMany({
        where: {
            subjectId,
            classId,
            NOT: { type: "INTERNAL" },
        },
        select: {
            type: true,
            studentId: true,
            obtained: true,
            total: true,
        },
    });

    // get unique mark types (slots)
    const markTypes = [...new Set(allMarks.map((m) => m.type))];

    if (markTypes.length === 0)
        throw new Error("No marks found for this subject. Add marks first.");

    // marks weightage per slot
    const marksWeightage = totalInternal - attendanceMarks;
    const weightagePerSlot = marksWeightage / markTypes.length;

    // get attendance for all students
    const allAttendance = await prisma.attendance.findMany({
        where: { classId, subjectId },
        select: {
            records: {
                select: { studentId: true, isPresent: true },
            },
        },
    });

    const totalLectures = allAttendance.length;

    // calculate internal for each student
    const results = studentsInClass.map(({ student }) => {
        // calculate marks score
        let marksScore = 0;
        markTypes.forEach((type) => {
            const studentMark = allMarks.find(
                (m) => m.studentId === student.id && m.type === type
            );
            if (studentMark) {
                marksScore +=
                    (studentMark.obtained / studentMark.total) * weightagePerSlot;
            }
        });

        // calculate attendance score
        const attended = allAttendance.filter((lecture) =>
            lecture.records.some(
                (r) => r.studentId === student.id && r.isPresent
            )
        ).length;

        const attendancePercentage =
            totalLectures > 0 ? attended / totalLectures : 0;
        const attendanceScore = attendancePercentage * attendanceMarks;

        // final internal marks
        const internal = Math.round((marksScore + attendanceScore) * 100) / 100;

        return {
            studentId: student.id,
            studentName: student.name,
            breakdown: {
                markTypes: markTypes.map((type) => {
                    const studentMark = allMarks.find(
                        (m) => m.studentId === student.id && m.type === type
                    );
                    return {
                        type,
                        obtained: studentMark?.obtained ?? 0,
                        total: studentMark?.total ?? 0,
                        weightage: Math.round(weightagePerSlot * 100) / 100,
                        score:
                            studentMark
                                ? Math.round(
                                (studentMark.obtained / studentMark.total) *
                                weightagePerSlot *
                                100
                            ) / 100
                                : 0,
                    };
                }),
                attendance: {
                    totalLectures,
                    attended,
                    percentage: Math.round(attendancePercentage * 100),
                    weightage: attendanceMarks,
                    score: Math.round(attendanceScore * 100) / 100,
                },
            },
            totalInternal,
            internalObtained: internal,
        };
    });

    // upsert internal marks for each student
    await Promise.all(
        results.map((r) =>
            prisma.marks.upsert({
                where: {
                    studentId_subjectId_type: {
                        studentId: r.studentId,
                        subjectId,
                        type: "INTERNAL",
                    },
                },
                update: { obtained: r.internalObtained, total: totalInternal },
                create: {
                    studentId: r.studentId,
                    subjectId,
                    classId,
                    type: "INTERNAL",
                    obtained: r.internalObtained,
                    total: totalInternal,
                },
            })
        )
    );

    return {
        subject: subjectId,
        class: classId,
        totalInternal,
        attendanceMarks,
        markSlots: markTypes,
        weightagePerSlot: Math.round(weightagePerSlot * 100) / 100,
        results,
    };
};