import { Response } from 'express';
import { User } from '../models/User.js';
import { Preferences } from '../models/Preferences.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';


export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { avatar } = req.body;
    const userId = req.user?.id;

    if (!avatar) {
      res.status(400).json({ success: false, message: 'Avatar name is required' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    let pref = await Preferences.findOne({ userId });
    if (!pref) {
      pref = await Preferences.create({ userId, language: 'en', responseMode: 'auto' });
    }
    res.json({ success: true, data: pref });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { language, responseMode, sleepReminders, dailyReminders, voiceEnabled } = req.body;
    const userId = req.user?.id;

    let pref = await Preferences.findOne({ userId });
    if (!pref) {
      pref = new Preferences({ userId });
    }

    if (language) pref.language = language;
    if (responseMode) pref.responseMode = responseMode;
    if (sleepReminders !== undefined) pref.sleepReminders = sleepReminders;
    if (dailyReminders !== undefined) pref.dailyReminders = dailyReminders;
    if (voiceEnabled !== undefined) pref.voiceEnabled = voiceEnabled;

    await pref.save();
    res.json({ success: true, data: pref });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationsAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
