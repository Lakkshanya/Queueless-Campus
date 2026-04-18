const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/queueless-campus').then(async () => {
    const User = require('./backend/src/models/User.js').default;
    const Service = require('./backend/src/models/Service.js').default;
    const Counter = require('./backend/src/models/Counter.js').default;

    const staffs = await User.find({ role: 'staff', assignedCounter: null, assignedServices: { $exists: true, $not: {$size: 0} } });
    console.log('Found staffs to fix:', staffs.length);
    for (const staff of staffs) {
        const service = await Service.findById(staff.assignedServices[0]);
        if (service && service.assignedCounter) {
            staff.assignedCounter = service.assignedCounter;
            await staff.save();
            await Counter.findByIdAndUpdate(service.assignedCounter, { staff: staff._id });
            console.log('Fixed staff:', staff.name);
        }
    }
    process.exit(0);
});
