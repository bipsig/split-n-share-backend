import mongoose from "mongoose";
import Group from "../models/Group.js";
import User from "../models/User.js";
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

/* CREATING A NEW GROUP BY LOGGED IN USER */
export const createGroup = async (req, res) => {
    console.log (`Creation of group being performed by user ${req.user.username}`);
    try {
        // console.log (req.body);
        const { name, description, currency, category } = req.body;

        // Validation Check if name is missing from the body
        if (!name) {
            return res.status(400).json({
                message: 'Group name is required'
            });
        }

        // Find the current user model from the database (logged in user)
        const currentUser = await User.findOne ({
            username: req.user.username
        });

        const slug = generateGroupSlug(name);

        const username = req.user.username;
        const matrix = {};
        const innerMatrix = {};
        innerMatrix[username] = 0;
        matrix [username] = innerMatrix;

        // console.log (matrix);

        const rowSum = {};
        rowSum[username] = 0;

        const colSum = {};
        colSum[username] = 0;

        const transactionMatrix = {
            matrix,
            rowSum, 
            colSum
        };


        // Creation of Group Model
        const group = new Group ({
            name,
            slug,
            description,
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

        // console.log (group);
        const savedGroup = await group.save();
        
        // Pushing the group ID to the groups array of the current user
        currentUser.groups.push({
            group: savedGroup._id,
            groupSlug: savedGroup.slug
        });
        await currentUser.save();


        return res.status(201).json({
            message: "New Group created successfully",
            savedGroup
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

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
        for (let newUserId of newMembers) {
            const response = await addMemberToGroup(newUserId, group);
            responses.push({
                userId: newUserId,
                ...response
            });
        }

        // console.log (responses);
        // console.log (group);

        const addedMembers = responses.filter((response) => response.success).map((response) => response.userId);
        const failedMembers = responses.filter((response) => !response.success);

        for (let member of addedMembers) {
            const memberUsername = await fetchUsernameWithUserId(member);
            // console.log(memberUsername);
            group.transactionMatrix = addMemberToTransactionMatrix(memberUsername, group.transactionMatrix);
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
        for (let userId of removeMembers) {
            const response = await removeMemberFromGroup(userId, group);
            responses.push({
                userId: userId,
                ...response
            });
        }

        // console.log (responses);
        const removedMembers = responses.filter((response) => response.success).map((response) => response.userId);
        const failedMembers = responses.filter((response) => !response.success);

        for (let member of removedMembers) {
            const memberUsername = await fetchUsernameWithUserId(member);
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