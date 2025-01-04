import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = `mongodb+srv://${process.env.MONGODB_ATLAS_USERNAME}:${process.env.MONGODB_ATLAS_PASSWORD}@split-n-share.e8f54.mongodb.net/split-n-share?retryWrites=true&w=majority`;

const connectMongoDB = async () => {
    try {
        await mongoose.connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB Atlas using Mongoose");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

connectMongoDB();

app.get("/", async (req, res) => {
    try {
        const user1 = new User({
            firstName: "Sagnik",
            lastName: "Das",
            email: "sagnik1@email.com",
            password: "sagnik123",
            mobileNumber: "XXXXXXXXXX",
            location: "Pune",
            occupation: "Software Engineer",
            gender: "Male",
        });

        const result = await user1.save();
        console.log("User data pushed successfully");

        res.send("User created successfully!" + result);
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Error creating user");
    }
});

app.listen(port, () => {
    console.log(`Server running successfully on port number ${port}`);
});
