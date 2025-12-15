import User from "../../models/User.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const deleteTransactionFromUsers = async (tId, users) => {
    try {
        for (let user of users) {
            const userDetails = await User.findOne({
                username: user.username
            })

            if (!userDetails) {
                throw new AppError(
                    errorMessages.USER_NOT_FOUND,
                    404,
                    errorCodes.USER_NOT_FOUND
                );
            }

            userDetails.transactions = userDetails.transactions.filter((t) => {
                return t.transaction.toString() !== tId.toString()
            });
            await userDetails.save();
        }
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while deleting the transaction from the database',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}