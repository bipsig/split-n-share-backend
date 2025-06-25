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
    const { amount, user_paid, users_involved, groupId, description, type } = req.body;

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
    
    // console.log("Checking Logged In user");
    if (!userInGroup(req.user.userId, group)) {
        return next(new AppError(
            errorMessages.GROUP_ACCESS_DENIED,
            403,
            errorCodes.GROUP_ACCESS_DENIED
        ));
    }
    
    const userPaidId = await fetchUserIdWithUsername(user_paid);

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

    if (parseFloat(totalShare) !== 1.0) {
        return next(new AppError(
            'Total share of all users must equal 1.0',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    const slug = generateTransactionSlug(description);

    const transaction = new Transaction({
        user_added: { userId: req.user.userId, username: req.user.username },
        description,
        slug,
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
        transactionSlug: slug
    });

    group.transactionMatrix = addTransactionToTransactionMatrix(
        group.transactionMatrix, 
        user_paid, 
        finalUsers, 
        amount
    );

    for (let user of finalUsers) {
        const currentUser = await User.findById(user.user);
        currentUser.transactions.push({
            transaction: result._id,
            transactionSlug: slug
        });
        await currentUser.save();
    }

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

    console.log (group);

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

export const deleteAllTransactions1 = async (req, res) => {
    try {
        // console.log ("Deleting all groups");
        const result = await Transaction.deleteMany({});
        console.log(`${result.deletedCount} transaction(s) deleted.`);
        res.status(200).json({
            message: `${result.deletedCount} transaction(s) deleted successfully.`
        });
    }
    catch (err) {
        console.error('Error deleting transactions:', err);
        res.status(500).json({ message: 'Error deleting transactions', error: err.message });
    }
};