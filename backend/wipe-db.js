import mongoose from 'mongoose';
import Token from './src/models/Token.js';
import Counter from './src/models/Counter.js';
import Sequence from './src/models/Sequence.js';
import Notification from './src/models/Notification.js';

await mongoose.connect('mongodb://127.0.0.1:27017/queueless-campus');

console.log('Initiating complete database reset for Tokens, Sequences, and Notifications...');

// 1. Delete all Tokens
const tokenRes = await Token.deleteMany({});
console.log(`Deleted ${tokenRes.deletedCount} Tokens.`);

// 2. Delete all Sequences (resets token numbering to 001)
const seqRes = await Sequence.deleteMany({});
console.log(`Deleted ${seqRes.deletedCount} Sequences.`);

// 3. Delete all Notifications
const notifRes = await Notification.deleteMany({});
console.log(`Deleted ${notifRes.deletedCount} Notifications.`);

// 4. Reset all Counters explicitly
const counters = await Counter.find({});
for (const counter of counters) {
    counter.workload = 0;
    counter.currentToken = null;
    await counter.save();
    console.log(`Reset Counter Unit-${counter.number} workload to 0 & cleared current assignment.`);
}

console.log('\n--- DATABASE FULLY WIPED & RESET ---');
process.exit(0);
