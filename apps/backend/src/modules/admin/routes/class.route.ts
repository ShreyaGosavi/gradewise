import { Router } from "express";
import {
    addClass,
    getClasses,
    getClass,
    removeClass,
} from "../controllers/class.controller";
import { protect } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", addClass);
router.get("/", getClasses);
router.get("/:id", getClass);
router.delete("/:id", removeClass);

export default router;