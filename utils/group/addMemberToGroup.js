import mongoose from "mongoose";
import User from "../../models/User.js";
import { fetchUsernameWithUserId } from "../user/fetchUsernameWithUserId.js";
import { fetchUserIdWithUsername } from "../user/fetchUserIdWithUsername.js";

export const addMemberToGroup = async (username, group) => {
    try {
        console.log("IN Function");
        const userId = await fetchUserIdWithUsername (username);
        console.log ("Username: " + username + " UserID: " + userId);
        if (!userId) {
            // console.log ("FAILED with invalid username" + username);
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
        console.log (group.members);

        // console.log (group._id + ": " + group.slug);
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
        return { success: false, message: `An error occurred while adding user with username '${userId}' to the group` };
    }
}