export enum UserTier {
  Free = 'Free',
  High = 'High',
  Extreme = 'Extreme',
  Owner = 'Owner'
}

export interface User {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  avatar: string;
  coins: number;
}

export enum AppMode {
  Chat = 'Chat',
  Generate = 'Generate',
  Invest = 'Invest',
  Conversation = 'Conversation'
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export enum PersonalityTone {
  Friendly = 'Friendly',
  Mentor = 'Mentor',
  Playful = 'Playful',
}

export interface PersonalitySettings {
  tone: PersonalityTone;
  emojiBalance: 'Light' | 'Normal' | 'Heavy';
  questionFrequency: 'Low' | 'Normal' | 'High';
}