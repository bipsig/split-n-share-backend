import User from "../../models/User.js";
import { AppError } from "../errors/appError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const userInGroup = (userId, group) => {
    try {
        if (!userId || !group) {
            throw new AppError(
                errorMessages.GROUP_NAME_REQUIRED,
                400,
                errorCodes.GROUP_NAME_REQUIRED
            )
        }

        const members = group.members;

        let tmp = members.filter((member) => {
            return member.user == userId
        });
        return tmp.length > 0;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Server error while updating user with username',
            500,
            errorCodes.SERVER_INTERNAL_ERROR
        );
    }
}