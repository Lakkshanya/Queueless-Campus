import mongoose from 'mongoose';
import User from './src/models/User.js';
import Service from './src/models/Service.js';
import Counter from './src/models/Counter.js';

await mongoose.connect('mongodb://127.0.0.1:27017/queueless-campus');

const staffs = await User.find({ role: 'staff', assignedCounter: null, assignedServices: { $exists: true, $not: {$size: 0} } });
console.log('Found staffs to fix:', staffs.length);
for (const staff of staffs) {
    const service = await Service.findById(staff.assignedServices[0]);
    if (service && service.assignedCounter) {
        staff.assignedCounter = service.assignedCounter;
        await staff.save();
        await Counter.findByIdAndUpdate(service.assignedCounter, { staff: staff._id });
        console.log('Fixed staff:', staff.name);
    } else {
        console.log('Staff has service but service has no assigned counter:', staff.name);
    }
}
process.exit(0);
