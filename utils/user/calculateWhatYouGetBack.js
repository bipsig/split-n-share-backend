import Group from "../../models/Group.js";

export const calculateWhatYouGetBack = async (user) => {
  try {
    const username = user.username;
    const groups = user.groups;

    let value = 0;

    for (let group of groups) {
      const groupData = await Group.findOne({
        _id: group.group
      });

      const currentTransactionMatrix = groupData.transactionMatrix;

      if (currentTransactionMatrix.colSum[username] < currentTransactionMatrix.rowSum[username]) {
        value += currentTransactionMatrix.rowSum[username] - currentTransactionMatrix.colSum[username];
      }
    }

    return value;
    
    // const userData = groups.map((group) => {
    //   const groupData = await Group.findOne({
    //     _id: group.group
    //   });
    // })
  }
  catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      'Database error while calculating what money you get back',
      500,
      errorCodes.DATABASE_OPERATION_ERROR
    );
  }
}