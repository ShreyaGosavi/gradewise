import { Router } from "express";
import {
    createStudent,
    getStudents,
    getStudent,
    removeStudent,
} from "../controllers/student.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { addStudentSchema } from "../../../shared/validators/admin.validators";
import { upload } from "../../../shared/middleware/upload.middleware";
import { bulkCreateStudents } from "../controllers/bulkStudent.controller";

const router = Router();

router.use(protect);

router.post("/", validate(addStudentSchema), createStudent);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.delete("/:id", removeStudent);
router.post("/bulk", upload.single("file"), bulkCreateStudents);

export default router;