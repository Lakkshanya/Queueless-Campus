import mongoose from 'mongoose';
import dotenv from 'dotenv';
import redis from 'redis';
import User from './src/models/User.js';
import Service from './src/models/Service.js';
import Counter from './src/models/Counter.js';
import Token from './src/models/Token.js';
import Notification from './src/models/Notification.js';
import Sequence from './src/models/Sequence.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const clearDatabase = async () => {
  try {
    // 1. Clear MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing MongoDB collections...');
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Counter.deleteMany({}),
      Token.deleteMany({}),
      Notification.deleteMany({}),
      Sequence.deleteMany({}),
    ]);
    console.log('All MongoDB collections cleared.');

    // 2. Clear Redis
    console.log('Connecting to Redis...');
    const redisClient = redis.createClient({ url: REDIS_URL });
    await redisClient.connect();
    console.log('Connected to Redis.');

    console.log('Flushing Redis cache...');
    await redisClient.flushAll();
    console.log('Redis cache cleared.');

    await redisClient.quit();
    await mongoose.connection.close();
    
    console.log('\n✅ Database and Cache cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabase();
