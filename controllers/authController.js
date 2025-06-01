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

/* LOGGING IN A USER */
export const login = async (req, res) => {
    console.log ('Logging in a User');
    try {
        const { username, password } = req.body;
        // console.log (username, password);

        const user = await User.findOne({username: username });
        // console.log (user);

        if (!user) {
            return res.status(401).json({
                message: "Username not found!"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        // console.log (isMatch);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials!"
            }); 
        }

        const accessToken = createToken (user);
        
        user.password = undefined;

        return res.status(200).json({
            accessToken: accessToken
        });
        
    }
    catch (err) {
        console.log ('Unable to log in the user!');
        res.status(500).json({
            error: err.message
        });
    }
}

/* LOGGING OUT A USER */
export const logout = async (req, res) => {
    console.log ("Logging out the User");
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split (' ')[1];
    
        if (!token) {
            return res.status(401).json({
                message: 'No token available'
            });
        }

        const result = await Blacklist.find({
            token: token
        });

        console.log (result);

        if (result.length > 0) {
            return res.status(200).json({
                message: 'Token already added to Blacklist'
            })
        }

        // const decodedToken = jwt.decode(token);
        // // console.log (decodedToken);
        // const expiresAt = new Date(decodedToken.exp * 1000)
    
        // const blacklistedToken = new Blacklist ({
        //     token: token,
        //     expiresAt: expiresAt
        // });
        // // console.log (blacklistedToken);
        // await blacklistedToken.save();

        blacklistToken(token);

        res.status(201).json({
            message: "User logged out successfully!"
        });
    }
    catch (err) {
        console.log ('Unable to logout the User');
        res.status(500).json( {
            error: err.message
        })
    }
}

/* CLEANING the Database to remove the expired tokens */
export const cleanup = async (req, res) => {
    console.log ('Clearing the expired tokens');
    try {
        const currentDate = new Date();
        // console.log (currentDate);

        const result = await Blacklist.deleteMany({
            expiresAt: {$lt: currentDate}
        });

        // console.log (result);
        if (parseInt(result.deletedCount) === 0) {
            res.status(200).json({
                message: 'No expired tokens in the database'
            });
        }
        else {
            res.status(200).json({
                message: `${result.deletedCount} expired tokens deleted from the database`
            })
        }
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}