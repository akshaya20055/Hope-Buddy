import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Preferences } from '../models/Preferences.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendResetEmail } from '../services/emailService.js';



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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Please enter your email address' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[INVALID EMAIL] Password reset requested for unregistered email: ${email}`);
      res.status(404).json({ success: false, message: 'No user registered with this email address' });
      return;
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour expiry

    await user.save();

    // Construct resetUrl
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email
    const emailResult = await sendResetEmail(user.email, resetUrl);
    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      console.error(`[EMAIL SEND FAILURE] Failed sending reset email to ${email}. Error: ${emailResult.error}`);
      res.status(500).json({ success: false, message: emailResult.error || 'Could not send reset password email. Try again.' });
      return;
    }

    console.log(`[EMAIL SEND SUCCESS] Reset password email sent to ${email}`);
    res.json({ success: true, message: 'A password reset link has been transmitted to your email.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      res.status(400).json({ success: false, message: 'New password is required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check valid token
    const user = await User.findOne({ resetPasswordToken: hashedToken });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid reset token' });
      return;
    }

    // Check expiry
    if (user.resetPasswordExpire && user.resetPasswordExpire.getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'Expired link. Please request a new password reset.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset credentials
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, message: 'Password reset successful. Please login with your new credentials.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

