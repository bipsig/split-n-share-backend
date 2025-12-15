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
import activityRoutes from './routes/activityRoutes.js'
import { validateToken } from "./middleware/authMiddleware.js";
import users from "./data/users.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use (express.json());
app.use (morgan ('dev'));
app.use (cors());

// Browser Cache Disabled so that API calls are made everytime
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");   // no caching at all
  res.setHeader("Pragma", "no-cache");          // for HTTP/1.0 compatibility
  res.setHeader("Expires", "0");
  next();
});

const port = process.env.PORT || 3000;

const dbName = 
    process.env.NODE_ENV === 'development' 
    ? 'split-n-share-' 
    : process.env.NODE_ENV === 'production'
    ? 'split-n-share-prod'
    : 'split-n-share';

const mongo_uri = `mongodb+srv://${process.env.MONGODB_ATLAS_USERNAME}:${process.env.MONGODB_ATLAS_PASSWORD}@split-n-share.e8f54.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log (`Connected to MongoDB Atlas → Database: ${conn.connection.name}`)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

connectMongoDB();

app.get(`/api/${process.env.VERSION}health`, async (req, res) => {
    const DELAY_MS = 0; 

    setTimeout(() => {
        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            service: 'Split-N-Share API'
        };

        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        healthCheck.database = {
            status: dbStatus[dbState],
            connected: dbState === 1,
            name: mongoose.connection.name
        };

        if (dbState === 1) {
            res.status(200).json(healthCheck);
        } else {
            healthCheck.status = 'DEGRADED';
            res.status(503).json(healthCheck);
        }
    }, DELAY_MS);
});


if (process.env.NODE_ENV !== 'production') {
    app.get(`/api/${process.env.VERSION}sync`, async (req, res) => {
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

}


app.use ('/api/v1/auth', authRoutes);
app.use ('/api/v1/users', userRoutes);
app.use ('/api/v1/groups', groupRoutes);
app.use ('/api/v1/transactions', transactionRoutes);
app.use ('/api/v1/activity', activityRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

app.use (globalErrorHandler);