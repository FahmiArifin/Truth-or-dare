/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, User } from '../types';

let currentToken: string | null = localStorage.getItem('tod_session_token');

export function getSessionToken(): string | null {
  return currentToken;
}

export function setSessionToken(token: string | null) {
  currentToken = token;
  if (token) {
    localStorage.setItem('tod_session_token', token);
  } else {
    localStorage.removeItem('tod_session_token');
  }
}

// Helper to make fetch calls with proper headers
async function jsonRequest(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  async register(email: string, username: string, passwordHash: string) {
    const data = await jsonRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password: passwordHash }),
    });
    if (data.token) {
      setSessionToken(data.token);
    }
    return data;
  },

  async login(email: string, passwordHash: string) {
    const data = await jsonRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash }),
    });
    if (data.token) {
      setSessionToken(data.token);
    }
    return data;
  },

  async logout() {
    try {
      await jsonRequest('/api/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Silent exit cleanup on API logout failure', e);
    }
    setSessionToken(null);
  },

  async getMe(): Promise<{ user: User | null }> {
    if (!currentToken) return { user: null };
    try {
      return await jsonRequest('/api/me');
    } catch (err) {
      console.warn('Session is likely invalid in server, stripping token', err);
      setSessionToken(null);
      return { user: null };
    }
  },

  async uploadAvatar(base64Image: string) {
    return await jsonRequest('/api/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatar: base64Image }),
    });
  }
};

export const questionApi = {
  async getQuestions(): Promise<{ questions: Question[] }> {
    return await jsonRequest('/api/questions');
  },

  async createQuestion(category: string, type: 'truth' | 'dare', text: string) {
    return await jsonRequest('/api/questions', {
      method: 'POST',
      body: JSON.stringify({ category, type, text }),
    });
  },

  async updateQuestion(id: string, text: string) {
    return await jsonRequest(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
  },

  async deleteQuestion(id: string) {
    return await jsonRequest(`/api/questions/${id}`, {
      method: 'DELETE',
    });
  }
};

export const adminApi = {
  async getUsers() {
    return await jsonRequest('/api/admin/users');
  },

  async createUser(payload: any) {
    return await jsonRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateUser(id: string, payload: any) {
    return await jsonRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteUser(id: string) {
    return await jsonRequest(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async getQuestions() {
    return await jsonRequest('/api/admin/questions');
  },

  async createQuestion(payload: any) {
    return await jsonRequest('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateQuestion(id: string, payload: any) {
    return await jsonRequest(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async approveQuestion(id: string) {
    return await jsonRequest(`/api/admin/questions/${id}/approve`, {
      method: 'POST'
    });
  },

  async rejectQuestion(id: string) {
    return await jsonRequest(`/api/admin/questions/${id}/reject`, {
      method: 'POST'
    });
  },

  async getFeedbacks() {
    return await jsonRequest('/api/admin/feedbacks');
  },

  async updateCategories(categories: any[]) {
    return await jsonRequest('/api/categories', {
      method: 'PUT',
      body: JSON.stringify({ categories })
    });
  },

  async getSubCategories(): Promise<{ subCategories: any[] }> {
    return await jsonRequest('/api/subcategories');
  },

  async createCategory(payload: { key: string; label: string; colorNormal: string; colorContrast: string }) {
    return await jsonRequest('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateCategory(key: string, payload: { label: string; colorNormal: string; colorContrast: string }) {
    return await jsonRequest(`/api/admin/categories/${key}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteCategory(key: string) {
    return await jsonRequest(`/api/admin/categories/${key}`, {
      method: 'DELETE'
    });
  },

  async createSubCategory(payload: { key: string; label: string; parentKey: string }) {
    return await jsonRequest('/api/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateSubCategory(key: string, payload: { label: string; parentKey: string }) {
    return await jsonRequest(`/api/admin/subcategories/${key}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteSubCategory(key: string) {
    return await jsonRequest(`/api/admin/subcategories/${key}`, {
      method: 'DELETE'
    });
  }
};

export const userApi = {
  async getSuggestions() {
    return await jsonRequest('/api/user/suggestions');
  },

  async createSuggestion(payload: any) {
    return await jsonRequest('/api/questions', { // Uses the updated standard POST questions endpoint
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getHistories() {
    return await jsonRequest('/api/user/histories');
  },

  async createHistory(payload: any) {
    return await jsonRequest('/api/user/histories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async submitFeedback(payload: any) {
    return await jsonRequest('/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getCategories() {
    return await jsonRequest('/api/categories');
  }
};
