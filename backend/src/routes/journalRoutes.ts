import express from 'express';
import { createJournalEntry, getJournalEntries, deleteJournalEntry } from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
  .post(protect, createJournalEntry)
  .get(protect, getJournalEntries);

router.delete('/:id', protect, deleteJournalEntry);

export default router;
