import mongoose from "mongoose";

const BlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    },
},
{
    timestamps: true
});

const Blacklist = mongoose.model('Blacklist', BlacklistSchema);

export default Blacklist;