import Transaction from "../../models/Transaction.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { fetchGroupNameByGroupId } from "../group/fetchGroupNameByGroupId.js";

export const getRecentTransactionsSummary = async (user) => {
  try {
    const transactions = user.transactions;

    const data = [];

    const transactionDocs = await (Promise.all(
      transactions.map((transaction) => {
        return Transaction.findOne({_id: transaction.transaction}).lean();
      })
    ));

    for (let transactionData of transactionDocs) {
      if (!transactionData) {
        continue;
      }

      const groupName = await fetchGroupNameByGroupId (transactionData.groupId);

      console.log(transactionData);

      data.push ({
        transactionId: transactionData._id,
        transactionSlug: transactionData.slug,
        title: transactionData.description,
        groupName,
        userPaid: transactionData.user_paid.username,
        amount: transactionData.amount,
        category: transactionData.category,
        type: transactionData.type,
        creationTime: transactionData.createdAt
      });
    }

    return data.reverse();
  }
  catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      
      console.error (err);
      throw new AppError(
        'Database error while getting recent transactions',
        500,
        errorCodes.DATABASE_OPERATION_ERROR
      );
    }
}