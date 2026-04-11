import { Router } from "express";
import { viewAttendance } from "../controllers/attendance.controller";
import { studentProtect } from "../../../shared/middleware/studentAuth.middleware";

const router = Router();

router.use(studentProtect);
router.get("/", viewAttendance);

export default router;