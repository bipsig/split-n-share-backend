import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const updatePasswordWithUsername = async (body, username) => {
    try {
        if (!body.oldPassword || !body.newPassword) {
            throw new AppError(
                'Both current and new password are required',
                400,
                errorCodes.VALIDATION_REQUIRED_FIELD
            );
        }

        if (body.oldPassword === body.newPassword) {
            throw new AppError(
                'New password must be different from old password',
                400,
                errorCodes.VALIDATION_INVALID_FORMAT
            );
        }

        const user = await User.findOne({
            username: username
        });

        if (!user) {
            throw new AppError(
                errorMessages.USER_NOT_FOUND,
                404,
                errorCodes.AUTH_USER_NOT_FOUND
            );
        }

        const oldPassword = body.oldPassword;
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            throw new AppError(
                'Current password is incorrect',
                400,
                errorCodes.AUTH_INVALID_CREDENTIALS
            );
        }

        const newPassword = body.newPassword;
        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 20;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;

        return user;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while updating password with username',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}