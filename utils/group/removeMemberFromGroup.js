import mongoose from "mongoose";
import User from "../../models/User.js";
import { fetchUserIdWithUsername } from "../user/fetchUserIdWithUsername.js";

export const removeMemberFromGroup = async (username, group) => {
    try {
        const userId = await fetchUserIdWithUsername(username);
        if (!userId) {
            return {
                success: false,
                message: `User with username '${username}' doesn't exist in the database`
            }
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return {
                success: false,
                message: `Invalid user ID: ${userId}`
            };
        }

        const index = group.members.findIndex((member) => member.username.toString() === username);

        if (index === -1) {
            return {
                success: false,
                message: `User with username '${username}' is not a member of the group`
            }
        }

        group.members.splice(index, 1);

        await User.findByIdAndUpdate(userId, {
            $pull: { groups: { group: group._id } }
        });


        return {
            success: true,
            message: `User with username '${userId}' removed from the group successfully!`
        };
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while removing member from group',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}