import mongoose from 'mongoose';
import User from './src/models/User.js';
import Counter from './src/models/Counter.js';
import Token from './src/models/Token.js';

await mongoose.connect('mongodb://127.0.0.1:27017/queueless-campus');

// Find the dummy student
const dummyStudent = await User.findOne({ email: 'test@student.com' });

if (dummyStudent) {
    // Delete all tokens belonging to dummy student
    await Token.deleteMany({ student: dummyStudent._id });
    
    // Delete the dummy student
    await User.findByIdAndDelete(dummyStudent._id);
    console.log('Deleted dummy student and associated tokens.');
}

// Ensure the counter workload is purely calculated based on waiting tokens
const counters = await Counter.find({});
for (const counter of counters) {
    const workload = await Token.countDocuments({ counter: counter._id, status: 'waiting' });
    counter.workload = workload;
    
    // Check if the currentToken is valid
    if (counter.currentToken) {
        const tokenExists = await Token.findById(counter.currentToken);
        if (!tokenExists) {
            counter.currentToken = null;
        }
    }
    
    await counter.save();
    console.log(`Reset workload for counter ${counter.number} to ${workload}.`);
}

console.log('Database cleaned up successfully!');
process.exit(0);
