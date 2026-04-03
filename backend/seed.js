  import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './src/models/Service.js';
import Counter from './src/models/Counter.js';
import User from './src/models/User.js';
import Requirement from './src/models/Requirement.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing services/counters for a clean start if needed
    // await Service.deleteMany({});
    // await Counter.deleteMany({});

    const services = [
      { name: 'Bonafide Certificate', prefix: 'BNF', description: 'Issuance of bonafide certificates for students.', estimatedTimePerToken: 5 },
      { name: 'Fee Issue', prefix: 'FEE', description: 'Resolve fee payment and scholarship refund issues.', estimatedTimePerToken: 15 },
      { name: 'Hostel Complaint', prefix: 'HST', description: 'Lodge complaints regarding hostel facilities.', estimatedTimePerToken: 10 },
      { name: 'Scholarship Verification', prefix: 'SCH', description: 'Verify documents for government scholarships.', estimatedTimePerToken: 12 },
    ];

    for (const s of services) {
      await Service.findOneAndUpdate({ name: s.name }, s, { upsert: true });
    }
    console.log('Services seeded');

    // Fetch seeded services
    const bnf = await Service.findOne({ prefix: 'BNF' });
    const fee = await Service.findOne({ prefix: 'FEE' });

    const counters = [
      { number: 1, services: [bnf._id], status: 'active', workload: 0 },
      { number: 2, services: [fee._id], status: 'maintenance', workload: 0 },
      { number: 3, services: [bnf._id, fee._id], status: 'paused', workload: 0 },
    ];

    for (const c of counters) {
      await Counter.findOneAndUpdate({ number: c.number }, c, { upsert: true });
    }
    console.log('Counters seeded');

    const requirements = [
      { title: 'ID Card', description: 'Upload a clear photo of your Student ID card', type: 'id_card', isRequired: true },
      { title: '12th Marksheet', description: 'Upload your HSC / 12th grade marksheet', type: 'marksheet_12', isRequired: true },
      { title: '10th Marksheet', description: 'Upload your SSLC / 10th grade marksheet', type: 'marksheet_10', isRequired: true },
    ];

    for (const r of requirements) {
      await Requirement.findOneAndUpdate({ type: r.type }, r, { upsert: true });
    }
    console.log('Requirements seeded');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
