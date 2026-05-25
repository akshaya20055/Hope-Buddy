import express from 'express';
import { logMood, getMoodHistory } from '../controllers/moodController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
  .post(protect, logMood)
  .get(protect, getMoodHistory);

export default router;
