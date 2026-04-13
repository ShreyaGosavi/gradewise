import { prisma } from "./index";
import * as bcrypt from "bcryptjs";

async function main() {
    const hashedPassword = await bcrypt.hash("swati@123", 10);

    const admin = await prisma.admin.upsert({
        where: { email: "swati@gradewise.com" },
        update: {},
        create: {
            email: "swati@gradewise.com",
            password: hashedPassword,
            name: "Super Admin 2",
        },
    });

    console.log("✅ Admin seeded:", admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());