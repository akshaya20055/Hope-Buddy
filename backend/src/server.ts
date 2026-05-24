import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import authRoutes from './routes/authRoutes.ts';
import chatRoutes from './routes/chatRoutes.ts';
import journalRoutes from './routes/journalRoutes.ts';
import moodRoutes from './routes/moodRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import { notFound, errorHandler } from './middleware/errorMiddleware.ts';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allow connections from frontend
  credentials: true
}));
app.use(express.json());

// Main Root API test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HopeBuddy AI Support Server API.' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/user', userRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
