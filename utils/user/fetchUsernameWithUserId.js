import User from "../../models/User.js";
import { AppError } from "../errors/AppError.js";

export const fetchUsernameWithUserId = async (userId) => {
    try {
        const username = await User.findOne({
            _id: userId
        }).select ('username');

        return username ? username : null;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while trying to fetch username with userId',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        )
    }
}