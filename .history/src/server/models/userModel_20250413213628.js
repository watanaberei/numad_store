import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  birthdate: {
    type: Date,
  },
  likedStores: {
    type: [String],
    default: [],
  },
  dislikedStores: {
    type: [String],
    default: [],
  },
  savedStores: {
    type: [String],
    default: [],
  },
  // Add this field to track the current checked-in store
  checkedInStore: {
    type: String,
    default: null,
  },
  visitHistory: {
    type: [{
      storeId: String,
      timestamp: Date,
    }],
    default: [],
  },
}, { timestamps: true });

// Password validation method
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export const UserModel = mongoose.model('User', userSchema);