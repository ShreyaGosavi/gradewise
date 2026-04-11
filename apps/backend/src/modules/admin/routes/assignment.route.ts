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

const router = Router();

router.use(protect);

// class teacher
router.post("/class-teacher", setClassTeacher);
router.delete("/class-teacher/:classId", unsetClassTeacher);

// subject teacher
router.post("/subject-teacher", setSubjectTeacher);
router.delete("/subject-teacher/:assignmentId", unsetSubjectTeacher);

// student class
router.post("/student-class", setStudentClass);
router.delete("/student-class/:studentId", unsetStudentClass);

export default router;