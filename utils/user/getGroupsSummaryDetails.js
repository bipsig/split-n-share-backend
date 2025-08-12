import Group from "../../models/Group.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const getGroupsSummaryDetails = async (user) => {
  try {
    const username = user.username;
    const groups = user.groups;

    const data = [];

    const groupsDoc = await (Promise.all(
      groups.map((group) => {
        return Group.findOne({_id: group.group}).lean();
      })
    ));

    for (let groupData of groupsDoc) {
      if (!groupData) {
        continue;
      }

      const currentTransactionMatrix = groupData.transactionMatrix;

      const groupBalance = currentTransactionMatrix.rowSum[username] - currentTransactionMatrix.colSum[username];

      data.push ({
        groupId: groupData._id,
        name: groupData.name,
        members: groupData.members,
        groupSlug: groupData.slug,
        groupBalance,
        type: groupBalance > 0 ? 'you are owed' : 'you owe'
      });
    }

    return data;
  }
  catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      'Database error while getting user settlement details',
      500,
      errorCodes.DATABASE_OPERATION_ERROR
    );
  }
}