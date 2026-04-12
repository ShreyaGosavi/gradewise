import { Router } from "express";
import { calculateInternal } from "../controllers/internalMarks.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { calculateInternalSchema } from "../../../shared/validators/teacher.validators";

const router = Router();

router.use(teacherProtect);

router.post("/calculate", validate(calculateInternalSchema), calculateInternal);

export default router;