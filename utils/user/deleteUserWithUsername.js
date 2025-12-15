import User from "../../models/User.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const deleteUserWithUsername = async (username) => {
    try {
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

        if (parseFloat(user.totalBalance) !== 0.0) {
            throw new AppError(
                errorMessages.BALANCE_NOT_SETTLED,
                400,
                errorCodes.USER_BALANCE_NOT_SETTLED
            );
        }

        await User.deleteOne({
            username: username
        });

        return true;

    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while deleting user with username',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}