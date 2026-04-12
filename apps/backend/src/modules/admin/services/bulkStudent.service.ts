import { prisma } from "@gradewise/db";
import { Department, Year } from "@gradewise/db";
import * as bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { generatePassword } from "../../../shared/utils/passwordGen";
import { sendStudentWelcomeEmail } from "../../../shared/utils/mailer";

const validYears = ["FE", "SE", "TE", "BE"];
const validDepartments = ["CSE", "IT", "ME", "CIVIL", "EXTC"];

interface StudentCSVRow {
    name: string;
    email: string;
    year: string;
    department: string;
}

export const bulkAddStudents = async (fileBuffer: Buffer) => {
    // parse CSV
    // parse CSV
    const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as StudentCSVRow[];

    const successful: any[] = [];
    const failed: any[] = [];

    for (const record of records) {
        const { name, email, year, department } = record;

        // validate each row
        if (!name || !email || !year || !department) {
            failed.push({ record, reason: "Missing required fields" });
            continue;
        }

        if (!validYears.includes(year)) {
            failed.push({ record, reason: `Invalid year. Must be one of: ${validYears.join(", ")}` });
            continue;
        }

        if (!validDepartments.includes(department)) {
            failed.push({ record, reason: `Invalid department. Must be one of: ${validDepartments.join(", ")}` });
            continue;
        }

        // check if email already exists
        const existing = await prisma.student.findUnique({ where: { email } });
        if (existing) {
            failed.push({ record, reason: "Email already exists" });
            continue;
        }

        try {
            const rawPassword = generatePassword(name);
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            const student = await prisma.student.create({
                data: {
                    name,
                    email,
                    year: year as Year,
                    department: department as Department,
                    password: hashedPassword,
                },
            });

            // send welcome email
            try {
                await sendStudentWelcomeEmail(email, name, rawPassword);
            } catch (emailErr) {
                console.error("❌ Email failed for:", email);
            }

            successful.push({
                id: student.id,
                name: student.name,
                email: student.email,
                year: student.year,
                department: student.department,
            });
        } catch (err: any) {
            failed.push({ record, reason: err.message });
        }
    }

    return {
        total: records.length,
        successCount: successful.length,
        failedCount: failed.length,
        successful,
        failed,
    };
};