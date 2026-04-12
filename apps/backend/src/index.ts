import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./shared/middleware/error.middleware";
import adminRoutes from "./modules/admin/routes/index";
import teacherRoutes from "./modules/teacher/routes/index";
import studentRoutes from "./modules/student/routes/index";
import changePasswordRoutes from "./shared/routes/changePassword.route";




dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/auth", changePasswordRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});