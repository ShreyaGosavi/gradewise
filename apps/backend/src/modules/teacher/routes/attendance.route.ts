import { Router } from "express";
import {
    markLectureAttendance,
    updateLectureAttendance,
    getLectureAttendance,
    getAttendanceSummaryController,
} from "../controllers/attendance.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import {
    markAttendanceSchema,
    updateAttendanceSchema,
} from "../../../shared/validators/teacher.validators";

const router = Router();

router.use(teacherProtect);

router.post("/", validate(markAttendanceSchema), markLectureAttendance);
router.put("/:attendanceId", validate(updateAttendanceSchema), updateLectureAttendance);
router.get("/:classId/:subjectId/summary", getAttendanceSummaryController);
router.get("/:classId/:subjectId", getLectureAttendance);

export default router;