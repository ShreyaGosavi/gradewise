import { prisma } from "./index";
import * as bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Seeding database...");

    // ─── Admin ───────────────────────────────────────
    const adminPassword = await bcrypt.hash("adm@8894", 10);
    const admin = await prisma.admin.upsert({
        where: { email: "admin@gradewise.com" },
        update: { password: adminPassword },
        create: {
            email: "admin@gradewise.com",
            password: adminPassword,
            name: "Super Admin",
        },
    });
    console.log("✅ Admin:", admin.email, "| password: adm@8894");

    // ─── Teachers ────────────────────────────────────
    const teacherData = [
        { name: "Mr Rahul Patil",    email: "patil@gradewise.com" },
        { name: "Mrs Sneha Sharma",  email: "sharma@gradewise.com" },
        { name: "Mr Vikas Joshi",    email: "joshi@gradewise.com" },
        { name: "Mrs Priya Desai",   email: "desai@gradewise.com" },
        { name: "Mr Amit Kulkarni",  email: "kulkarni@gradewise.com" },
    ];

    const teachers = [];
    for (const t of teacherData) {
        const password = await bcrypt.hash("tea@8894", 10);
        const teacher = await prisma.teacher.upsert({
            where: { email: t.email },
            update: {},
            create: { name: t.name, email: t.email, password },
        });
        teachers.push(teacher);
        console.log("✅ Teacher:", teacher.email, "| password: teacher@123");
    }

    // ─── Classes ─────────────────────────────────────
    const classData = [
        { year: "TE" as const, department: "CSE" as const, division: "A" },
        { year: "TE" as const, department: "CSE" as const, division: "B" },
        { year: "SE" as const, department: "IT"  as const, division: "A" },
    ];

    const classes = [];
    for (const c of classData) {
        const cls = await prisma.class.upsert({
            where: { year_department_division: c },
            update: {},
            create: c,
        });
        classes.push(cls);
        console.log("✅ Class:", `${cls.year}-${cls.department}-${cls.division}`);
    }

    // ─── Subjects ────────────────────────────────────
    const subjectData = ["DBMS", "CN", "SE"];
    const subjects = [];
    for (const name of subjectData) {
        const subject = await prisma.subject.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        subjects.push(subject);
        console.log("✅ Subject:", subject.name);
    }

    // ─── Assign class teachers ────────────────────────
    // TE-CSE-A → Mr Rahul Patil
    // TE-CSE-B → Mrs Sneha Sharma
    // SE-IT-A  → Mr Vikas Joshi
    await prisma.class.update({
        where: { id: classes[0].id },
        data: { classTeacherId: teachers[0].id },
    });
    await prisma.class.update({
        where: { id: classes[1].id },
        data: { classTeacherId: teachers[1].id },
    });
    await prisma.class.update({
        where: { id: classes[2].id },
        data: { classTeacherId: teachers[2].id },
    });
    console.log("✅ Class teachers assigned");

    // ─── Assign subject teachers ──────────────────────
    // DBMS → Mr Patil → TE-CSE-A
    // CN   → Mrs Sharma → TE-CSE-A
    // SE   → Mr Joshi → TE-CSE-A
    // DBMS → Mrs Desai → TE-CSE-B
    // CN   → Mr Kulkarni → SE-IT-A
    const subjectAssignments = [
        { teacherId: teachers[0].id, subjectId: subjects[0].id, classId: classes[0].id },
        { teacherId: teachers[1].id, subjectId: subjects[1].id, classId: classes[0].id },
        { teacherId: teachers[2].id, subjectId: subjects[2].id, classId: classes[0].id },
        { teacherId: teachers[3].id, subjectId: subjects[0].id, classId: classes[1].id },
        { teacherId: teachers[4].id, subjectId: subjects[1].id, classId: classes[2].id },
    ];

    for (const sa of subjectAssignments) {
        await prisma.subjectAssignment.upsert({
            where: { subjectId_classId: { subjectId: sa.subjectId, classId: sa.classId } },
            update: {},
            create: sa,
        });
    }
    console.log("✅ Subject teachers assigned");

    // ─── Students ────────────────────────────────────
    const studentData = [
        { name: "Rahul Sharma",  email: "rahul@college.com",  year: "TE" as const, department: "CSE" as const },
        { name: "Priya Patel",   email: "priya@college.com",  year: "TE" as const, department: "CSE" as const },
        { name: "Amit Kumar",    email: "amit@college.com",   year: "TE" as const, department: "CSE" as const },
        { name: "Sneha Joshi",   email: "sneha@college.com",  year: "SE" as const, department: "IT"  as const },
        { name: "Rohan Desai",   email: "rohan@college.com",  year: "SE" as const, department: "IT"  as const },
    ];

    const students = [];
    for (const s of studentData) {
        const password = await bcrypt.hash("stu@8894", 10);
        const student = await prisma.student.upsert({
            where: { email: s.email },
            update: {},
            create: { ...s, password },
        });
        students.push(student);
        console.log("✅ Student:", student.email, "| password: student@123");
    }

    // ─── Assign students to classes ───────────────────
    // Rahul, Priya, Amit → TE-CSE-A
    // Sneha, Rohan → SE-IT-A
    const studentClassData = [
        { studentId: students[0].id, classId: classes[0].id },
        { studentId: students[1].id, classId: classes[0].id },
        { studentId: students[2].id, classId: classes[0].id },
        { studentId: students[3].id, classId: classes[2].id },
        { studentId: students[4].id, classId: classes[2].id },
    ];

    for (const sc of studentClassData) {
        await prisma.studentClass.upsert({
            where: { studentId: sc.studentId },
            update: {},
            create: sc,
        });
    }
    console.log("✅ Students assigned to classes");

    console.log("\n🎉 Seed complete!");
    console.log("\n📋 Login credentials:");
    console.log("  Admin:   admin@gradewise.com  / admin@123");
    console.log("  Teacher: patil@gradewise.com  / teacher@123");
    console.log("  Student: rahul@college.com    / student@123");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());