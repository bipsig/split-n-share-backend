import User from "../models/User.js";
import jwt from "jsonwebtoken"
import { blacklistToken } from "../utils/auth/blacklistToken.js";
import { checkEmailExists } from "../utils/user/checkEmailExists.js";
import { deleteUserWithUsername } from "../utils/user/deleteUserWithUsername.js"
import { updateUserWithUsername } from "../utils/user/updateUserWithUsername.js";
import { updatePasswordWithUsername } from "../utils/user/updatePasswordWithUsername.js";

/* GETTING LOGGED IN USER DETAILS */
export const getUserDetails = async (req, res) => {
    console.log ('Getting Logged in User Details');
    try {
        // console.log (req.user);
        const user = await User.findOne({
            username: req.user.username
        });
        // console.log (user);
        return res.status(200).json({
            ...user._doc
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

/* UPDATE DETAILS OF LOGGED IN USER */
export const updateDetails = async (req, res) => {
    console.log (`Updating details of user with username '${req.user.username}'`);
    try {
        const user = await updateUserWithUsername (req.body, req.user.username);
        await user.save();

        
        const newPayload = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            loginTime: new Date().toUTCString()
        };
        console.log (newPayload);
        
        const newAccessToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });
        
        const authHeader = req.headers["authorization"];
        const oldAccessToken = authHeader && authHeader.split (' ')[1];
        await blacklistToken (oldAccessToken);
        
        return res.status(201).json({
            userDetails: user,
            accessToken: newAccessToken
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

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

/* UPDATE PASSWORD OF LOGGED IN USER */
export const updatePassword = async (req, res) => {
    console.log (`Updating password of user '${req.user.username}'`);
    try {
        const user = await updatePasswordWithUsername(req.body, req.user.username);

        req.body.oldPassword = undefined;
        req.body.newPassword = undefined;

        await user.save();
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

/* DELETE LOGGED IN USER */
export const deleteUser = async (req, res) => {
    console.log (`Deleting user with username ${req.user.username}`);
    try {
        await deleteUserWithUsername (req.user.username)
        
        const authHeader = req.headers["authorization"];
        const oldAccessToken = authHeader && authHeader.split (' ')[1];
        await blacklistToken (oldAccessToken);
        
        return res.status(200).json({
            message: "User successfully deleted!"
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

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