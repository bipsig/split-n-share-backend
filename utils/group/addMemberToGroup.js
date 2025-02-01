import mongoose from "mongoose";
import User from "../../models/User.js";

export const addMemberToGroup = async (userId, group) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { 
                success: false, 
                message: `Invalid user ID: ${userId}`
            };
        }

        const isAlreadyMember = group.members.some(member => member.user.toString() === userId);
        if (isAlreadyMember) {
            return { 
                success: false,
                message: `User ${userId} is already a member of the group`
            }
        }

        group.members.push({
            user: userId,
            role: 'Member',
            joinedAt: Date.now(),
            status: 'active'
        });

        await User.findByIdAndUpdate(userId, {
            $addToSet: { groups: group._id}
        })

        return { 
            success: true,
            message: `User ${userId} successfully added to the group`
        };
    }
    catch (err) {
        return { success: false, message: `An error occurred while adding user ${userId} to the group` };
    }
}