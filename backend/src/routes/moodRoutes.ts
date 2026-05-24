import express from 'express';
import { logMood, getMoodHistory } from '../controllers/moodController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.route('/')
  .post(protect, logMood)
  .get(protect, getMoodHistory);

export default router;
