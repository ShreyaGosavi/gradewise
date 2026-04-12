import { Response } from "express";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";
import {
    createClass,
    getAllClasses,
    getClassById,
    deleteClass,
} from "../services/class.service";
import { getPagination } from "../../../shared/utils/pagination";
import { successResponse, paginatedResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { Department, Year } from "@gradewise/db";

export const addClass = async (req: AuthRequest, res: Response) => {
    try {
        const { year, department, division } = req.body;

        const cls = await createClass(year, department, division);
        return successResponse(res, cls, "Class created successfully", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};



export const getClasses = async (req: AuthRequest, res: Response) => {
    try {
        const { year, department } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const { classes, total } = await getAllClasses(
            {
                year: year as Year | undefined,
                department: department as Department | undefined,
            },
            page,
            limit,
            skip
        );

        return paginatedResponse(res, classes, total, page, limit, "Classes fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getClass = async (req: AuthRequest, res: Response) => {
    try {
        const cls = await getClassById(Number(req.params.id));
        return successResponse(res, cls, "Class fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};

export const removeClass = async (req: AuthRequest, res: Response) => {
    try {
        const result = await deleteClass(Number(req.params.id));
        return successResponse(res, result, "Class deleted");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};