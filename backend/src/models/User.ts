import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password?: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  lastActive: Date | null;
  achievements: {
    badgeId: string;
    unlockedAt: Date;
  }[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
      default: 'buddy_calm', // avatar name indicator
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: null,
    },
    achievements: [
      {
        badgeId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
