import { Router } from "express";
import authRoutes from "./auth.route";
import attendanceRoutes from "./attendance.route";
import marksRoutes from "./marks.route";
import noticeRoutes from "./notice.route";
import internalMarksRoutes from "./internalMarks.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/marks", marksRoutes);
router.use("/notices", noticeRoutes);
router.use("/internal-marks", internalMarksRoutes);

export default router;