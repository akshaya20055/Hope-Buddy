import { Response } from 'express';
import { Chat, IMessage } from '../models/Chat.ts';
import { User } from '../models/User.ts';
import { Preferences } from '../models/Preferences.ts';
import { MoodHistory } from '../models/MoodHistory.ts';
import { Notification } from '../models/Notification.ts';
import { generateAIResponse, generateStory } from '../services/aiService.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const handleChatMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Message text is required' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // 1. Get user and preferences
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let pref = await Preferences.findOne({ userId });
    if (!pref) {
      pref = await Preferences.create({ userId, language: 'en', responseMode: 'auto' });
    }

    // 2. Fetch or create chat session
    let chatSession = await Chat.findOne({ userId });
    if (!chatSession) {
      chatSession = await Chat.create({ userId, messages: [] });
    }

    // 3. Format history for AI
    const history: { sender: 'user' | 'ai'; text: string }[] = chatSession.messages.map(m => ({
      sender: m.sender,
      text: m.text
    }));
    
    // Add current user message to prompt history
    history.push({ sender: 'user', text });

    // 4. Generate AI Response
    const aiResult = await generateAIResponse(history, pref.responseMode, pref.language);

    // 5. Save user and AI messages in session
    const userMsg: IMessage = {
      sender: 'user',
      text,
      detectedMood: aiResult.detectedMood,
      responseMode: aiResult.responseMode,
      timestamp: new Date()
    };

    const aiMsg: IMessage = {
      sender: 'ai',
      text: aiResult.text,
      detectedMood: aiResult.detectedMood,
      responseMode: aiResult.responseMode,
      timestamp: new Date()
    };

    chatSession.messages.push(userMsg);
    chatSession.messages.push(aiMsg);

    // Keep history clean (e.g. max 50 messages)
    if (chatSession.messages.length > 100) {
      chatSession.messages = chatSession.messages.slice(-50);
    }
    await chatSession.save();

    // 6. Log auto-detected mood
    await MoodHistory.create({
      userId,
      mood: aiResult.detectedMood,
      intensity: 5, // Default average intensity for auto-detection
      note: `Chat message: "${text.substring(0, 30)}..."`
    });

    // 7. Gamification & Level Up system
    let xpGained = 10;
    let badgeUnlocked = null;

    // Check "hope_seeker" badge (first chat conversation)
    const hasChatBadge = user.achievements.some(a => a.badgeId === 'hope_seeker');
    if (!hasChatBadge) {
      user.achievements.push({ badgeId: 'hope_seeker', unlockedAt: new Date() });
      xpGained += 30; // 30 XP bonus for first chat badge
      badgeUnlocked = {
        badgeId: 'hope_seeker',
        title: 'Hope Seeker',
        description: 'Completed your first AI Emotional Support Chat.'
      };

      await Notification.create({
        userId,
        title: 'New Badge Unlocked! 🏆',
        message: 'Congratulations! You unlocked the "Hope Seeker" badge for seeking support!',
        type: 'badge'
      });
    }

    user.xp += xpGained;

    // Level up calculation
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > user.level) {
      user.level = calculatedLevel;
      await Notification.create({
        userId,
        title: 'Level Up! 🎉',
        message: `Outstanding! You reached Level ${calculatedLevel}! Keep up your mental health journey.`,
        type: 'motivation'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: aiMsg,
      gamification: {
        xpGained,
        totalXp: user.xp,
        level: user.level,
        badgeUnlocked
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const chatSession = await Chat.findOne({ userId });
    
    if (!chatSession) {
      res.json({ success: true, messages: [] });
      return;
    }

    res.json({ success: true, messages: chatSession.messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    await Chat.deleteOne({ userId });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleStoryRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    const userId = req.user?.id;
    
    const pref = await Preferences.findOne({ userId }) || { language: 'en' };
    const story = await generateStory(category || 'healing', pref.language as 'en' | 'te');
    
    res.json({ success: true, story });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
