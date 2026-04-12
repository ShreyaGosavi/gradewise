import { Router } from "express";
import {
    setClassTeacher,
    unsetClassTeacher,
    setSubjectTeacher,
    unsetSubjectTeacher,
    setStudentClass,
    unsetStudentClass,
} from "../controllers/assignment.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import {
    assignClassTeacherSchema,
    assignSubjectTeacherSchema,
    assignStudentClassSchema,
} from "../../../shared/validators/admin.validators";

const router = Router();

router.use(protect);

router.post("/class-teacher", validate(assignClassTeacherSchema), setClassTeacher);
router.delete("/class-teacher/:classId", unsetClassTeacher);
router.post("/subject-teacher", validate(assignSubjectTeacherSchema), setSubjectTeacher);
router.delete("/subject-teacher/:assignmentId", unsetSubjectTeacher);
router.post("/student-class", validate(assignStudentClassSchema), setStudentClass);
router.delete("/student-class/:studentId", unsetStudentClass);

export default router;