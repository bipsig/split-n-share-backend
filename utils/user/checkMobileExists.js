import User from "../../models/User.js";

export const checkMobileExists = async (mobile) => {
    try {
        const user = await User.findOne({ mobileNumber: mobile});
        // console.log (user);

        if (user) {
            // console.log ('Number exists');
            return true;
        }
        else {
            // console.log ('Number doesnt exist');
            return false;
        }
    }
    catch (err) {
        console.error('Error checking mobile existence:', err.message);
        throw new Error('Error checking mobile existence');
    }
}