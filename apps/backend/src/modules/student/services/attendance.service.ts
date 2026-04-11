import { prisma } from "@gradewise/db";

export const getMyAttendance = async (studentId: number) => {
    // get student's class first
    const studentClass = await prisma.studentClass.findUnique({
        where: { studentId },
    });
    if (!studentClass) throw new Error("You are not assigned to any class yet");

    // get all attendance records for this student
    const records = await prisma.attendanceRecord.findMany({
        where: { studentId },
        select: {
            isPresent: true,
            attendance: {
                select: {
                    date: true,
                    lectureNo: true,
                    subject: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: {
            attendance: { date: "asc" },
        },
    });

    // group by subject
    const grouped = records.reduce(
        (acc, record) => {
            const subjectName = record.attendance.subject.name;
            const subjectId = record.attendance.subject.id;

            if (!acc[subjectName]) {
                acc[subjectName] = {
                    subjectId,
                    subjectName,
                    totalLectures: 0,
                    attended: 0,
                    percentage: 0,
                    lectures: [],
                };
            }

            acc[subjectName].totalLectures++;
            if (record.isPresent) acc[subjectName].attended++;
            acc[subjectName].lectures.push({
                date: record.attendance.date,
                lectureNo: record.attendance.lectureNo,
                isPresent: record.isPresent,
            });

            return acc;
        },
        {} as Record<string, any>
    );

    // calculate percentage per subject
    Object.keys(grouped).forEach((subject) => {
        const { totalLectures, attended } = grouped[subject];
        grouped[subject].percentage =
            totalLectures > 0
                ? Math.round((attended / totalLectures) * 100)
                : 0;
    });

    return grouped;
};