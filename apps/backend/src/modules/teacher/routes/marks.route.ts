import { Router } from "express";
import { createMarks, editMarks, viewMarks } from "../controllers/marks.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import {
    addMarksSchema,
    updateMarksSchema,
} from "../../../shared/validators/teacher.validators";

const router = Router();

router.use(teacherProtect);

router.post("/", validate(addMarksSchema), createMarks);
router.put("/", validate(updateMarksSchema), editMarks);
router.get("/:classId/:subjectId", viewMarks);

export default router;