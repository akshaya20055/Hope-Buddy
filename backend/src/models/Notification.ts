import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'motivation' | 'affirmation' | 'sleep' | 'study' | 'badge' | 'general';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['motivation', 'affirmation', 'sleep', 'study', 'badge', 'general'],
      default: 'general',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
