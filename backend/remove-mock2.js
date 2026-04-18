import mongoose from 'mongoose';
import Counter from './src/models/Counter.js';
import Token from './src/models/Token.js';

await mongoose.connect('mongodb://127.0.0.1:27017/queueless-campus');

// Find tokens booked in the last 2 hours
const anHourAgo = new Date(Date.now() - 3600000 * 3);

const tokensToDelete = await Token.find({ bookedAt: { $gt: anHourAgo } });
console.log('Deleting tokens:', tokensToDelete.map(t => t.number));
await Token.deleteMany({ bookedAt: { $gt: anHourAgo } });

const counters = await Counter.find({});
for (const counter of counters) {
    const workload = await Token.countDocuments({ counter: counter._id, status: 'waiting' });
    counter.workload = workload;
    
    if (counter.currentToken) {
        const tokenExists = await Token.findById(counter.currentToken);
        if (!tokenExists) {
            counter.currentToken = null;
        }
    }
    
    await counter.save();
    console.log('Reset counter manually:', counter.number, 'workload:', workload);
}

process.exit(0);
