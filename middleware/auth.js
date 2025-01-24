import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";

export const validateToken = async (req, res, next) => {
    try {
        console.log (req.headers);
        const authHeader = req.headers["authorization"];
        console.log (authHeader);
    
        const token = authHeader && authHeader.split (' ')[1];
    
        if (!token) {
            return res.status(401).json({
                message: 'No token available'
            });
        }
    
        const result = await Blacklist.find({ token: token });
        // console.log ('Result = ', result, result.length);
        if (result.length > 0) {
            res.status(403).json({
                message: 'Blacklisted Token'
            })
        }
    
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(403).json({
                    message: 'Invalid Token'
                });
            }
            req.user = payload;
            next();
        })
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
};

export const validateDeveloper = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    // console.log (apiKey);

    if (!apiKey || apiKey !== process.env.DEVELOPER_API_KEY) {
        return res.status(403).json({
            message: 'Access Forbidden! Invalid or Missing API Key'
        })
    }

    next();
}