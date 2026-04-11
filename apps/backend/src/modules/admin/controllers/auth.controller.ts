import { Request, Response } from "express";
import { loginAdmin, getAdminById } from "../services/auth.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return errorResponse(res, "Email and password required", 400);

        const data = await loginAdmin(email, password);
        return successResponse(res, data, "Login successful");
    } catch (err: any) {
        return errorResponse(res, err.message, 401);
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const admin = await getAdminById(req.admin!.id);
        return successResponse(res, admin, "Admin fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};