import { prisma } from "./index";
import * as bcrypt from "bcryptjs";

async function main() {
    const hashedPassword = await bcrypt.hash("pravin@65435", 10);

    const admin = await prisma.admin.upsert({
        where: { email: "pravin@gradewise.com" },
        update: {},
        create: {
            email: "pravin@gradewise.com",
            password: hashedPassword,
            name: "Super Admin 3",
        },
    });

    console.log("✅ Admin seeded:", admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());