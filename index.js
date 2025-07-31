import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import axios from "axios";
import cors from "cors";
import User from "./models/User.js";
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import { validateToken } from "./middleware/authMiddleware.js";
import users from "./data/users.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use (express.json());
app.use (morgan ('dev'));
app.use (cors());

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

app.get(`/api/${process.env.VERSION}/sync`, async (req, res) => {
    try {
        console.log ("HERE");
        mongoose.set('autoIndex', true);
        const result = await User.syncIndexes();

        res.send("Indexes synced!" + result);
    }
    catch (error) {
        // console.error("Error saving user:", error);
        res.status(500).send("Error syncing indices");
    }
});

app.post(`/api/${process.env.VERSION}`, async (req, res) => {
    try {
        const userData = users;

        await User.deleteMany();

        for (let user of userData) {
            // console.log (user);
            const result = await axios.post (`${process.env.BASE_URL}${process.env.VERSION}auth/register`, user);
        }

        // await User.insertMany(userData);
        console.log('User data imported successfully!');

        res.status(201).json({ message: 'User data imported successfully!'})
    } catch (error) {
        // console.error("Error saving user:", error);
        res.status(500).send("Error creating user");
    }
});


app.use ('/api/v1/auth', authRoutes);
app.use ('/api/v1/users', userRoutes);
app.use ('/api/v1/groups', groupRoutes);
app.use ('/api/v1/transactions', transactionRoutes);

app.listen(port, () => {
    console.log(`Server running successfully on port number ${port}`);
});

app.use (globalErrorHandler);