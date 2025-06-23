import { errorCodes } from "../errors/errorCodes.js";

export const addMemberToTransactionMatrix = (username, transactionMatrix) => {
    try {
        let newInner = {};
        for (const rowKey in transactionMatrix.matrix) {

            transactionMatrix.matrix[rowKey][username] = 0;

            newInner[rowKey] = 0;

        }

        newInner[username] = 0;

        transactionMatrix.matrix[username] = newInner;

        transactionMatrix.rowSum[username] = 0;
        transactionMatrix.colSum[username] = 0;

        return transactionMatrix;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Server error while adding member to transaction matrix',
            500,
            errorCodes.SERVER_INTERNAL_ERROR
        );
    }
}