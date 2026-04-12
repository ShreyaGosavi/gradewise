import { Response } from "express";
import { ChangePasswordRequest } from "../middleware/changePassword.middleware";
import { changePassword } from "../services/changePassword.service";
import { successResponse, errorResponse } from "../utils/apiResponse";

export const changePasswordController = async (
    req: ChangePasswordRequest,
    res: Response
) => {
    try {
        const { currentPassword, newPassword } = req.body;


        const result = await changePassword(
            req.user!.id,
            req.user!.role,
            currentPassword,
            newPassword
        );

        return successResponse(res, result, "Password changed successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};