import express from "express";
import dotenv from "dotenv";
import { prisma } from "@gradewise/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Gradewise backend is running 🎓" });
});

app.get("/health", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json({ status: "ok", users });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});