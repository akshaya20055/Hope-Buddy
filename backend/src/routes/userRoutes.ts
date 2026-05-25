import express from 'express';
import {
  getProfile,
  updateAvatar,
  getPreferences,
  updatePreferences,
  getNotifications,
  markNotificationsAsRead,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/avatar', protect, updateAvatar);
router.route('/preferences')
  .get(protect, getPreferences)
  .put(protect, updatePreferences);
router.route('/notifications')
  .get(protect, getNotifications)
  .post(protect, markNotificationsAsRead);

export default router;
