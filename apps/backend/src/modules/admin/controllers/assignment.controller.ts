import { Response } from "express";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";
import {
    assignClassTeacher,
    removeClassTeacher,
    assignSubjectTeacher,
    removeSubjectTeacher,
    assignStudentToClass,
    removeStudentFromClass,
} from "../services/assignment.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";

// ─── Class Teacher ───────────────────────────────────────

export const setClassTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { classId, teacherId } = req.body;


        const result = await assignClassTeacher(Number(classId), Number(teacherId));
        return successResponse(res, result, "Class teacher assigned successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const unsetClassTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { classId } = req.params;
        const result = await removeClassTeacher(Number(classId));
        return successResponse(res, result, "Class teacher removed successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

// ─── Subject Teacher ─────────────────────────────────────

export const setSubjectTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { classId, subjectId, teacherId } = req.body;

        const result = await assignSubjectTeacher(
            Number(classId),
            Number(subjectId),
            Number(teacherId)
        );
        return successResponse(res, result, "Subject teacher assigned successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const unsetSubjectTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const result = await removeSubjectTeacher(Number(assignmentId));
        return successResponse(res, result, "Subject teacher removed successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

// ─── Student Class ────────────────────────────────────────

export const setStudentClass = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, classId } = req.body;

        const result = await assignStudentToClass(Number(studentId), Number(classId));
        return successResponse(res, result, "Student assigned to class successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const unsetStudentClass = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;
        const result = await removeStudentFromClass(Number(studentId));
        return successResponse(res, result, "Student removed from class successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};