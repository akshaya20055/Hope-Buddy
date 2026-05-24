import express from 'express';
import { handleChatMessage, getChatHistory, clearChatHistory, handleStoryRequest } from '../controllers/chatController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.post('/message', protect, handleChatMessage);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);
router.post('/story', protect, handleStoryRequest);

export default router;
