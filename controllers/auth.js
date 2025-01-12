import bcrypt from "bcrypt";
import User from "../models/User.js";

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
}