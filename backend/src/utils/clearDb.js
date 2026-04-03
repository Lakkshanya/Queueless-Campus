import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import Token from '../models/Token.js';
import Notification from '../models/Notification.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless';

const clearDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing collections...');
    await Promise.all([
      Service.deleteMany({}),
      Counter.deleteMany({}),
      User.deleteMany({}),
      Token.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear database:', err);
    process.exit(1);
  }
};

clearDatabase();
