import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const addTransactionToTransactionMatrix = (transactionMatrix, user_paid, users_involved, amount) => {
    try {
        for (let user of users_involved) {
            const share = (parseFloat(user.share));
            transactionMatrix.matrix[user_paid][user.username] += share;

            transactionMatrix.colSum[user.username] += share;
        }

        transactionMatrix.rowSum[user_paid] += amount;

        return transactionMatrix;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Server error while adding transaction to transaction matrix',
            500,
            errorCodes.SERVER_INTERNAL_ERROR
        );
    }
}