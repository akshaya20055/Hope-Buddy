import mongoose from 'mongoose';

export interface IMessage {
  sender: 'user' | 'ai';
  text: string;
  detectedMood?: string;
  responseMode?: string;
  timestamp: Date;
}

export interface IChat extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  detectedMood: {
    type: String,
  },
  responseMode: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema<IChat>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
