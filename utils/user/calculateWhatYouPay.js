import Group from "../../models/Group.js";

export const calculateWhatYouPay = async (user) => {
  try {
    const username = user.username;
    const groups = user.groups;

    let value = 0;

    for (let group of groups) {
      const groupData = await Group.findOne({
        _id: group.group
      });

      const currentTransactionMatrix = groupData.transactionMatrix;

      if (currentTransactionMatrix.colSum[username] > currentTransactionMatrix.rowSum[username]) {
        value += currentTransactionMatrix.colSum[username] - currentTransactionMatrix.rowSum[username];
      }
    }

    return value;
  }
  catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      'Database error while calculating what money you have to pay',
      500,
      errorCodes.DATABASE_OPERATION_ERROR
    );
  }
}