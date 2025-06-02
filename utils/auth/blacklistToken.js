import jwt from "jsonwebtoken"
import Blacklist from "../../models/Blacklist.js";
import { errorCodes } from "../errors/errorCodes.js";

export const blacklistToken = async (token) => {
    try {
        const decodedToken = jwt.decode(token);

        if (!decodedToken || !decodedToken.exp) {
            throw new AppError(
                'Invalid token format', 
                400, 
                ERROR_CODES.AUTH_TOKEN_INVALID
            );
        }

        const expiresAt = new Date(decodedToken.exp * 1000);

        const blacklistedToken = new Blacklist ({
            token: token,
            expiresAt: expiresAt
        });
        
        await blacklistedToken.save()
    }
    catch(err) {
        if (err instanceof AppError) {
            throw err;
        }    
        
        throw new AppError (
            'Failed to logout. Please try again', 
            500,                 
            errorCodes.TOKEN_BLACKLIST_FAILED
        );
    }
}