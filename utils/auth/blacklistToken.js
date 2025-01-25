import jwt from "jsonwebtoken"
import Blacklist from "../../models/Blacklist.js";

export const blacklistToken = async (token) => {
    try {
        const decodedToken = jwt.decode(token);
    
        const expiresAt = new Date(decodedToken.exp * 1000);
    
        const blacklistedToken = new Blacklist ({
            token: token,
            expiresAt: expiresAt
        });
    
        await blacklistedToken.save();
    }
    catch (err) {
        console.error('Error blacklisting the token:', err.message);
        throw new Error('Error blacklisting the token');
    }
}