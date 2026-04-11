import { Response } from "express";
import { TeacherRequest } from "../../../shared/middleware/teacherAuth.middleware";
import { addMarks, updateMarks, getMarks } from "../services/marks.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { MarksType } from "@gradewise/db";

export const createMarks = async (req: TeacherRequest, res: Response) => {
    try {
        const { classId, subjectId, type, total, records } = req.body;

        if (!classId || !subjectId || !type || !total || !records)
            return errorResponse(res, "All fields are required", 400);

        if (!Array.isArray(records) || records.length === 0)
            return errorResponse(res, "Records must be a non-empty array", 400);

        const result = await addMarks(
            req.teacher!.id,
            Number(classId),
            Number(subjectId),
            type as MarksType,
            Number(total),
            records
        );

        return successResponse(res, result, "Marks added successfully", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const editMarks = async (req: TeacherRequest, res: Response) => {
    try {
        const { classId, subjectId, type, records } = req.body;

        if (!classId || !subjectId || !type || !records)
            return errorResponse(res, "All fields are required", 400);

        if (!Array.isArray(records) || records.length === 0)
            return errorResponse(res, "Records must be a non-empty array", 400);

        const result = await updateMarks(
            req.teacher!.id,
            Number(classId),
            Number(subjectId),
            type as MarksType,
            records
        );

        return successResponse(res, result, "Marks updated successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const viewMarks = async (req: TeacherRequest, res: Response) => {
    try {
        const { classId, subjectId } = req.params;

        const result = await getMarks(
            req.teacher!.id,
            Number(classId),
            Number(subjectId)
        );

        return successResponse(res, result, "Marks fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};