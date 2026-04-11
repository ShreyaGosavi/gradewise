import { Router } from "express";
import authRoutes from "./auth.route";
import teacherRoutes from "./teacher.route";
import studentRoutes from "./student.route";
import classRoutes from "./class.route";
import subjectRoutes from "./subject.route";
import assignmentRoutes from "./assignment.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/classes", classRoutes);
router.use("/subjects", subjectRoutes);
router.use("/assignments", assignmentRoutes);

export default router;