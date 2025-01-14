import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
    console.log (req.headers);
    const authHeader = req.headers["authorization"];
    console.log (authHeader);

    const token = authHeader && authHeader.split (' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = payload;
        next();
    })
};