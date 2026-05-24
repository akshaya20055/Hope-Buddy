import mongoose from 'mongoose';

export interface IMoodHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  mood: string; // sad, lonely, angry, stressed, overthinking, fear, anxiety, motivation_loss, etc.
  intensity: number; // 1-10
  note?: string;
  createdAt: Date;
}

const MoodHistorySchema = new mongoose.Schema<IMoodHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    intensity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const MoodHistory = mongoose.model<IMoodHistory>('MoodHistory', MoodHistorySchema);
