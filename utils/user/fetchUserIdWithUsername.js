import User from "../../models/User.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const fetchUserIdWithUsername = async (username) => {
    try {
        const userId = await User.findOne({
            username: username
        }).select('_id');

        return userId ? userId : null;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while trying to fetch UserId with username',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}