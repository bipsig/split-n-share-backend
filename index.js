import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoClient } from "mongodb"

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = `mongodb+srv://${process.env.MONGODB_ATLAS_USERNAME}:${process.env.MONGODB_ATLAS_PASSWORD}@split-n-share.e8f54.mongodb.net/?retryWrites=true&w=majority&appName=split-n-share`;

const connectMongoDB = async () => {
    const client = new MongoClient (mongo_uri);

    try {

        await client.connect();
        console.log('Connected to MongoDB Atlas');
    
        const database = client.db('testDatabase');
        const collection = database.collection('testCollection');
    
        const doc = { name: 'Sagnik', age: 22, city: 'Pune' };
        const result = await collection.insertOne(doc);
        console.log('Document inserted with _id:', result.insertedId);
    
        const documents = await collection.find({}).toArray();
        console.log('Documents:', documents);
    
      } 
        
      catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

app.get ('/', async (req, res) => {
    connectMongoDB();
    res.send ('Hello World!');
})

app.listen (port, () => {
    console.log (`Server running successfully on port number ${port}`);
})