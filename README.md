# HopeBuddy AI – Emotional Support & Motivation Assistant

HopeBuddy AI is a premium, production-level, fully functional Emotional Support & Motivation Assistant. It is designed to help users express and overcome sadness, loneliness, anxiety, academic stress, relationship friction, and motivation loss through intelligent bilingual dialogue (English & Telugu), grounding practices, crisis hotlines, and gamified self-care tools.

---

## 🌟 Core Features

1. **AI Emotional Chatbot:** Empathizes with user feelings and adjusts response styles instantly. Falls back to a robust, pre-programmed local knowledge base if no Gemini API key is configured.
2. **Bilingual Engine:** Fully supports seamless switching between English and Telugu across all user interface panels.
3. **9 Intelligent Response Modes:** Select auto-responses, comfort support, powerful motivations, humorous anecdotes, historical struggles (Kalam, Lincoln, Rowling), calming tools, and confidence tasks.
4. **Gamified Milestones:** Earn Experience Points (XP) and Daily active login streaks for logging moods, chatting, or writing private diaries. Unlocks achievements like *Hope Seeker*, *Journal Master*, and *First Step*.
5. **Private Sentiment Journal:** Encrypted CRUD diary entries with auto-analyzed emotional tags.
6. **Sentiment Analytics Dashboard:** Real-time visual data mapping of emotional intensities and feeling distributions utilizing Recharts.
7. **Integrated Voice Controls:** Real-time speech recognition (Speech-to-Text) and natural reads (Text-to-Speech) using the native Web Speech API.
8. **Crisis Safety Checkpoint:** Detects crisis keywords (e.g. self-harm, suicidal feelings) and immediately bypasses normal chats to display red alert warning panels and regional helplines.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
* **Backend:** Node.js + Express.js + Mongoose
* **Database:** MongoDB
* **State & Authentication:** Custom React JWT Context Provider + Web Storage API
* **Icons:** Lucide React
* **Graphs:** Recharts

---

## 📂 Project Structure

```
d:\Hope Buddy\
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB config
│   │   ├── controllers/  # Route controller logic
│   │   ├── middleware/   # JWT Auth & Error middlewares
│   │   ├── models/       # Mongoose Database Schemas
│   │   ├── routes/       # Express Router mappings
│   │   └── services/     # AI response service & seeding verifier
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router (12 Pages)
│   │   ├── components/   # Sidebar, Navbar, and widgets
│   │   ├── context/      # Theme, Language, and Auth contexts
│   │   ├── hooks/        # Voice speech recognition / synthesis hook
│   │   └── services/     # Native Fetch API wrappers
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json (root)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (v18+ recommended).
2. Install and run [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally on standard port `27017`.

### 1. Installation

From the project root directory (`d:\Hope Buddy`), run the following command to install all packages for both the backend and frontend at once:

```bash
npm run install-all
```

### 2. Environment Variables Configuration

#### Backend Configuration
Copy `backend/.env.example` to `backend/.env`:
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hopebuddy
JWT_SECRET=hopebuddysecretkey12345
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
*Note: If `GEMINI_API_KEY` is left blank, HopeBuddy AI will automatically fall back to its highly sophisticated pre-programmed bilingual wisdom engine.*

---

### 3. Run Development Servers

Run both servers in separate terminal panes:

#### Term 1: Start MongoDB and Backend
```bash
npm run dev-backend
```
*Port: `http://localhost:5000`*

#### Term 2: Start Frontend
```bash
npm run dev-frontend
```
*Port: `http://localhost:3000`*

---

## 🏆 Database Seeding & Verification

To verify that your MongoDB connection is working perfectly, run the following verification script:
```bash
npm run seed-backend
```

---

## 🔒 Security & Privacy

* **Authorization:** Secure token validations using JWT Bearer headers.
* **Cryptography:** Secure credential encryption using `bcryptjs` before committing user logs.
* **Data Isolation:** Complete workspace separation. Journals and chat logs are bound to unique MongoDB Object IDs, ensuring 100% private data silos.
