import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hopebuddy';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
