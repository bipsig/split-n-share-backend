import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import { blacklistToken } from "../utils/auth/blacklistToken.js"
import { createToken } from "../utils/createToken.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { errorCodes } from "../utils/errors/errorCodes.js";
import { errorMessages } from "../utils/errors/errorMessages.js";
import { AppError } from "../utils/errors/appError.js";
import { sendSuccess } from "../utils/errors/responseHandler.js";

/**
 * Register a new user
 * @route POST /auth/register
 * @access Public 
 */
export const register = asyncErrorHandler(async (req, res, next) => {
    console.log (`Registering a user`);

    const userData = req.body;
    
    const existingUser = await User.findOne({
        $or: [
            { email: userData.email },
            { username: userData.username },
            ...( userData.mobileNumber ? [{ mobileNumber: userData.mobileNumber}] : [])
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
            errorCode = errorCodes.USER_USERNAME_EXISTS;errorMessage = errorMessages.USERNAME_ALREADY_EXISTS;
        }
        else if (existingUser.mobileNumber === userData.mobileNumber) {
            errorCode = errorCodes.USER_MOBILE_EXISTS;
            errorMessage = errorMessages.MOBILE_ALREADY_EXISTS;
        }

        return next(new AppError(errorMessage, 409, errorCode, true));
    }

    let newUser = new User(userData);

    // HASH PASSWORD
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 20;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    newUser.password = hashedPassword;

    const savedUser = await newUser.save();

    savedUser.password = undefined;

    console.log ('User registered successfully!')

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
    console.log (`Logging in a user`);

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
        return next(new AppError (
            errorMessages.USER_NOT_FOUND, 
            401, 
            errorCodes.USER_NOT_FOUND
        ));
    }

    if (!user.isActive) {
        return next(new AppError (
            'You account has been deactivated. Please contact support!', 
            401, 
            errorCodes.AUTH_UNAUTHORIZED
        ));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new AppError (
            errorMessages.INVALID_CREDENTIALS, 
            401, 
            errorCodes.AUTH_INVALID_CREDENTIALS
        ));
    }

    const accessToken = createToken (user);

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

/**
 * Logout an user
 * @route DELETE /auth/logout 
 * @access Public 
 */

export const logout = asyncErrorHandler(async (req, res, next) => {
    console.log ('Logging out an user');

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError (
            errorMessages.TOKEN_MISSING, 
            401, 
            errorCodes.AUTH_TOKEN_MISSING
        ));
    }

    const existingBlacklistEntry = await Blacklist.findOne({ token: token });

    if (existingBlacklistEntry) {
        return sendSuccess(res, 200, 'You are already logged out');
    }

    blacklistToken(token);

    sendSuccess(res, 200, errorMessages.LOGOUT_SUCCESS);
})

/**
 * 
 * @route DELETE /auth/cleanup
 * @access Private (Developer only) 
 */

export const cleanup = asyncErrorHandler(async (req, res, next) => {
    console.log ('Clearing the expired tokens');

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
            201,
            `Successfully reSuccessfully removed ${deletedCount} expired token${deletedCount > 1 ? 's' : ''} from the database.`,
            { deletedCount }
        );
    }
});