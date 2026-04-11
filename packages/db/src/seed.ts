import { prisma } from "./index";
import * as bcrypt from "bcryptjs";

async function main() {
    const hashedPassword = await bcrypt.hash("admin@gradewise", 10);

    const admin = await prisma.admin.upsert({
        where: { email: "admin@gradewise.com" },
        update: {},
        create: {
            email: "admin@gradewise.com",
            password: hashedPassword,
            name: "Super Admin",
        },
    });

    console.log("✅ Admin seeded:", admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());