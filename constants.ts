import { User, UserTier } from './types';

export const USERS: Record<string, User> = {
  free: {
    id: 'free',
    name: 'Guest User',
    email: 'guest@example.com',
    tier: UserTier.Free,
    avatar: 'https://avatar.iran.liara.run/public/boy',
    coins: 10,
  },
  owner: {
    id: 'owner',
    name: 'Creator Chirag',
    email: 'chiragsu45@gmail.com',
    tier: UserTier.Owner,
    avatar: 'https://avatar.iran.liara.run/public/45',
    coins: Infinity,
  },
};

export const VIDEO_GENERATION_MESSAGES: string[] = [
  "Initializing Axion's creative core...",
  'Conceptualizing the visual narrative...',
  'Allocating generative resources...',
  'Assembling multi-layered motion vectors...',
  'Rendering primary frames...',
  'Applying cinematic post-processing...',
  'Encoding high-fidelity video stream...',
  'Finalizing... This may take a few moments.',
];