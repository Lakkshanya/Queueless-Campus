import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless-campus';

const resetDatabase = async () => {
    console.log(`\n==============================================`);
    console.log(` ⚠️  DATABASE RESET TOOL (NUKE) ⚠️`);
    console.log(` Target: ${MONGO_URI}`);
    console.log(`==============================================\n`);

    try {
        await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB...`);

        // Get all collection names
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        // Dropping each collection to ensure a clean slate
        for (let col of collections) {
            await db.dropCollection(col.name);
            console.log(`Dropped collection: ${col.name} ✅`);
        }

        console.log(`\n==============================================`);
        console.log(` SUCCESS: Database is now completely EMPTY. ✨`);
        console.log(` All Users, Tokens, and Data have been deleted.`);
        console.log(`==============================================\n`);

    } catch (err) {
        console.error(`ERROR resetting database:`, err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

resetDatabase();
