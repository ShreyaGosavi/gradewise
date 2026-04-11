import { Router } from "express";
import {
    addSubject,
    getSubjects,
    getSubject,
    removeSubject,
} from "../controllers/subject.controller";
import { protect } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", addSubject);
router.get("/", getSubjects);
router.get("/:id", getSubject);
router.delete("/:id", removeSubject);

export default router;