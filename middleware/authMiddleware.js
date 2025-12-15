import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { AppError } from "../utils/errors/AppError.js";
import { errorMessages } from "../utils/errors/errorMessages.js";
import { errorCodes } from "../utils/errors/errorCodes.js";

/**
 * Validate JWT Token Middleware
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */

export const validateToken = asyncErrorHandler(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError(
            errorMessages.TOKEN_MISSING,
            401,
            errorCodes.TOKEN_MISSING
        ));
    }

    const blacklistedToken = await Blacklist.find({
        token: token
    });

    if (blacklistedToken.length > 0) {
        return next(new AppError(
            errorMessages.TOKEN_BLACKLISTED,
            403,
            errorCodes.AUTH_TOKEN_BLACKLISTED
        ));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(
                errorMessages.TOKEN_EXPIRED, 
                401, 
                errorCodes.AUTH_TOKEN_EXPIRED
            ));
        } else if (err.name === 'JsonWebTokenError') {
            return next(new AppError(
                errorMessages.TOKEN_INVALID, 
                403, 
                errorCodes.AUTH_TOKEN_INVALID
            ));
        } else {
            return next(new AppError(
                errorMessages.TOKEN_INVALID, 
                403, 
                errorCodes.AUTH_TOKEN_INVALID
            ));
        }
    }
})


/**
 * Validate Developer API key Middleware
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */

export const validateDeveloper = (req, res, next) => {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
        return next(new AppError(
            'API Key is required for this operation!',
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    if (apiKey !== process.env.DEVELOPER_API_KEY) {
        return next(new AppError(
            errorMessages.ACCESS_FORBIDDEN,
            403,
            errorCodes.AUTH_ACCESS_FORBIDDEN
        ));
    }

    next();
}