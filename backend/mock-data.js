import mongoose from 'mongoose';
import User from './src/models/User.js';
import Service from './src/models/Service.js';
import Counter from './src/models/Counter.js';
import Token from './src/models/Token.js';
import Sequence from './src/models/Sequence.js';

await mongoose.connect('mongodb://127.0.0.1:27017/queueless-campus');

const staff = await User.findOne({ name: 'Suresh' });
const service = await Service.findById(staff.assignedServices[0]);
const counter = await Counter.findById(service.assignedCounter);

// Find a student
let student = await User.findOne({ role: 'student' });
if (!student) {
  // create dummy student
  student = new User({ name: 'Test Student', email: 'test@student.com', password: 'test', role: 'student' });
  await student.save();
}

// Clear existing waiting tokens for this counter
await Token.deleteMany({ counter: counter._id, status: 'waiting' });
counter.workload = 0;

for(let i=1; i<=7; i++) {
    // Gen seq
    const sequence = await Sequence.findOneAndUpdate(
        { serviceId: service._id },
        { $inc: { sequence_value: 1 } },
        { upsert: true, new: true }
    );
    const tokenNumber = `${service.prefix}-${sequence.sequence_value.toString().padStart(3, '0')}`;

    let status = 'waiting';
    let bookedAt = new Date();
    
    // Make 2 of them completed today for analytics
    if (i <= 2) {
       status = 'completed';
       bookedAt = new Date(Date.now() - 3600000); // 1 hour ago
    }

    const t = new Token({
      number: tokenNumber,
      student: student._id,
      service: service._id,
      counter: counter._id,
      status: status,
      queuePosition: status === 'waiting' ? counter.workload + 1 : null,
      estimatedWaitTime: status === 'waiting' ? counter.workload * 10 : 0,
      bookedAt: bookedAt,
      completedAt: status === 'completed' ? new Date() : null
    });

    await t.save();
    if (status === 'waiting') {
       counter.workload += 1;
    }
}
await counter.save();

console.log('Mock tokens injected into database successfully!');
process.exit(0);
