import mongoose from "mongoose";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { fetchGroupDetailsById } from "../utils/group/fetchGroupDetailsById.js";
import { fetchGroupsByUsername } from "../utils/group/fetchGroupsByUsername.js";
import { fetchUserRole } from "../utils/group/fetchUserRole.js";
import { userInGroup } from "../utils/group/userInGroup.js";
import { addMemberToGroup } from "../utils/group/addMemberToGroup.js";
import { removeMemberFromGroup } from "../utils/group/removeMemberFromGroup.js";
import { generateGroupSlug } from "../utils/group/generateGroupSlug.js";
import { addMemberToTransactionMatrix } from "../utils/transactionMatrix/addMemberToTransactionMatrix.js";
import { fetchUsernameWithUserId } from "../utils/user/fetchUsernameWithUserId.js";
import { removeMemberFromTransactionMatrix } from "../utils/transactionMatrix/removeMemberFromTransactionMatrix.js";
import { AppError } from "../utils/errors/appError.js";
import { errorCodes } from "../utils/errors/errorCodes.js";
import { sendSuccess } from "../utils/errors/responseHandler.js";
import { errorMessages } from "../utils/errors/errorMessages.js";

/**
 * 
 * @route POST /groups 
 * @access Private
 */
export const createGroup = asyncErrorHandler(async (req, res, next) => {
    const { name, description, currency, category } = req.body;

    if (!name || !name.trim()) {
        return next(new AppError(
            'Group name us required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    const currentUser = await User.findOne({
        username: req.user.username
    });

    if (!currentUser) {
        return next (new AppError(
            'User not found',
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    const slug = generateGroupSlug(name);
    const username = req.user.username;

    const matrix = {};
        const innerMatrix = {};
        innerMatrix[username] = 0;
        matrix [username] = innerMatrix;

        const rowSum = {};
        rowSum[username] = 0;

        const colSum = {};
        colSum[username] = 0;

        const transactionMatrix = {
            matrix,
            rowSum, 
            colSum
        };

        const group = new Group ({
            name: name.trim(),
            slug,
            description: description.trim(),
            currency: currency || 'INR',
            category: category|| 'Other',
            createdBy: currentUser._id,
            members: [{
                user: currentUser._id,
                username: currentUser.username,
                role: 'Admin',
                joinedAt: Date.now()
            }],
            transactionMatrix
        });

        const savedGroup = await group.save();

        currentUser.groups.push({
            group: savedGroup._id,
            groupSlug: savedGroup.slug
        });
        await currentUser.save();

        sendSuccess(
            res,
            201,
            errorMessages.GROUP_CREATED_SUCCESS,
            { group: savedGroup }
        );
})

/* FETCHING ALL THE GROUPS USER IS A PART OF */
export const fetchGroups = async (req, res) => {
    console.log (`Fetching the groups the user '${req.user.username} belongs to...`);
    try {
        const groups = await fetchGroupsByUsername(req.user.username);
        // console.log(groups);

        res.status(200).json({
            groups
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* FETCHING DETAILS OF A PARTICULAR GROUP */
export const fetchGroupDetails = async (req, res) => {
    console.log ('Fetching particular group details');
    try {
        const { groupId } = req.params;
        // console.log (groupId);

        const { userId, username } = req.user;
        // console.log (username);
        
        const group = await fetchGroupDetailsById (groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        if (!userInGroup (userId, group)) {
            return res.status(403).json({
                message: 'Access Denied! You are not a member of the group!'
            });
        }


        // console.log (group);

        return res.status(200).json({
            message: "Group fetched successfully",
            group
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* ADDING MEMBERS TO A GROUP */
export const addMembersToGroup = async (req, res) => {
    console.log ("Adding members to group");
    try {
        const{ groupId } = req.params;
        const { userId, username } = req.user;
        const { newMembers } = req.body;
        
        /* 
        1. CHECK WHETHER USER BELONGS TO THE GROUP
        2. CHECK WHETHER USER IS AN ADMIN IN AN GROUP
        3. ADD THE MEMBERS TO THE members ARRAY OF THE GROUP
        4. ADD THE groupId TO THE groups ARRAY OF EVERY USER INDIVIDUALLY
        */
           
        const group = await fetchGroupDetailsById (groupId);

        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }
           
        if (!userInGroup (userId, group)) {
            return res.status(403).json({
               message: 'Access Denied! You are not a member of the group!'
            });
        }
            
        if (fetchUserRole (userId, group.members) !== 'Admin') {
            return res.status(403).json({
                message: 'Access Denied! You are not an admin of the group!'
            });
        }

        const responses = [];
        for (let newUsername of newMembers) {
            const response = await addMemberToGroup(newUsername, group);
            responses.push({
                username: newUsername,
                ...response
            });
        }

        const addedMembers = responses.filter((response) => response.success).map((response) => response.username);
        const failedMembers = responses.filter((response) => !response.success);

        for (let member of addedMembers) {
            // const memberUsername = await fetchUsernameWithUserId(member);
            // console.log(memberUsername);
            group.transactionMatrix = addMemberToTransactionMatrix(member, group.transactionMatrix);
        }

        console.log (group.transactionMatrix);
        group.markModified('transactionMatrix.matrix');
        group.markModified('transactionMatrix.rowSum');
        group.markModified('transactionMatrix.colSum');
        await group.save();

        return res.status(201).json({
            message: 'Members added successfully!',
            addedMembers,
            failedMembers
        });
        // console.log (addedMembers);
        // console.log (failedMembers);
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* REMOVING MEMBERS FROM A GROUP */
export const removeMembersFromGroup = async (req, res) => {
    console.log ('Removing members from a group');
    try {
        /* 
        1. CHECK WHETHER USER BELONGS TO THE GROUP
        2. CHECK WHETHER USER IS AN ADMIN IN AN GROUP
        3. REMOVE THE MEMBERS FROM THE members ARRAY OF THE GROUP
        4. REMOVE THE groupId FROM THE groups ARRAY OF EVERY USER INDIVIDUALLY
        */

        const{ groupId } = req.params;
        const { userId, username } = req.user;
        const { removeMembers } = req.body;

        const group = await fetchGroupDetailsById (groupId);

        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }
           
        if (!userInGroup (userId, group)) {
            return res.status(403).json({
               message: 'Access Denied! You are not a member of the group!'
            });
        }
            
        if (fetchUserRole (userId, group.members) !== 'Admin') {
            return res.status(403).json({
                message: 'Access Denied! You are not an admin of the group!'
            });
        }

        const responses = [];
        for (let user_name of removeMembers) {
            const response = await removeMemberFromGroup(user_name, group);
            // const response = await removeMemberFromGroup(userId, group);
            responses.push({
                username: user_name,
                // userId: userId,
                ...response
            });
        }

        // console.log (responses);
        const removedMembers = responses.filter((response) => response.success).map((response) => response.username);
        const failedMembers = responses.filter((response) => !response.success);

        for (let memberUsername of removedMembers) {
            // const memberUsername = await fetchUsernameWithUserId(member);
            // console.log(memberUsername);
            group.transactionMatrix = removeMemberFromTransactionMatrix(memberUsername, group.transactionMatrix);
        }

        console.log (group.transactionMatrix);
        group.markModified('transactionMatrix.matrix');
        group.markModified('transactionMatrix.rowSum');
        group.markModified('transactionMatrix.colSum');
        await group.save();
        
        return res.status(201).json({
            message: 'Members removed successfully!',
            removedMembers,
            failedMembers
        });

    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* DELETING A PARTICULAR GROUP */
export const deleteGroup = async (req, res) => {
    console.log ("Deleting group");
    try {
        /* CHECK IF USER IS AN ADMIN */

        /* CHECK IF THE GROUP IS SETTLED */

        /* DELETE GROUP FROM GROUPS COLLECTION */

        /* 
        DELETE THE groupId from GROUPS array OF EVERY MEMBER OF THE GROUP
        PROCESS CAN BE REMOVE EVERY MEMBER FROM THE GROUP (actual implementation ie call the function to do so)
        THEN DELETE THE GROUP 
        */


        const { groupId } = req.params;
        // console.log (groupId);

        const { userId, username } = req.user;

        const group = await fetchGroupDetailsById (groupId);

        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }
           
        if (!userInGroup (userId, group)) {
            return res.status(403).json({
               message: 'Access Denied! You are not a member of the group!'
            });
        }
            
        if (fetchUserRole (userId, group.members) !== 'Admin') {
            return res.status(403).json({
                message: 'Access Denied! You are not an admin of the group!'
            });
        }

        if (group.totalBalance !== 0) {
            return res.status(404).json({
                message: 'Group balances is not settled. Unable to delete group'
            });
        }

        for (let member of group.members) {
            await User.findByIdAndUpdate(member.user, {
                $pull: { groups: { group: group._id } }
            });
        }        

        await Group.findByIdAndDelete(groupId);

        return res.status(200).json({
            message: 'Group deleted successfully'
        });

    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export const deleteAllGroups = async (req, res) => {
    try {
        // console.log ("Deleting all groups");
        const result = await Group.deleteMany({});
        console.log(`${result.deletedCount} group(s) deleted.`);
        res.status(200).json({
            message: `${result.deletedCount} group(s) deleted successfully.`
        });
    } 
    catch (err) {
        console.error('Error deleting groups:', err);
        res.status(500).json({ message: 'Error deleting groups', error: err.message });
    }
};