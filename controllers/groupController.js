import Group from "../models/Group.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
    console.log (`Creation of group being performed by user ${req.user.username}`);
    try {
        // console.log (req.body);
        const { name, description, currency, category } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Group name is required'
            });
        }

        const currentUser = await User.findOne ({
            username: req.user.username
        });

        const group = new Group ({
            name,
            description,
            currency: currency || 'INR',
            category: category|| 'Other',
            createdBy: currentUser._id,
            members: [{
                user: currentUser._id,
                role: 'Admin',
                joinedAt: Date.now()
            }]
        });

        // console.log (group);
        const savedGroup = await group.save();

        currentUser.groups.push(savedGroup._id);

        await currentUser.save();

        return res.status(201).json({
            message: "New Group created successfully",
            savedGroup
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}