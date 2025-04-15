import User from "../../models/User.js";

export const fetchUsernameWithUserId = async (userId) => {
    try {
        const username = await User.findOne ({ _id: userId }).select('username');

        if (username) {
            return username.username;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.error('Error fetching Username from given userId', err.message);
        throw new Error('Error fetching Username from given userId');
    }
}