import User from "../models/User.js";

/* GETTING LOGGED IN USER DETAILS */
export const getUserDetails = async (req, res) => {
    console.log ('Getting Logged in User Details');
    try {
        // console.log (req.user);
        const user = await User.findOne({
            username: req.user.username
        });
        // console.log (user);
        res.status(200).json({
            ...user._doc
        });
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}