import { Router } from "express";
import authRoutes from "./auth.route";
import attendanceRoutes from "./attendance.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/attendance", attendanceRoutes);

export default router;