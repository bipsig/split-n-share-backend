import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";

/* REGISTERING A USER */
export const register = async (req, res) => {
    console.log ('Registering a User');
    try {
        let newUser = new User(req.body);

        const userPassword = newUser.password;
        
        let genPassword = await bcrypt.hash (userPassword, parseInt(process.env.SALT_ROUNDS));
        newUser.password = genPassword;

        const savedUser = await newUser.save();
        console.log ('User Registered SUccessfully');
        res.status(201).json(savedUser);
    }
    catch (err) {
        console.log ('Unable to register user!');
        res.status(500).json({
            error: err.message
        });
    }
};

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

        const payload = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            loginTime: new Date().toUTCString()
        };
        console.log (payload);

        user.password = undefined;

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });

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
    try {
        console.log ("Logging out the User");
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split (' ')[1];
    
        if (!token) {
            return res.status(401).json({
                message: 'No token available'
            });
        }

        const decodedToken = jwt.decode(token);
        // console.log (decodedToken);
        const expiresAt = new Date(decodedToken.exp * 1000)
    
        const blacklistedToken = new Blacklist ({
            token: token,
            expiresAt: expiresAt
        });
        // console.log (blacklistedToken);
        await blacklistedToken.save();

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