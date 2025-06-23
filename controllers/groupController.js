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
 * Create a new group
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
        return next(new AppError(
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
    matrix[username] = innerMatrix;

    const rowSum = {};
    rowSum[username] = 0;

    const colSum = {};
    colSum[username] = 0;

    const transactionMatrix = {
        matrix,
        rowSum,
        colSum
    };

    const group = new Group({
        name: name.trim(),
        slug,
        description: description.trim(),
        currency: currency || 'INR',
        category: category || 'Other',
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

/**
 * Fetch all groups user is a part of.
 * @route GET /groups 
 * @access Private
 */
export const fetchGroups = asyncErrorHandler(async (req, res, next) => {
    const groups = await fetchGroupsByUsername(req.user.username);

    sendSuccess(
        res,
        200,
        `Retrieved ${groups.length} group(s) successfully!`,
        {
            count: groups.length,
            groups
        }
    );
})

/**
 * Fetch Details of a Particular Group
 * @route GET /groups/:groupId
 * @access Private
 */
export const fetchGroupDetails = asyncErrorHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new AppError(
            'Invalid group ID format',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    const group = await fetchGroupDetailsById(groupId);
    if (!group) {
        return next(new AppError(
            'Group not found',
            404,
            errorCodes.GROUP_NOT_FOUND
        ));
    }

    if (!userInGroup(userId, group)) {
        return next(new AppError(
            'Access denied! You are not a member of this group',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    sendSuccess(
        res,
        200,
        'Group details retrieved successfully!',
        { group }
    );
})

/**
 * Add Members to a group
 * @route POST /groups/:groupId/members 
 * @access Private
 */
export const addMembersToGroup = asyncErrorHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { userId } = req.user;
    const { newMembers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new AppError(
            'Invalid group ID format',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    if (!newMembers || !Array.isArray(newMembers) || newMembers.length === 0) {
        return next(new AppError(
            'New members array is required and cannot be empty',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
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

    if (!userInGroup(userId, group)) {
        return next(new AppError(
            'Access denied! You are not a member of this group',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    if (fetchUserRole(userId, group.members) !== 'Admin') {
        return next(new AppError(
            'Access denied! Only group admins can add members',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
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
        group.transactionMatrix = addMemberToTransactionMatrix(member, group.transactionMatrix);
    }

    group.markModified('transactionMatrix.matrix');
    group.markModified('transactionMatrix.rowSum');
    group.markModified('transactionMatrix.colSum');
    await group.save();

    sendSuccess(
        res,
        201,
        `Successfully added ${addedMembers.length} member(s) to the group!`,
        {
            addedMembers,
            failedMembers,
            addedCount: addedMembers.length,
            failedCount: failedMembers.length
        }
    );
})

/**
 * 
 * @route DELETE /groups/:groupId/members 
 * @param {*} res 
 * @returns 
 */
export const removeMembersFromGroup = asyncErrorHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { userId } = req.user;
    const { removeMembers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new AppError(
            'Invalid group ID format',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    if (!removeMembers || !Array.isArray(removeMembers) || removeMembers.length === 0) {
        return next(new AppError(
            'Remove members array is required and cannot be empty',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    const group = await fetchGroupDetailsById(groupId);

    if (!group) {
        return next(new AppError(
            'Group not found',
            404,
            errorCodes.GROUP_NOT_FOUND
        ));
    }

    if (!userInGroup(userId, group)) {
        return next(new AppError(
            'Access denied! You are not a member of this group',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    if (fetchUserRole(userId, group.members) !== 'Admin') {
        return next(new AppError(
            'Access denied! Only group admins can remove members',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    const responses = [];
    for (let user_name of removeMembers) {
        const response = await removeMemberFromGroup(user_name, group);
        responses.push({
            username: user_name,
            ...response
        });
    }

    const removedMembers = responses.filter((response) => response.success).map((response) => response.username);
    const failedMembers = responses.filter((response) => !response.success);

    for (let memberUsername of removedMembers) {
        group.transactionMatrix = removeMemberFromTransactionMatrix(memberUsername, group.transactionMatrix);
    }

    group.markModified('transactionMatrix.matrix');
    group.markModified('transactionMatrix.rowSum');
    group.markModified('transactionMatrix.colSum');
    await group.save();

    sendSuccess(
        res,
        200,
        `Successfully removed ${removedMembers.length} member(s) from the group!`,
        {
            removedMembers,
            failedMembers,
            removedCount: removedMembers.length,
            failedCount: failedMembers.length
        }
    );
})

/**
 * Delete a group
 * @route DELETE /groups/:groupId 
 * @access Private
 */
export const deleteGroup = asyncErrorHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new AppError(
            'Invalid group ID format',
            400,
            errorCodes.VALIDATION_INVALID_FORMAT
        ));
    }

    const group = await fetchGroupDetailsById(groupId);

    if (!group) {
        return next(new AppError(
            'Group not found',
            404,
            errorCodes.GROUP_NOT_FOUND
        ));
    }

    if (!userInGroup(userId, group)) {
        return next(new AppError(
            'Access denied! You are not a member of this group',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    if (fetchUserRole(userId, group.members) !== 'Admin') {
        return next(new AppError(
            'Access denied! Only group admins can delete the group',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    if (group.totalBalance !== 0) {
        return next(new AppError(
            'Cannot delete group with unsettled balances. Please settle all balances first',
            400,
            errorCodes.GROUP_BALANCE_NOT_SETTLED
        ));
    }

    for (let member of group.members) {
        await User.findByIdAndUpdate(member.user, {
            $pull: { groups: { group: group._id } }
        });
    }

    await Group.findByIdAndDelete(groupId);

    sendSuccess(
        res,
        200,
        'Group deleted successfully!'
    );
})

/**
 * Delete all groups (developer only)
 * @route DELETE /groups/all 
 * @access Private (Developer only)
 */
export const deleteAllGroups = asyncErrorHandler(async (req, res, next) => {
    const result = await Group.deleteMany({});

    sendSuccess(
        res,
        200,
        `${result.deletedCount} group(s) deleted successfully!`,
        { deletedCount: result.deletedCount }
    );
})

export const deleteAllGroups1 = async (req, res) => {
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