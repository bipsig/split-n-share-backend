import User from "../../models/User.js";

export const checkEmailExists = async (email) => {
    try {
        // console.log ('In util', email);
        const user = await User.findOne({ email: email });
        // console.log (user);

        if (user) {
            // console.log ('Email exists');
            return true;
        }
        else {
            // console.log ('Email doesnt exist');
            return false;
        }
    }
    catch (err) {
        console.error('Error checking email existence:', err.message);
        throw new Error('Error checking email existence');
    }
}