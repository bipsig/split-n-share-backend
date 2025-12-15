import jwt from "jsonwebtoken";
import { AppError } from "./errors/AppError.js";
import { errorCodes } from "./errors/errorCodes.js";

export const createToken = (user) => {
    try {
        if (!user) {
            throw new AppError (
                'User data is required to create new token', 
                400, 
                errorCodes.TOKEN_CREATION_FAILED
            );
        }

        const payload = {
            userId: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            loginTime: new Date().toISOString()
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT || '24h',
                issuer: 'split-n-share',
                audience: 'split-n-share-users'
            }
        );

        return accessToken;
    }
    catch(err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError (
            'Failed to create access token', 
            500, 
            errorCodes.TOKEN_CREATION_FAILED
        );
    }
}