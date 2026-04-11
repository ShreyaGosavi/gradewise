import { Router } from "express";
import {
    markLectureAttendance,
    updateLectureAttendance,
    getLectureAttendance,
} from "../controllers/attendance.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";

const router = Router();

router.use(teacherProtect);

router.post("/", markLectureAttendance);
router.put("/:attendanceId", updateLectureAttendance);
router.get("/:classId/:subjectId", getLectureAttendance);

export default router;
