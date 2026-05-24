import mongoose from 'mongoose';

export interface IPreferences extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  language: 'en' | 'te';
  responseMode: 'auto' | 'support' | 'motivation' | 'funny' | 'historical' | 'success' | 'confidence' | 'calm' | 'friendship';
  sleepReminders: boolean;
  dailyReminders: boolean;
  voiceEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PreferencesSchema = new mongoose.Schema<IPreferences>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    language: {
      type: String,
      enum: ['en', 'te'],
      default: 'en',
    },
    responseMode: {
      type: String,
      enum: ['auto', 'support', 'motivation', 'funny', 'historical', 'success', 'confidence', 'calm', 'friendship'],
      default: 'auto',
    },
    sleepReminders: {
      type: Boolean,
      default: true,
    },
    dailyReminders: {
      type: Boolean,
      default: true,
    },
    voiceEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Preferences = mongoose.model<IPreferences>('Preferences', PreferencesSchema);
