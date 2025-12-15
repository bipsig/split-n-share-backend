import Group from "../../models/Group.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const getUserSettlementDetails = async (user) => {
  try {
    const username = user.username;
    const groups = user.groups;

    let data = new Map();

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

      const members = groupData.members.map((member) => {
        return {
          user: member.user,
          username: member.username
        }
      });

      for (let member of members) {
        if (member.username === username) {
          continue;
        }

        const youGetBack = currentTransactionMatrix.matrix[username][member.username] - currentTransactionMatrix.matrix[member.username][username];

        const newData = {
          username: member.username,
          userId: member.user,
          amount: youGetBack
        };

        if (data.has(member.username)) {
          const previousData = data.get(member.username);

          previousData.amount += youGetBack;

          data.set(member.username, previousData);
        }
        else {
          data.set (member.username, newData);
        }
      }
    }

    const result = [];

    data.forEach((value, key) => {
      // console.log (value);
      if (value.amount !== 0) {
        result.push({
          ...value,
          type: value.amount > 0 ? 'you get back' : 'you pay',
          amount: Math.abs(value.amount)
        });
      }
    });

    return result;
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