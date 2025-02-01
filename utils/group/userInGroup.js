import User from "../../models/User.js";

export const userInGroup = (userId, group) => {
    try {
        if (!userId || !group) {
            throw new Error('UserId and group is necessary!');
        }
        const members = group.members;

        let tmp = members.filter ((member) => {
            return member.user == userId
        });

        // console.log (tmp);
        return tmp.length > 0;
        
    }
    catch (err) {
        throw new Error ('Unable to check whether user is in the group: ', err.message);
    }
}