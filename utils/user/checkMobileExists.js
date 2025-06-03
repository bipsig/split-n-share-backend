import User from "../../models/User.js";

export const checkMobileExists = async (mobile) => {
    try {
        const user = User.findOne({
            mobileNumber: mobile
        });

        return !!user;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while checking if mobile number exists',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}