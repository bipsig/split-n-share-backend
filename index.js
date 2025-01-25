import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import User from "./models/User.js";
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { validateToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use (express.json());
app.use (morgan ('dev'));

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
        mongoose.set('autoIndex', true);
        const result = await User.syncIndexes();

        res.send("Indexes synced!" + result);
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Error creating user");
    }
});


app.use ('/auth', authRoutes);
app.use ('/user', userRoutes);

app.listen(port, () => {
    console.log(`Server running successfully on port number ${port}`);
});
