import type { SmileTier } from '@/types';

const CAPTIONS: Record<SmileTier, string[]> = {
  beam: [
    "That smile could light up the whole city ✨",
    "Maximum smile energy unlocked 😁",
    "This is what pure joy looks like 🌟",
    "Beam smile achieved — 50 points well earned! 🔥",
    "Warning: this smile is dangerously contagious 😁",
    "Full power smile mode activated ⚡",
  ],
  big: [
    "A big smile for a big day 😄",
    "Radiating good vibes only 🌈",
    "This smile hit different today 😄",
    "Happiness level: very high 🎉",
    "Smiling like nobody's watching 😄",
    "Big smile, bigger heart 💛",
  ],
  mild: [
    "A little smile goes a long way 😊",
    "Quiet joy is still joy 💛",
    "Soft smiles, good days 😊",
    "The gentle kind of happy ✨",
    "Small smile, full heart 😊",
    "Keeping it warm and positive 🌻",
  ],
  none: [
    "Even calm faces earn points here 😐",
    "Resting face, still a vibe 💫",
    "The quiet ones feel deeply 🌙",
    "Not every day needs a big smile 😐",
    "Chill mode: activated 🧊",
    "Serenity is underrated ✨",
  ],
};

export async function generateCaption(_score: number, tier: SmileTier): Promise<string> {
  const pool = CAPTIONS[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
