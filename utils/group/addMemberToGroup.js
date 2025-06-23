import mongoose from "mongoose";
import User from "../../models/User.js";
import { fetchUsernameWithUserId } from "../user/fetchUsernameWithUserId.js";
import { fetchUserIdWithUsername } from "../user/fetchUserIdWithUsername.js";
import { errorCodes } from "../errors/errorCodes.js";

export const addMemberToGroup = async (username, group) => {
    try {
        const userId = await fetchUserIdWithUsername(username);

        if (!userId) {
            return {
                success: false,
                message: `User with username '${username}' doesn't exist in the database`
            }
        }

        const isAlreadyMember = group.members.some(member => member.username.toString() === username);
        if (isAlreadyMember) {
            return {
                success: false,
                message: `User with username '${username}' is already a member of the group`
            }
        }

        group.members.push({
            user: userId,
            username: username,
            role: 'Member',
            joinedAt: Date.now(),
            status: 'active'
        });

        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                groups: {
                    group: group._id,
                    groupSlug: group.slug
                }
            }
        });

        return {
            success: true,
            message: `User with username '${username}' successfully added to the group`
        };
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while adding member to group',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}