import { prisma } from "@gradewise/db";
import * as bcrypt from "bcryptjs";

export const changePassword = async (
    id: number,
    role: string,
    currentPassword: string,
    newPassword: string
) => {
    let user: { password: string } | null = null;

    // fetch user based on role
    if (role === "admin") {
        user = await prisma.admin.findUnique({
            where: { id },
            select: { password: true },
        });
    } else if (role === "teacher") {
        user = await prisma.teacher.findUnique({
            where: { id },
            select: { password: true },
        });
    } else if (role === "student") {
        user = await prisma.student.findUnique({
            where: { id },
            select: { password: true },
        });
    } else {
        throw new Error("Invalid role");
    }

    if (!user) throw new Error("User not found");

    // verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");

    // validate new password
    if (newPassword.length < 6)
        throw new Error("New password must be at least 6 characters");

    if (currentPassword === newPassword)
        throw new Error("New password must be different from current password");

    // hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (role === "admin") {
        await prisma.admin.update({
            where: { id },
            data: { password: hashedPassword },
        });
    } else if (role === "teacher") {
        await prisma.teacher.update({
            where: { id },
            data: { password: hashedPassword },
        });
    } else if (role === "student") {
        await prisma.student.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }

    return { message: "Password changed successfully" };
};