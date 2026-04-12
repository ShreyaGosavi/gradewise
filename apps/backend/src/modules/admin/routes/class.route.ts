import { Router } from "express";
import {
    addClass,
    getClasses,
    getClass,
    removeClass,
} from "../controllers/class.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { addClassSchema } from "../../../shared/validators/admin.validators";

const router = Router();

router.use(protect);

router.post("/", validate(addClassSchema), addClass);
router.get("/", getClasses);
router.get("/:id", getClass);
router.delete("/:id", removeClass);

export default router;