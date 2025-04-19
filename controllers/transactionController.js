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

/* CREATING A NEW TRANSACTION BY LOGGED IN USER */
export const createTransaction = async (req, res) => {
    console.log(`Creation of a new transaction by user ${req.user.username}`);
    try {
        console.log(req.body);
        console.log(req.user);
        /*
        VALDIATION CHECKS REQUIRED and FLOW OF THE CONTROLLER:
            1. Check whether logged in user belongs to the group or not.
            2. Validate whether groupId exists or not.  
            3. If group exists fetch the group.
            4. Validate user_paid => user exists and member of the group
            5. Validate users_involved => Loop through the array of users_involved and check whether each user is valid and member of group or not
            6. Share total should be equal to 1.
            
            If any of the validation checks fail, return error status code.

            7. Create transaction Document
            8. Add transaction details to that group (in the transaction array)
            9. Add transaction details to every user (in the transaction array)
        */


        const { amount, user_paid, users_involved, groupId, description } = req.body;
        // console.log (req.user.userId);
        // console.log (groupId);
        
        const group = await fetchGroupDetailsById(groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Invalid Group ID'
            });
        }
        
        if (!userInGroup(req.user.userId, group)) {
            return res.status(404).json({
                message: `Logged in user doesn't belong to this particular group`
            });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(404).json({
                message: 'Amount should be more than 0'
            });
        }

        // console.log (group);

        // const result = userInGroup(user_paid, group);
        // console.log (result);
        if (!userInGroup(user_paid, group)) {
            return res.status(404).json({
                message: `User paid doesn't belong to this particular group`
            });
        }
        const userPaidUsername = await fetchUsernameWithUserId(user_paid);
        // console.log ("Reached here");

        // console.log (users_involved);
        let totalShare = 0;
        let finalUsers = [];
        for (let user of users_involved) {
            console.log(user);
            if (!userInGroup(user.user, group)) {
                return res.status(404).json({
                    message: `User with userId ${user.user} doesn't belong to this group`
                });
            }
            totalShare += user.share;
            const username = await fetchUsernameWithUserId(user.user);
            finalUsers.push({
                user: user.user,
                username,
                share: user.share
            });
        }
        // console.log ("FInal Users: ");
        // console.log (finalUsers);

        if (parseFloat(totalShare) !== 1.0) {
            return res.status(404).json({
                message: `Total share of the transaction is not equal to 1.`
            });
        }

        // console.log ("Reached here");
        const slug = generateTransactionSlug(description);
        // console.log (slug);

        const transaction = new Transaction({
            user_added: { userId: req.user.userId, username: req.user.username },
            description,
            slug,
            amount,
            user_paid: { userId: user_paid, username: userPaidUsername },
            users_involved: finalUsers,
            groupId,
            groupSlug: group.slug
        });

        const result = await transaction.save();
        // console.log (result);

        // console.log (transaction);

        // console.log (group);
        group.transactions.push({
            transaction: result._id,
            transactionSlug: slug
        });
        // console.log (group);

        for (let user of finalUsers) {
            const currentUser = await User.findById(user.user);
            // console.log(currentUser);
            currentUser.transactions.push({
                transaction: result._id,
                transactionSlug: slug
            });
            // console.log(currentUser);

            await currentUser.save();
        }

        await group.save();

        return res.status(201).json({
            message: "New Transaction created successfully",
            result
        });

    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* FETCHING ALL TRANSACTIONS OF A PARTICULAR GROUP */
export const fetchTransactionsOfAGroup = async (req, res) => {
    console.log (`Fetching details of group with groupId ${req.params.groupId}`);
    try {
        const { groupId } = req.params;

        /*
            1. Check if group exists or not.
            2. Check if the logged in user is a member of the group or not
        */

        const group = await fetchGroupDetailsById(groupId);
        // console.log (group);

        if (!userInGroup(req.user.userId, group)) {
            return res.status(404).json({
                message: `Logged in user doesn't belong to this particular group`
            });
        }

        const transactions = group.transactions;
        res.status(200).json({
            transactions
        })
    }
    catch(err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* FETCHING DETAILS OF A PARTICULAR TRANSACTION */
export const fetchTransactionDetails = async (req, res) => {
    console.log (`Fetching details of a particular transaction`);
    try {
        const { transactionId } = req.params;
        // console.log (transactionId);

        const transaction = await fetchTransactionDetailsById (transactionId);
        // console.log (transaction);
        if (!transaction) {
            return res.status(404).json({
                message: 'Transaction not found'
            });
        }

        const group = await fetchGroupDetailsById (transaction.groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }
        // console.log (group);

        if (!userInGroup(req.user.userId, group)) {
            return res.status(404).json({
                message: `Logged in user doesn't belong to the group the transaction is part of. ACCESS DENIED`
            });
        }

        res.status(200).json({
            message: "Transaction details fetched successfully",
            transaction
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* DELETE A PARTICULAR TRANSACTION */
export const deleteTransaction = async (req, res) => {
    console.log ("Deleting a particular transaction");
    try {
        /*
            1. Check if transaction exists or not.
            2. Check the group the transaction is a part of
            3. Check if the logged in user is a member of the group or not
            4. Loop through the array of users in the transaction and delete the particular transaction from every user.
            5. Delete the transaction from the group document.
            6. Delete the transaction.
        */

            const { transactionId } = req.params;
    
            const transaction = await fetchTransactionDetailsById (transactionId);

            if (!transaction) {
                return res.status(404).json({
                    message: 'Transaction not found'
                });
            }
    
            const group = await fetchGroupDetailsById (transaction.groupId);
            if (!group) {
                return res.status(404).json({
                    message: 'Group not found'
                });
            }
    
            if (!userInGroup(req.user.userId, group)) {
                return res.status(404).json({
                    message: `Logged in user doesn't belong to the group the transaction is part of. ACCESS DENIED`
                });
            }
            
            // console.log (transaction.users_involved);
            const users = transaction.users_involved;
            await deleteTransactionFromUsers(transactionId, users);

            // console.log (group);
            group.transactions = group.transactions.filter((t) => {
                return t.transaction.toString() !== transactionId.toString();
            })
            // console.log (group);
            await group.save();

            await Transaction.findByIdAndDelete(transactionId);

            return res.status(200).json({
                message: 'Transaction deleted successfully'
            });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export const deleteAllTransactions = async (req, res) => {
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