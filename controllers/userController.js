import User from "../models/User.js";
import jwt from "jsonwebtoken"
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

/**
 * Get logged in user details
 * @route GET /users/me 
 * @access Private
 */
export const getUserDetails = asyncErrorHandler(async (req, res, next) => {
    console.log ('Getting logged in user details');

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

/* CHECK WHETHER AN EMAIL IS AVAILABLE OR NOT */
export const isEmailUnique = async (req, res) => {
    console.log ('Checking whether email is unique or not');
    try {
        // console.log (req.query.email);
        if (await checkEmailExists(req.query.email)) {
            return res.status(200).json({
                message: 'Email is already in use!'
            });
        }
        else {
            return res.status(200).json({
                message: 'Email is not taken and is available for use!'
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

/* SEARCH FOR USERS BASED ON QUERY (username or email) */
export const searchUser  =async (req, res) => {
    console.log ('Searching for users...');
    try {
        const query = req.query.query;
        // console.log (query);

        if (!query || query.trim() == '') {
            return res.status(400).json({
                message: 'Query cannot be empty'
            });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i"}},
                { email: { $regex: query, $options: "i" }},
                { mobileNumber: { $regex: query, $options: "i" }}
            ]
        }).select('firstName lastName username email mobileNumber');

        // console.log (users);
        return res.status(200).json({
            count: users.length,
            users: users
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

/* UPDATE PASSWORD OF LOGGED IN USER */
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

/* RETRIEVE ACCESS TOKEN DETAILS */
export const getAccessToken = async (req, res) => {
    console.log ("Getting Access Token Details");
    try {
        return res.status(200).json({
            message: req.user
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

/* GET ALL USERS (DEVELOPER PRIVILEGES) */
export const getAllUsers = async (req, res) => {
    console.log ('Getting all registered users');
    try {
        const users = await User.find({});
        // console.log (users);
        return res.status(200).json({
            users
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export const deleteAllUsers = async (req, res) => {
    try {
        // console.log("Deleting all users");
        const result = await User.deleteMany({});
        console.log(`${result.deletedCount} user(s) deleted.`);
        res.status(200).json({
            message: `${result.deletedCount} user(s) deleted successfully.`
        });
    } 
    catch (err) {
        console.error('Error deleting users:', err);
    }
};