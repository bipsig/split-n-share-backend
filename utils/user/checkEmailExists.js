import User from "../../models/User.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const checkEmailExists = async (email) => {
    try {
        const user = User.findOne({
            email: email
        });

        return !!user;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while checking if email exists',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}