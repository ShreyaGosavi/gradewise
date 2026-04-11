import { Router } from "express";
import { createMarks, editMarks, viewMarks } from "../controllers/marks.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";

const router = Router();

router.use(teacherProtect);

router.post("/", createMarks);
router.put("/", editMarks);
router.get("/:classId/:subjectId", viewMarks);

export default router;