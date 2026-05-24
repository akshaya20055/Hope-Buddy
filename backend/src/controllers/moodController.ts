import { Response } from 'express';
import { MoodHistory } from '../models/MoodHistory.ts';
import { User } from '../models/User.ts';
import { Notification } from '../models/Notification.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const logMood = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { mood, intensity, note } = req.body;
    const userId = req.user?.id;

    if (!mood || intensity === undefined) {
      res.status(400).json({ success: false, message: 'Mood and intensity are required' });
      return;
    }

    const moodLog = await MoodHistory.create({
      userId,
      mood,
      intensity,
      note,
    });

    // Gamification
    const user = await User.findById(userId);
    if (user) {
      let xpGained = 15; // 15 XP for logging mood
      let badgeUnlocked = null;

      const hasFirstStep = user.achievements.some(a => a.badgeId === 'first_step');
      if (!hasFirstStep) {
        user.achievements.push({ badgeId: 'first_step', unlockedAt: new Date() });
        xpGained += 30; // Bonus XP for first badge
        badgeUnlocked = {
          badgeId: 'first_step',
          title: 'First Step',
          description: 'Logged your very first emotional state.'
        };

        await Notification.create({
          userId,
          title: 'New Badge Unlocked! 🏆',
          message: 'Excellent job! You unlocked the "First Step" badge for checking in on your feelings!',
          type: 'badge'
        });
      }

      user.xp += xpGained;
      const newLevel = Math.floor(user.xp / 100) + 1;
      if (newLevel > user.level) {
        user.level = newLevel;
        await Notification.create({
          userId,
          title: 'Level Up! 🎉',
          message: `Incredible! You reached Level ${newLevel}! Keep tracking your moods.`,
          type: 'motivation'
        });
      }
      await user.save();
    }

    res.status(201).json({ success: true, data: moodLog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMoodHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    // Get last 30 mood logs to show in analytics
    const logs = await MoodHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
