import Group from "../../models/Group.js";
import User from "../../models/User.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const fetchGroupsByUsername = async (username) => {
    try {
        if (!username || !username.trim()) {
            throw new AppError(
                errorMessages.USER_NOT_FOUND,
                404,
                errorCodes.AUTH_USER_NOT_FOUND
            );
        }

        const user = await User.findOne({ username: username.trim() }).populate({
            path: 'groups',
            options: { sort: { createdAt: -1 } }
        }).lean();

        if (!user) {
            throw new AppError(
                errorMessages.USER_NOT_FOUND,
                404,
                errorCodes.AUTH_USER_NOT_FOUND
            );
        }

        const updatedGroups = await Promise.all(
            user.groups.map(async (group) => {
                const extraGroupDetails = await Group.findById(group.group).select('name selectedIcon');
                return {
                    title: extraGroupDetails?.name || 'Unknown',
                    selectedIcon: extraGroupDetails?.selectedIcon || 'Other',
                    groupId: group.group,
                    groupSlug: group.groupSlug,
                };
            })
        );

        return updatedGroups;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            errorMessages.DATABASE_ERROR,
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}