import { Router } from "express";
import {
    createStudent,
    getStudents,
    getStudent,
    removeStudent,
} from "../controllers/student.controller";
import { protect } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.delete("/:id", removeStudent);

export default router;