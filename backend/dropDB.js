import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless';

const dropDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    if(mongoose.connection.db) {
       await mongoose.connection.db.dropDatabase();
       console.log('Database dropped successfully');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dropDB();
