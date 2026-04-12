import { Router } from "express";
import {
    addSubject,
    getSubjects,
    getSubject,
    removeSubject,
} from "../controllers/subject.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { addSubjectSchema } from "../../../shared/validators/admin.validators";

const router = Router();

router.use(protect);

router.post("/", validate(addSubjectSchema), addSubject);
router.get("/", getSubjects);
router.get("/:id", getSubject);
router.delete("/:id", removeSubject);

export default router;