import User from "../../models/User.js";

export const fetchGroupsByUsername = async (username) => {
    if (!username) {
        throw new Error ('Username field is empty');
    }

    const user = await User.findOne({ username }).populate({
        path: 'groups',
        // select: 'name description members',
        options: { sort: {createdAt: -1 }} 
    }).lean();

    if (!user) {
        throw new Error ("User not found!");
    }

    return user.groups;
}