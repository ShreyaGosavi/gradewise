import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./shared/middleware/error.middleware";
import adminRoutes from "./modules/admin/routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/api/admin", adminRoutes);
// future: app.use("/api/teacher", teacherRoutes);
// future: app.use("/api/student", studentRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});