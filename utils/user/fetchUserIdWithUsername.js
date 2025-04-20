import User from "../../models/User.js";

export const fetchUserIdWithUsername = async (username) => {
    try {
        // console.log (username);
        const userId = await User.findOne ({ username: username }).select('_id');

        if (userId) {
            return userId._id;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.error('Error fetching UserID from given username', err.message);
        throw new Error('Error fetching UserID from given username');
    }
}

fetchUserIdWithUsername("sagnik");