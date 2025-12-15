import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import crypto from "crypto";
import { blacklistToken } from "../utils/auth/blacklistToken.js"
import { createToken } from "../utils/createToken.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { errorCodes } from "../utils/errors/errorCodes.js";
import { errorMessages } from "../utils/errors/errorMessages.js";
import { AppError } from "../utils/errors/AppError.js";
import { sendSuccess } from "../utils/errors/responseHandler.js";

/**
 * Register a new user
 * @route POST /auth/register
 * @access Public 
 */
export const register = asyncErrorHandler(async (req, res, next) => {
    const userData = req.body;

    const existingUser = await User.findOne({
        $or: [
            { email: userData.email },
            { username: userData.username },
            ...(userData.mobileNumber ? [{ mobileNumber: userData.mobileNumber }] : [])
        ]
    });

    if (existingUser) {
        let errorMessage = '';
        let errorCode = '';

        if (existingUser.email === userData.email) {
            errorCode = errorCodes.USER_ALREADY_EXISTS;
            errorMessage = errorMessages.EMAIL_ALREADY_EXISTS;
        }
        else if (existingUser.username === userData.username) {
            errorCode = errorCodes.USER_USERNAME_EXISTS; errorMessage = errorMessages.USERNAME_ALREADY_EXISTS;
        }
        else if (existingUser.mobileNumber === userData.mobileNumber) {
            errorCode = errorCodes.USER_MOBILE_EXISTS;
            errorMessage = errorMessages.MOBILE_ALREADY_EXISTS;
        }

        return next(new AppError(
            errorMessage,
            409,
            errorCode,
        ));
    }

    let newUser = new User(userData);

    // HASH PASSWORD
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 20;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    newUser.password = hashedPassword;

    const savedUser = await newUser.save();

    savedUser.password = undefined;

    // console.log('User registered successfully!')

    sendSuccess(
        res,
        201,
        errorMessages.REGISTRATION_SUCCESS,
        {
            user: {
                id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                username: savedUser.username,
                email: savedUser.email,
                createdAt: savedUser.createdAt
            }
        }
    )
});

/**
 * Login an existing user
 * @route POST /auth/login 
 * @access Public 
 */

export const login = asyncErrorHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new AppError(
            'Username and password are required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    const user = await User.findOne({ username: username });


    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            401,
            errorCodes.USER_NOT_FOUND
        ));
    }

    if (!user.isActive) {
        return next(new AppError(
            'You account has been deactivated. Please contact support!',
            401,
            errorCodes.AUTH_UNAUTHORIZED
        ));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new AppError(
            errorMessages.INVALID_CREDENTIALS,
            401,
            errorCodes.AUTH_INVALID_CREDENTIALS
        ));
    }

    const accessToken = createToken(user);

    sendSuccess(
        res,
        200,
        errorMessages.LOGIN_SUCCESS,
        {
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                totalBalance: user.totalBalance
            }
        }
    );
})

export const identifyUser = asyncErrorHandler(async (req, res, next) => {
    const { username, gender, dateOfBirth, birthCity } = req.body;

    if (!username || !gender || !dateOfBirth || !birthCity) {
        return next(new AppError(
            'All fields are required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    const user = await User.findOne({ username });
    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    const dbDate = new Date(user.dateOfBirth).toISOString().slice(0, 10);
    const inputDate = new Date(dateOfBirth).toISOString().slice(0, 10);

    const cityMatch = user.birthCity?.toLowerCase() === birthCity.toLowerCase();

    if (user.gender !== gender || dbDate !== inputDate || !cityMatch) {
        return next(new AppError(
            'Provided information does not match our records',
            401,
            errorCodes.AUTH_UNAUTHORIZED
        ));
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    sendSuccess(
        res,
        200,
        "User verified successfully. Use the reset token to change your password.",
        {
            resetToken,
        }
    );
});

export const resetPassword = asyncErrorHandler(async (req, res, next) => {
    const { username, newPassword, resetToken } = req.body;

    if (!username || !newPassword || !resetToken) {
        return next(new AppError(
            'Username, new password, and reset token are required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    const user = await User.findOne({ username });
    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    // Hash incoming token for comparison
    const hashedIncomingToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Validate token & expiry
    if (
        user.resetPasswordToken !== hashedIncomingToken ||
        !user.resetPasswordTokenExpiry ||
        user.resetPasswordTokenExpiry < Date.now()
    ) {
        return next(new AppError(
            'Invalid or expired reset token',
            401,
            errorCodes.AUTH_UNAUTHORIZED
        ));
    }

    // Hash new password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 20;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.passwordUpdationDate = Date.now();

    // Remove reset token + expiry
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    const savedUser = await user.save();
    savedUser.password = undefined;

    sendSuccess(
        res,
        200,
        "Password reset successfully!",
        {
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                createdAt: savedUser.createdAt
            }
        }
    );
});

/**
 * Logout an user
 * @route DELETE /auth/logout 
 * @access Public 
 */

export const logout = asyncErrorHandler(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError(
            errorMessages.TOKEN_MISSING,
            401,
            errorCodes.AUTH_TOKEN_MISSING
        ));
    }

    const existingBlacklistEntry = await Blacklist.findOne({ token: token });

    if (existingBlacklistEntry) {
        return sendSuccess(
            res,
            200,
            'You are already logged out'
        );
    }

    await blacklistToken(token);

    sendSuccess(
        res,
        200,
        errorMessages.LOGOUT_SUCCESS
    );
})

/**
 * 
 * @route DELETE /auth/cleanup
 * @access Private (Developer only) 
 */

export const cleanup = asyncErrorHandler(async (req, res, next) => {
    const currentDate = new Date();

    const result = await Blacklist.deleteMany({
        expiresAt: { $lt: currentDate }
    });

    const deletedCount = parseInt(result.deletedCount);

    if (deletedCount === 0) {
        sendSuccess(
            res,
            200,
            'No expired tokens found in the database'
        );
    }
    else {
        sendSuccess(
            res,
            200,
            `Successfully removed ${deletedCount} expired token${deletedCount > 1 ? 's' : ''} from the database.`,
            { deletedCount }
        );
    }
});