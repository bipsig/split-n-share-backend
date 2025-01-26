import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Group name is required'],
            minlength: [3, 'Group name should have atlease 3 characters'],
            maxlength: [50, 'Group name should have less than 50 characters']
        },
        description: {
            type: String,
            default: ''
        },
        picturePath: {
            type: String,
            default: ''
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        members: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User',
                required: true 
            }
        ],
        
    },
    {
        timestamps: true
    }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;