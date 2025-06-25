import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const deleteTrnasactionFromTransactionMatrix = (transactionMatrix, transaction) => {
    try {

        for (let user of transaction.users_involved) {

            const share = parseFloat(transaction.amount) * (parseFloat(user.share));
            transactionMatrix.matrix[transaction.user_paid.username][user.username] -= share;

            transactionMatrix.colSum[user.username] -= share;
        }

        transactionMatrix.rowSum[transaction.user_paid.username] -= transaction.amount;

        return transactionMatrix;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Server error while removing transaction from transaction matrix',
            500,
            errorCodes.SERVER_INTERNAL_ERROR
        );
    }
}