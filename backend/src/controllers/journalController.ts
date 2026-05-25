import { Response } from 'express';
import { Journal } from '../models/Journal.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';


export const createJournalEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    // Auto-detect a mood from journal text keywords
    const text = content.toLowerCase();
    let detectedMood = 'peaceful';
    if (text.includes('sad') || text.includes('cry') || text.includes('hurt') || text.includes('pain') || text.includes('బాధ')) {
      detectedMood = 'sad';
    } else if (text.includes('lonely') || text.includes('alone') || text.includes('ఒంటరి')) {
      detectedMood = 'lonely';
    } else if (text.includes('anxious') || text.includes('worry') || text.includes('fear') || text.includes('ఆందోళన')) {
      detectedMood = 'anxious';
    } else if (text.includes('angry') || text.includes('hate') || text.includes('mad') || text.includes('కోపం')) {
      detectedMood = 'angry';
    } else if (text.includes('happy') || text.includes('glad') || text.includes('excited') || text.includes('సంతోషం')) {
      detectedMood = 'happy';
    }

    const journal = await Journal.create({
      userId,
      title,
      content,
      detectedMood,
    });

    // Gamification
    const user = await User.findById(userId);
    if (user) {
      let xpGained = 20;
      let badgeUnlocked = null;

      const hasJournalBadge = user.achievements.some(a => a.badgeId === 'journal_master');
      if (!hasJournalBadge) {
        user.achievements.push({ badgeId: 'journal_master', unlockedAt: new Date() });
        xpGained += 30; // Bonus XP
        badgeUnlocked = {
          badgeId: 'journal_master',
          title: 'Journal Master',
          description: 'Logged your first personal emotional diary entry.'
        };

        await Notification.create({
          userId,
          title: 'New Badge Unlocked! 🏆',
          message: 'Splendid! You unlocked the "Journal Master" badge for practicing self-reflection!',
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
          message: `Awesome! You reached Level ${newLevel}! Keep documenting your thoughts.`,
          type: 'motivation'
        });
      }
      await user.save();
    }

    res.status(201).json({ success: true, data: journal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJournalEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const entries = await Journal.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJournalEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const entry = await Journal.findOneAndDelete({ _id: id, userId });
    if (!entry) {
      res.status(404).json({ success: false, message: 'Journal entry not found' });
      return;
    }

    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
