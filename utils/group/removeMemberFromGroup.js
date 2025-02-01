import mongoose from "mongoose";
import User from "../../models/User.js";

export const removeMemberFromGroup = async (userId, group) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { 
                success: false, 
                message: `Invalid user ID: ${userId}`
            };
        }

        const index = group.members.findIndex((member) => member.user.toString() === userId);

        if (index === -1) {
            return { 
                success: false,
                message: `User ${userId} is not a member of the group`
            }
        }

        group.members.splice (index, 1);

        await User.findByIdAndUpdate(userId, {
            $pull: { groups: group._id }
        });

        return {
            success: true,
            message: `User ${userId} removed from the group successfully!`
        };
    }
    catch (err) {
        return { success: false, message: `An error occurred while removing user ${userId} from the group` };
    }
}