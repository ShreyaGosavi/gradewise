import { Response } from "express";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";
import {
    createSubject,
    getAllSubjects,
    getSubjectById,
    deleteSubject,
} from "../services/subject.service";
import { getPagination } from "../../../shared/utils/pagination";
import { successResponse, paginatedResponse, errorResponse } from "../../../shared/utils/apiResponse";

export const addSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;

        const subject = await createSubject(name);
        return successResponse(res, subject, "Subject created successfully", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};



export const getSubjects = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { subjects, total } = await getAllSubjects(page, limit, skip);
        return paginatedResponse(res, subjects, total, page, limit, "Subjects fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getSubject = async (req: AuthRequest, res: Response) => {
    try {
        const subject = await getSubjectById(Number(req.params.id));
        return successResponse(res, subject, "Subject fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};

export const removeSubject = async (req: AuthRequest, res: Response) => {
    try {
        const result = await deleteSubject(Number(req.params.id));
        return successResponse(res, result, "Subject deleted");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};