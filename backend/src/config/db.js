import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless-campus';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error(`Error hooking up MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
