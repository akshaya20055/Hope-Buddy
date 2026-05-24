import mongoose from 'mongoose';

export interface IJournal extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  detectedMood: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new mongoose.Schema<IJournal>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
    },
    detectedMood: {
      type: String,
      default: 'calm',
    },
  },
  {
    timestamps: true,
  }
);

export const Journal = mongoose.model<IJournal>('Journal', JournalSchema);
