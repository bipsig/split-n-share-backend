import Transaction from "../../models/Transaction.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";
import { fetchGroupNameByGroupId } from "../group/fetchGroupNameByGroupId.js";

export const fetchTransactionDetailsById = async (tId) => {
    try {
        const transaction = await Transaction.findOne({
            _id: tId
        });

        if (!transaction) {
            throw new AppError(
                errorMessages.TRANSACTION_NOT_FOUND,
                404,
                errorCodes.TRANSACTION_NOT_FOUND
            );
        }

        const groupTitle = await fetchGroupNameByGroupId(transaction.groupId);

        const transactionObj = transaction.toObject();

        transactionObj.groupTitle = groupTitle.name;

        return transactionObj;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while fetching transaction details by id',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}