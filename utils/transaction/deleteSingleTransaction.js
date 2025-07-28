import { AppError } from "../errors/appError.js"
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";
import { fetchGroupDetailsById } from "../group/fetchGroupDetailsById.js";
import { userInGroup } from "../group/userInGroup.js";
import { deleteTrnasactionFromTransactionMatrix } from "../transactionMatrix/deleteTransactionFromTransactionMatrix.js";
import { deleteTransactionFromUsers } from "./deleteTransactionFromUsers.js";
import { fetchTransactionDetailsById } from "./fetchTransactionDetailsById.js";

export const deleteSingleTransaction = async (req, transactionId) => {
    try {
        const transaction = await fetchTransactionDetailsById(transactionId);
        if (!transaction) {
            return next(new AppError(
                'Transaction not found',
                404,
                errorCodes.TRANSACTION_NOT_FOUND
            ));
        }

        const group = await fetchGroupDetailsById(transaction.groupId);
        if (!group) {
            return next(new AppError(
                errorMessages.GROUP_NOT_FOUND,
                404,
                errorCodes.GROUP_NOT_FOUND
            ));
        }
        if (!userInGroup(req.user.userId, group)) {
            return next(new AppError(
                errorMessages.GROUP_ACCESS_DENIED,
                403,
                errorCodes.GROUP_ACCESS_DENIED
            ));
        }

        const users = transaction.users_involved;
        await deleteTransactionFromUsers(transactionId, users);

        group.transactions = group.transactions.filter((t) => {
            return t.transaction.toString() !== transactionId.toString();
        });

        group.transactionMatrix = deleteTrnasactionFromTransactionMatrix(
            group.transactionMatrix,
            transaction
        );

        group.markModified('transactionMatrix.matrix');
        group.markModified('transactionMatrix.rowSum');
        group.markModified('transactionMatrix.colSum');
        await group.save();
        
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        console.error(err.message);
        throw new AppError(
            'Database error while deleting single transaction',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}