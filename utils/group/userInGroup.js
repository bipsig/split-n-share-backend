import User from "../../models/User.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const userInGroup = (userId, group) => {
    try {
        if (!userId) {
            return false;
        }

        if (!group) {
            throw new AppError(
                errorMessages.GROUP_NAME_REQUIRED,
                400,
                errorCodes.GROUP_NAME_REQUIRED
            )
        }

        const members = group.members;

        let tmp = members.filter((member) => {
            return member.user.toString() === userId.toString();
        });
        return tmp.length > 0;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        console.error (err.message);
        throw new AppError(
            'Server error while checking whether user is in group',
            500,
            errorCodes.SERVER_INTERNAL_ERROR
        );
    }
}