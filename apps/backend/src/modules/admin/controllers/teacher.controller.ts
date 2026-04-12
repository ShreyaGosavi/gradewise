import { Response } from "express";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";
import {
    addTeacher,
    getAllTeachers,
    getTeacherById,
    deleteTeacher,
} from "../services/teacher.service";
import { getPagination } from "../../../shared/utils/pagination";
import { successResponse ,paginatedResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { Department } from "@gradewise/db";

export const createTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email } = req.body;

        const teacher = await addTeacher(name, email);
        return successResponse(res, teacher, "Teacher added successfully", 201);
    } catch (err: any) {
        // handle known errors with 400, unknown with 500
        const status = err.message.includes("already exists") ? 400 : 500;
        return errorResponse(res, err.message, status);
    }
};



export const getTeachers = async (req: AuthRequest, res: Response) => {
    try {
        const { department } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const { teachers, total } = await getAllTeachers(
            { department: department as Department | undefined },
            page,
            limit,
            skip
        );

        return paginatedResponse(res, teachers, total, page, limit, "Teachers fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const teacher = await getTeacherById(Number(req.params.id));
        return successResponse(res, teacher, "Teacher fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};

export const removeTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const result = await deleteTeacher(Number(req.params.id));
        return successResponse(res, result, "Teacher deleted");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};