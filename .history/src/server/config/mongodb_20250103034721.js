 import { MongoClient } from 'mongodb';
 import { MongoClient } from 'mongodb';

 const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/neuapps";
 let client;
 let db;
 
 export async function connectToDatabase() {
   if (db) return db;
   
   try {
     client = await MongoClient.connect(uri);
     db = client.db();
     console.log("Connected to MongoDB");
     return db;
   } catch (error) {
     console.error("MongoDB connection error:", error);
     throw error;
   }
 }
 
 export async function getDatabase() {
   if (!db) {
     await connectToDatabase();
   }
   return db;
 }