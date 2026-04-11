import { prisma } from "@gradewise/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginAdmin = async (email: string, password: string) => {
    // find admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new Error("Invalid email or password");

    // check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid email or password");

    // generate token
    const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );

    return {
        token,
        admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
        },
    };
};

export const getAdminById = async (id: number) => {
    const admin = await prisma.admin.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!admin) throw new Error("Admin not found");
    return admin;
};