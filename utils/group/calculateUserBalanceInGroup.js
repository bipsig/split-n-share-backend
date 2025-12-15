import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const calculateUserBalanceInGroup = (group, username) => {
  try {
    const transactionMatrix = group.transactionMatrix;

    return transactionMatrix.rowSum[username] - transactionMatrix.colSum[username];
  }
  catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      'Database error while getting user balance in group',
      500,
      errorCodes.DATABASE_OPERATION_ERROR
    );
  }
}