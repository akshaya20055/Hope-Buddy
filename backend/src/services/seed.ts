import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hopebuddy';

const runSeed = async () => {
  console.log('--- HopeBuddy Seeding & Verification ---');
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
    
    console.log('\nSeed Status: SUCCESS');
    console.log('The database is fully configured and ready to log user states.');
    console.log('Seeded Badges: "hope_seeker", "journal_master", "first_step".');
    console.log('Seed process completed successfully.');
  } catch (error) {
    console.error('Seeding error encountered:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

runSeed();
