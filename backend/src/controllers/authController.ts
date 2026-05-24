import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import { Preferences } from '../models/Preferences.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hopebuddysecretkey123', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'Please enter all fields' });
      return;
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists with this email or username' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: 'buddy_calm',
      xp: 0,
      level: 1,
      streak: 0,
      achievements: []
    });

    // Create default preferences
    await Preferences.create({
      userId: user._id,
      language: 'en',
      responseMode: 'auto',
      sleepReminders: true,
      dailyReminders: true,
      voiceEnabled: true,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        achievements: user.achievements,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please enter all fields' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Update streak and lastActive upon login
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = user.streak;
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Increment streak
        streak += 1;
      } else if (diffDays > 1) {
        // Reset streak
        streak = 1;
      }
    } else {
      streak = 1;
    }

    user.streak = streak;
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        achievements: user.achievements,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
