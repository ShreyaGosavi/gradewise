import { Router } from "express";
import {
    createTeacher,
    getTeachers,
    getTeacher,
    removeTeacher,
} from "../controllers/teacher.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { addTeacherSchema } from "../../../shared/validators/admin.validators";

const router = Router();

router.use(protect);

router.post("/", validate(addTeacherSchema), createTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.delete("/:id", removeTeacher);

export default router;