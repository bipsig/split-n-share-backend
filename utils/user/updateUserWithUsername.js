import User from "../../models/User.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";
import { checkEmailExists } from "./checkEmailExists.js";
import { checkMobileExists } from "./checkMobileExists.js";

export const updateUserWithUsername = async (body, username) => {
    try {
        const user = await User.findOne({
            username: username
        });

        if (!user) {
            throw new AppError(
                errorMessages.USER_NOT_FOUND,
                404,
                errorCodes.AUTH_USER_NOT_FOUND
            );
        }

        if (body.email &&  body.email !== user.email) {
            const emailExists = await checkEmailExists(body.email);
            if (emailExists) {
                throw new AppError(
                    errorMessages.EMAIL_ALREADY_EXISTS,
                    409,
                    errorCodes.USER_EMAIL_EXISTS
                );
            }
        }

        if (body.mobileNumber && body.mobileNumber !== user.mobileNumber) {
            const mobileExists = await checkMobileExists(body.mobileNumber);
            if (mobileExists) {
                throw new AppError(
                    errorMessages.MOBILE_ALREADY_EXISTS,
                    409,
                    errorCodes.USER_MOBILE_EXISTS
                );
            }
        }

        const allowedUpdates = ['firstName', 'lastName', 'location', 'occupation', 'gender', 'email', 'mobileNumber'];

        allowedUpdates.forEach(field => {
            if (body [field] !== undefined) {
                user [field] = body [field];
            }
        });

        return user;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while updating user with username',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}