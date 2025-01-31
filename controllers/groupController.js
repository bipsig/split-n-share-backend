import Group from "../models/Group.js";
import User from "../models/User.js";
import { fetchGroupDetailsById } from "../utils/group/fetchGroupDetailsById.js";
import { fetchGroupsByUsername } from "../utils/group/fetchGroupsByUsername.js";

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

export const fetchGroups = async (req, res) => {
    console.log (`Fetching the groups the user '${req.user.username} belongs to...`);
    try {
        const groups = await fetchGroupsByUsername(req.user.username);
        // console.log(groups);

        res.status(200).json({
            groups
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export const fetchGroupDetails = async (req, res) => {
    console.log ('Fetching particular group details');
    try {
        const { groupId } = req.params;
        // console.log (groupId);

        const { username } = req.user;
        // console.log (username);

        const result = await User.find({
            username,
            groups: groupId
        });
        // console.log (result);

        if (result.length === 0) {
            return res.status(403).json({
                message: 'Access Denied! You are not a member of the group!'
            });
        }

        const group = await fetchGroupDetailsById (groupId);

        // console.log (group);

        return res.status(200).json({
            message: "Group fetched successfully",
            group
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}