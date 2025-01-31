import jwt from "jsonwebtoken";

export const createToken = (user) => {
    try {
        if (!user) {
            throw new Error('User is undefined');
        }

        const payload = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            loginTime: new Date().toUTCString()
        };

         const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });

        return accessToken;
    }
    catch (err) {
        throw new Error('Unable to create new token: ', err.message);
    }
}