import mongoose from 'mongoose'; 
import { Store } from '../../models/storeModel.js';
import { User } from '../../models/userModel.js';

mongoose.connect("mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/")
.then(() => {
    console.log("MongoDB connected");
})  
.catch(() => {
  console.log("MongoDB connection failed");
});

// Export the models
export { User, Store };