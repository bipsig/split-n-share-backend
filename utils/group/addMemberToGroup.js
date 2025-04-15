import mongoose from "mongoose";
import User from "../../models/User.js";
import { fetchUsernameWithUserId } from "../user/fetchUsernameWithUserId.js";

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

        const username = await fetchUsernameWithUserId (userId);
        if (!username) {
            return { 
                success: false,
                message: `User ${userId} doesn't exist in the database`
            }
        }

        group.members.push({
            user: userId,
            username: username,
            role: 'Member',
            joinedAt: Date.now(),
            status: 'active'
        });

        console.log (group._id + ": " + group.slug);
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
            message: `User ${userId} successfully added to the group`
        };
    }
    catch (err) {
        return { success: false, message: `An error occurred while adding user ${userId} to the group` };
    }
}