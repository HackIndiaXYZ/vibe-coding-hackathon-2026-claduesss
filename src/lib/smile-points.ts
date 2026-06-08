import type { SmileTier, SmileTierInfo } from '@/types';

export function getSmileTier(score: number): SmileTierInfo {
  if (score >= 0.8) return { tier: 'beam', points: 50, emoji: '😁', label: 'Beam Smile', color: '#FF3D00' };
  if (score >= 0.6) return { tier: 'big',  points: 30, emoji: '😄', label: 'Big Smile',  color: '#FF6B35' };
  if (score >= 0.4) return { tier: 'mild', points: 10, emoji: '😊', label: 'Mild Smile', color: '#FFD93D' };
  return { tier: 'none', points: 0, emoji: '😐', label: 'No Smile', color: '#9CA3AF' };
}

export const TIER_CONFIG: Record<SmileTier, SmileTierInfo> = {
  beam: { tier: 'beam', points: 50, emoji: '😁', label: 'Beam Smile', color: '#FF3D00' },
  big:  { tier: 'big',  points: 30, emoji: '😄', label: 'Big Smile',  color: '#FF6B35' },
  mild: { tier: 'mild', points: 10, emoji: '😊', label: 'Mild Smile', color: '#FFD93D' },
  none: { tier: 'none', points: 0,  emoji: '😐', label: 'No Smile',   color: '#9CA3AF' },
};

export const GIFT_COST = 1;
export const GIFT_REWARD = 1;
