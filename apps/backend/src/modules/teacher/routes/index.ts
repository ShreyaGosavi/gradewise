import { Router } from "express";
import authRoutes from "./auth.route";
import attendanceRoutes from "./attendance.route";
import marksRoutes from "./marks.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/marks", marksRoutes);

export default router;