import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const fetchUserRole = (userId, members) => {
    try {
        if (!userId) {
            throw new AppError(
                errorMessages.USER_NOT_FOUND,
                400,
                errorCodes.AUTH_USER_NOT_FOUND
            )
        }

        if (!members || members.length === 0) {
            throw new AppError(
                errorMessages.GROUP_MEMBERS_REQUIRED,
                400,
                errorCodes.GROUP_MEMBERS_REQUIRED
            )
        }

        const user = members.find((member) => {
            return String(member.user) === String(userId)
        });
        return user.role;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Server error while fetching user role',
            500,
            errorCodes.SERVER_INTERNAL_ERROR
        );
    }
}