import User from "../models/User.js";
import jwt from "jsonwebtoken"
import { blacklistToken } from "../utils/auth/blacklistToken.js";
import { checkEmailExists } from "../utils/user/checkEmailExists.js";
import { checkMobileExists } from "../utils/user/checkMobileExists.js";

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
        /* Details that can be updated in this function:
            -- firstName, lastName, location, occupation, gender
            -- email and mobileNumber => Check for uniqueness
        */

        // console.log (req.body);

        if (req.body.email && await checkEmailExists(req.body.email)) {
            console.log (req.body.email);
            return res.status(400).json({
                message: 'Email already in use.'
            });
        }

        if (req.body.mobileNumber && await checkMobileExists(req.body.mobileNumber)) {
            return res.status(400).json({
                message: 'Mobile Number already in use.'
            });
        }

        const user = await User.findOne({
            username: req.user.username
        });

        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.email) user.email = req.body.email;
        if (req.body.mobileNumber) user.mobileNumber = req.body.mobileNumber;
        if (req.body.location) user.location = req.body.location;
        if (req.body.occupation) user.occupation = req.body.occupation;
        if (req.body.gender) user.gender = req.body.gender;

        console.log (user);
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
            userDetails: req.user,
            accessToken: newAccessToken
        });
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