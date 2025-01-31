import Group from "../../models/Group.js";

export const fetchGroupDetailsById = async (groupId) => {
    try {
        const group = await Group.findOne({
            _id: groupId
        });

        if (!group) {
            throw new Error ("Group doesn't exist!");
        }

        return group;
    }
    catch (err) {
        console.error('Error fetching group details by ID:', err.message);
        throw new Error(err.message);
    }
}