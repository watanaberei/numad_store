//   /src/server/data/mongodb/index.js




import mongoose from 'mongoose';
import User from './models/User';
import Store from './models/Store';

const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

export { connect, User, Store };