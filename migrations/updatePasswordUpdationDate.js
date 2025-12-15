import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const runMigration = async () => {
    try {
        // Connect to database

        const mongo_uri = `mongodb+srv://${process.env.MONGODB_ATLAS_USERNAME}:${process.env.MONGODB_ATLAS_PASSWORD}@split-n-share.e8f54.mongodb.net/split-n-share?retryWrites=true&w=majority`;

        await mongoose.connect(mongo_uri);
        // console.log("Connected to MongoDB");

        // Find users without passwordUpdationDate
        const users = await User.find({ 
            passwordUpdationDate: { $exists: false } 
        });
        
        // console.log(`Found ${users.length} users to update`);

        // Update each user
        for (const user of users) {
            user.passwordUpdationDate = user.createdAt;
            await user.save();
            // console.log(`Updated user: ${user.username}`);
        }

        // console.log("Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

runMigration();