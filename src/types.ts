/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryKey = 'asmara' | 'pertemanan' | 'keluarga' | string;

export interface Question {
  id: string;
  category: CategoryKey;
  subCategory?: string;
  type: 'truth' | 'dare';
  text: string;
  text_formal?: string;
  text_casual?: string;
  isCustom: boolean;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  username?: string;
  play_mode?: 'offline' | 'online' | 'both';
}

export interface Player {
  id: string;
  name: string;
  avatar?: string; // base64 string
  avatarColor?: string; // Tailwind hex or class
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string; // base64 data URL
  role?: 'admin' | 'user';
  status?: 'active' | 'suspended';
}

export interface GameCategory {
  key: string;
  label: string;
  colorNormal: string;
  colorContrast: string;
}

export interface SubCategory {
  key: string;
  label: string;
  parentKey: string;
}

export interface FeedbackReport {
  id: string;
  name: string;
  category: 'performance' | 'visual_comfort' | 'accessibility' | 'other' | string;
  comment: string;
  date: string;
}

export interface GameHistoryItem {
  id?: string;
  userId?: string;
  date?: string;
  playerName: string;
  type: 'truth' | 'dare';
  questionText: string;
  category: CategoryKey;
}

export interface GameState {
  players: Player[];
  categories: CategoryKey[];
  currentCategory: CategoryKey | null;
  activePlayerIndex: number;
  askedQuestionIds: string[];
  history: GameHistoryItem[];
}

export interface TTSPlayerConfig {
  enabled: boolean;
  rate: number;
  pitch: number;
  voiceName?: string;
}
