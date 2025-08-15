import User from "../models/User.js";
import { blacklistToken } from "../utils/auth/blacklistToken.js";
import { checkEmailExists } from "../utils/user/checkEmailExists.js";
import { deleteUserWithUsername } from "../utils/user/deleteUserWithUsername.js"
import { updateUserWithUsername } from "../utils/user/updateUserWithUsername.js";
import { updatePasswordWithUsername } from "../utils/user/updatePasswordWithUsername.js";
import { createToken } from "../utils/createToken.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { AppError } from "../utils/errors/appError.js";
import { errorMessages } from "../utils/errors/errorMessages.js";
import { errorCodes } from "../utils/errors/errorCodes.js";
import { sendSuccess } from "../utils/errors/responseHandler.js";
import { getUserSettlementDetails } from "../utils/user/getUserSettlementDetails.js";
import { getGroupsSummaryDetails } from "../utils/user/getGroupsSummaryDetails.js";
import { getRecentTransactionsSummary } from "../utils/user/getRecentTransactionsSummary.js";

/**
 * Get logged in user details
 * @route GET /users/me 
 * @access Private
 */
export const getUserDetails = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({
        username: req.user.username
    });

    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    user.password = undefined;

    sendSuccess(
        res,
        200,
        'User Details retrieved successfully!',
        { user }
    );
})

/**
 * Update details of a logged in user
 * @route PATCH users/me
 * @access Private
 */
export const updateDetails = asyncErrorHandler(async (req, res, next) => {
    console.log (`Updating details of user with username '${req.user.username}'`);

    const user = await updateUserWithUsername(req.body, req.user.username);
    await user.save();

    const newAccessToken = createToken(user);

    const authHeader = req.headers['authorization'];
    const oldAccessToken = authHeader && authHeader.split(' ')[1];
    
    if (oldAccessToken) {
        await blacklistToken(oldAccessToken);
    }

    user.password = undefined;

    sendSuccess(
        res,
        200,
        'User details updated successfully!',
        { 
            accessToken: newAccessToken,
            user 
        }
    );
})

/**
 * Check whether an email is available or not
 * @route GET users/is-email-unique?email
 * @access Public
 */
export const isEmailUnique = asyncErrorHandler(async (req, res, next) => {
    console.log ('Checking whether email is unique or not');

    const { email } = req.query;

    if (!email || !email.trim()) {
        return next (new AppError(
            'Email parameter is required',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }
    console.log (email.trim());
    const emailExists = await checkEmailExists(email.trim());

    if (emailExists) {
        sendSuccess(
            res,
            200,
            'Email is already in use',
            {
                available: false,
                email
            }
        );
    }
    else{
        sendSuccess(
            res,
            200,
            'Email is available for use',
            {
                available: true,
                email
            }
        );
    }
})

/**
 * Search for users based on some query parameter (username, email or mobile)
 * @route GET /users/search 
 * @access Private 
 */
export const searchUser = asyncErrorHandler(async (req, res, next) => {
    console.log ('Searching for users....');

    const { query } = req.query;

    if (!query || query.trim() === '') {
        return next(new AppError(
            'Search query cannot be empty',
            400,
            errorCodes.VALIDATION_REQUIRED_FIELD
        ));
    }

    const trimmedQuery = query.trim();

    const users = await User.find({
        $or: [
            { username: { $regex: trimmedQuery, $options: "i"}},
            { email: { $regex: trimmedQuery, $options: "i" }},
            { mobileNumber: { $regex: trimmedQuery, $options: "i" }}
        ],
        isActive: true
    }).select('firstName lastName username email mobileNumber');

    sendSuccess(
        res,
        200,
        `Found ${users.length} user(s) matching your query`,
        {
            count: users.length,
            users
        }
    );
})

/**
 * Update Password of Logged In User
 * @route  PATCH users/me/password
 * @access Private 
 */
export const updatePassword = asyncErrorHandler(async (req, res, next) => {
    console.log (`Updating password of user '${req.user.username}'`);

    const user = await updatePasswordWithUsername(req.body, req.user.username);
    await user.save();

    user.password = undefined;

    sendSuccess(
        res,
        200,
        'Password updated successfully!',
        { user }
    );
})

/**
 * Delete logged in user
 * @route DELETE users/me
 * @access Private
 */
export const deleteUser = asyncErrorHandler(async (req, res, next) => {
    console.log (`Deleting user with username ${req.user.username}`);

    await deleteUserWithUsername(req.user.username);

    const authHeader = req.headers["authorization"];
    const oldAccessToken = authHeader && authHeader.split (' ')[1];

    if (oldAccessToken) {
        await blacklistToken (oldAccessToken);
    }

    sendSuccess(
        res,
        200,
        'User deleted successfully!',
    );
})

/**
 * Retrieving access token details
 * @route users/token 
 * @access Private
 */
export const getAccessToken = asyncErrorHandler(async (req, res, next) => {
    sendSuccess(
        res,
        200,
        'Token details retrieved successfully!',
        {
            tokenPayload: req.user
        }
    );
})

/**
 * Get complete financial summary
 * @route users/financial-summary
 * @access Private
 */
export const getFinancialSummary = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({
        username: req.user.username
    });

    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    const data = await getUserSettlementDetails(user);

    let youGetBack = 0, youPay = 0;
    const youOwe = [], youAreOwed = [];

    for (let ele of data) {
        if (ele.type === 'you get back') {
            youGetBack += ele.amount;
            youAreOwed.push (ele);
        }
        else {
            youPay += ele.amount
            youOwe.push(ele);
        }
    }

    sendSuccess(
        res,
        200,
        "Fetched the financial summary",
        {
            youPay,
            youGetBack,
            balance: Math.abs(youGetBack - youPay),
            peopleYouOwe: {
                count: youOwe.length,
                data: youOwe
            },
            peopleWhoOweYou: {
                count: youAreOwed.length,
                data: youAreOwed
            }
        }
    );
})

/**
 * Get groups summary of a user
 * @route users/groups-summary
 * @access Private
 */
export const getGroupsSummary = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({
        username: req.user.username
    });

    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    const data = await getGroupsSummaryDetails(user);

    sendSuccess(
        res,
        200,
        "Fetched the groups summary",
        {
            count: data.length,
            data
        }
    );
})

/**
 * Get recent transactions of a user
 * @route /users/recent-transactions
 * @access Private
 */
export const getRecentTransactions = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({
        username: req.user.username
    });

    if (!user) {
        return next(new AppError(
            errorMessages.USER_NOT_FOUND,
            404,
            errorCodes.AUTH_USER_NOT_FOUND
        ));
    }

    const data = await getRecentTransactionsSummary (user);

    sendSuccess(
        res,
        200,
        "Fetched the groups summary",
        {
            count: data.length,
            data
        }
    );
})

/**
 * Get all Users
 * @route users/all 
 * @access Private (Developer only)
 */
export const getAllUsers = asyncErrorHandler(async (req, res, next) => {
    console.log ('Getting all registered users');
    const users = await User.find({}).select('-password');

    sendSuccess(
        res,
        200,
        `Retrieved ${users.length} users(s)`,
        {
            count: users.length,
            users
        }
    );
})

/**
 * Delete all Users
 * @route DELETE users/all 
 * @access Private (Developer only)
 */
export const deleteAllUsers = asyncErrorHandler(async (req, res, next) => {
    console.log ("Deleting all Users");

    const result = await User.deleteMany({});

    sendSuccess(
        res,
        200,
        `${result.deletedCount} user(s) deleted successfully!`,
        {
            deletedCount: result.deletedCount
        }
    );
})