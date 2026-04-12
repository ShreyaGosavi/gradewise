import { Router } from "express";
import {
    markLectureAttendance,
    updateLectureAttendance,
    getLectureAttendance,
    getAttendanceSummaryController,
} from "../controllers/attendance.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";

const router = Router();

router.use(teacherProtect);

router.post("/", markLectureAttendance);
router.put("/:attendanceId", updateLectureAttendance);
router.get("/:classId/:subjectId", getLectureAttendance);
router.get("/:classId/:subjectId/summary", getAttendanceSummaryController);

export default router;
