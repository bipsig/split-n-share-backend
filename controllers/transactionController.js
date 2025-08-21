import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Group from "../models/Group.js";
import { fetchGroupDetailsById } from "../utils/group/fetchGroupDetailsById.js";
import { userInGroup } from "../utils/group/userInGroup.js";
import { generateTransactionSlug } from "../utils/transaction/generateTransactionSlug.js";
import { fetchUsernameWithUserId } from "../utils/user/fetchUsernameWithUserId.js";
import User from "../models/User.js";
import { fetchTransactionDetailsById } from "../utils/transaction/fetchTransactionDetailsById.js";
import { deleteTransactionFromUsers } from "../utils/transaction/deleteTransactionFromUsers.js";
import { addTransactionToTransactionMatrix } from "../utils/transactionMatrix/addTransactionToTransactionMatrix.js";
import { deleteTrnasactionFromTransactionMatrix } from "../utils/transactionMatrix/deleteTransactionFromTransactionMatrix.js";
import { fetchUserIdWithUsername } from "../utils/user/fetchUserIdWithUsername.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { AppError } from "../utils/errors/appError.js";
import { errorCodes } from "../utils/errors/errorCodes.js";
import { errorMessages } from "../utils/errors/errorMessages.js";
import { sendSuccess } from "../utils/errors/responseHandler.js";
import { deleteSingleTransaction } from "../utils/transaction/deleteSingleTransaction.js";

/**
 * Create a new transaction
 * @route POST /transactions 
 * @access Private
 */
export const createTransaction = asyncErrorHandler(async (req, res, next) => {
    const { amount, user_paid, users_involved, groupId, description, type, category } = req.body;

    if (!amount) {
        return next(new AppError(
            'Amount is required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    if (!user_paid) {
        return next(new AppError(
            'User Paid is required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    if (!users_involved) {
        return next(new AppError(
            'Users involved are required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    if (type === 'Payment' && users_involved.length > 1) {
        return next(new AppError(
            'For payment, user involved can be only 1',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    if (!groupId) {
        return next(new AppError(
            'Group details is required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    if (parseFloat(amount) <= 0) {
        return next(new AppError(
            'Amount must be greater than 0',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }


    const group = await fetchGroupDetailsById(groupId);
    if (!group) {
        return next(new AppError(
            errorMessages.GROUP_NOT_FOUND,
            404,
            errorCodes.GROUP_NOT_FOUND
        ));
    }

    // Checking validity of logged in user.
    if (!userInGroup(req.user.userId, group)) {
        return next(new AppError(
            errorMessages.GROUP_ACCESS_DENIED,
            403,
            errorCodes.GROUP_ACCESS_DENIED
        ));
    }

    const userPaidId = await fetchUserIdWithUsername(user_paid);

    // Checking validity of paid user
    if (!userInGroup(userPaidId, group)) {
        return next(new AppError(
            'The user who paid is not a member of this group',
            400,
            errorCodes.GROUP_INVALID_MEMBER
        ));
    }

    let totalShare = 0;
    let finalUsers = [];

    for (let user of users_involved) {
        const userId = await fetchUserIdWithUsername(user.user);
        if (!userInGroup(userId, group)) {
            return next(new AppError(
                `User ${user.user} is not a member of this group`,
                400,
                errorCodes.GROUP_INVALID_MEMBER
            ));
        }
        totalShare += user.share;
        finalUsers.push({
            user: userId,
            username: user.user,
            share: user.share
        });
    }

    if (parseFloat(totalShare) !== amount) {
        return next(new AppError(
            'Total share of all users must be equal to amount',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    const slug = generateTransactionSlug(description);

    const transaction = new Transaction({
        user_added: { userId: req.user.userId, username: req.user.username },
        description,
        slug,
        category,
        amount,
        user_paid: { userId: userPaidId, username: user_paid },
        users_involved: finalUsers,
        groupId,
        type,
        groupSlug: group.slug
    });

    const result = await transaction.save();

    group.transactions.push({
        transaction: result._id,
        transactionSlug: slug,
        type: type
    });

    group.transactionMatrix = addTransactionToTransactionMatrix(
        group.transactionMatrix,
        user_paid,
        finalUsers,
        amount
    );
    
    const userPaid = await User.findById(userPaidId);

    let isUserPaidInvolved = false;
    for (let user of finalUsers) {
        const currentUser = await User.findById(user.user);
        if (currentUser.username.toString() === userPaid.username) {
            isUserPaidInvolved = true;
        }
        currentUser.transactions.push({
            transaction: result._id,
            transactionSlug: slug,
            type: type
        });
        await currentUser.save();
    }

    if (!isUserPaidInvolved) {
        userPaid.transactions.push({
            transaction: result._id,
            transactionSlug: slug,
            type: type
        });
    }

    await userPaid.save();

    group.totalBalance += amount

    group.markModified('transactionMatrix.matrix');
    group.markModified('transactionMatrix.rowSum');
    group.markModified('transactionMatrix.colSum');
    await group.save();

    sendSuccess(
        res,
        201,
        'Transaction created successfully!',
        { transaction: result }
    );
})

/**
 * Get all transactions related to a particulare group
 * @route GET /transactions/groups/:groupId 
 * @access Private
 */
export const fetchTransactionsOfAGroup = asyncErrorHandler(async (req, res, next) => {
    const { groupId } = req.params;

    const group = await fetchGroupDetailsById(groupId);
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

    console.log(group);

    const transactions = group.transactions;

    sendSuccess(
        res,
        200,
        `Retrieved ${transactions.length} transaction(s) for the group`,
        {
            count: transactions.length,
            transactions
        }
    );
})

/**
 * Get details of a particular Transaction
 * @route GET /transactions/:transactionId 
 * @access Private
 */
export const fetchTransactionDetails = asyncErrorHandler(async (req, res, next) => {
    const { transactionId } = req.params;

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

    sendSuccess(
        res,
        200,
        'Transaction details retrieved successfully!',
        { transaction }
    );
})

/**
 * Delete a particular transaction
 * @route DELETE /transactions/:transactionId
 * @access Private
 */
export const deleteTransaction = asyncErrorHandler(async (req, res, next) => {
    const { transactionId } = req.params;

    await deleteSingleTransaction(req, transactionId);

    await Transaction.findByIdAndDelete(transactionId);

    sendSuccess(
        res,
        200,
        'Transaction deleted successfully!'
    );
})

/**
 * Delete all transactions
 * @route DELETE /transactions/all
 * @access Private (Deeloper only)
 */
export const deleteAllTransactions = asyncErrorHandler(async (req, res, next) => {
    const result = await Transaction.deleteMany({});

    sendSuccess(
        res,
        200,
        `${result.deletedCount} transaction(s) deleted successfully`
    );
})