import { Request, Response } from "express";
import { loginStudent, getStudentProfile } from "../services/auth.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { StudentRequest } from "../../../shared/middleware/studentAuth.middleware";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const data = await loginStudent(email, password);
        return successResponse(res, data, "Login successful");
    } catch (err: any) {
        return errorResponse(res, err.message, 401);
    }
};

export const getMe = async (req: StudentRequest, res: Response) => {
    try {
        const student = await getStudentProfile(req.student!.id);
        return successResponse(res, student, "Profile fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};