const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hopebuddy-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  async signup(data: any) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async resetPassword(token: string, data: any) {
    const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },


  // AI Chat & Stories
  async sendMessage(text: string) {
    const res = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async getChatHistory() {
    const res = await fetch(`${API_URL}/chat/history`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async clearChat() {
    const res = await fetch(`${API_URL}/chat/history`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  async generateStory(category: string, choice?: string, history?: string) {
    const res = await fetch(`${API_URL}/chat/story`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ category, choice, history })
    });
    return res.json();
  },

  // Mood Tracker
  async logMood(data: { mood: string; intensity: number; note?: string }) {
    const res = await fetch(`${API_URL}/mood`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMoodHistory() {
    const res = await fetch(`${API_URL}/mood`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Journal (Diary)
  async getJournals() {
    const res = await fetch(`${API_URL}/journal`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async createJournal(data: { title: string; content: string }) {
    const res = await fetch(`${API_URL}/journal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteJournal(id: string) {
    const res = await fetch(`${API_URL}/journal/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // User details & Settings
  async getProfile() {
    const res = await fetch(`${API_URL}/user/profile`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async updateAvatar(avatar: string) {
    const res = await fetch(`${API_URL}/user/avatar`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ avatar })
    });
    return res.json();
  },

  async getPreferences() {
    const res = await fetch(`${API_URL}/user/preferences`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async updatePreferences(data: any) {
    const res = await fetch(`${API_URL}/user/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_URL}/user/notifications`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async markNotificationsRead() {
    const res = await fetch(`${API_URL}/user/notifications`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  }
};
