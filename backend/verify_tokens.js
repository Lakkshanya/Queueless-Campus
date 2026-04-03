import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Token from './src/models/Token.js';
import Service from './src/models/Service.js';
import Sequence from './src/models/Sequence.js';
import User from './src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless';

const testSequentialTokens = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find a service
        const service = await Service.findOne({ prefix: 'BNF' });
        if (!service) throw new Error('BNF service not found. Run seed.js first.');

        // 2. Create a dummy student
        let student = await User.findOne({ email: 'test_student@campus.com' });
        if (!student) {
            student = new User({
                name: 'Test Student',
                email: 'test_student@campus.com',
                password: 'password123',
                role: 'student',
                isVerified: true
            });
            await student.save();
        }

        console.log(`Booking tokens for service: ${service.name} (${service.prefix})`);

        // 3. Clear sequence and tokens for this test
        await Sequence.deleteMany({ serviceId: service._id });
        await Token.deleteMany({ service: service._id });

        // 4. Book 3 tokens sequentially
        const results = [];
        for (let i = 0; i < 3; i++) {
            // Logic from tokenController
            const sequence = await Sequence.findOneAndUpdate(
                { serviceId: service._id },
                { $inc: { sequence_value: 1 } },
                { upsert: true, new: true }
            );

            const tokenNumber = `${service.prefix}-${sequence.sequence_value.toString().padStart(3, '0')}`;
            
            const newToken = new Token({
                number: tokenNumber,
                student: student._id,
                service: service._id,
                status: 'waiting',
                queuePosition: sequence.sequence_value
            });
            await newToken.save();
            results.push(tokenNumber);
            console.log(`Generated: ${tokenNumber}`);
        }

        // 5. Assertions
        const expected = [`${service.prefix}-001`, `${service.prefix}-002`, `${service.prefix}-003`];
        const success = JSON.stringify(results) === JSON.stringify(expected);
        
        if (success) {
            console.log('✅ Sequential Token Generation Verified Successfully!');
        } else {
            console.error('❌ Verification Failed. Expected:', expected, 'Got:', results);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSequentialTokens();
