import { Request, Response } from "express";
import { loginTeacher, getTeacherProfile } from "../services/auth.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { TeacherRequest } from "../../../shared/middleware/teacherAuth.middleware";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;


        const data = await loginTeacher(email, password);
        return successResponse(res, data, "Login successful");
    } catch (err: any) {
        return errorResponse(res, err.message, 401);
    }
};

export const getMe = async (req: TeacherRequest, res: Response) => {
    try {
        const teacher = await getTeacherProfile(req.teacher!.id);
        return successResponse(res, teacher, "Profile fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};