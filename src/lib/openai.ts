import OpenAI from 'openai';
import type { SmileTier } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TIER_PROMPTS: Record<SmileTier, string> = {
  beam:  'a huge, ear-to-ear, genuine beam smile (score: very high)',
  big:   'a big, warm, joyful smile (score: high)',
  mild:  'a gentle, subtle, happy smile (score: moderate)',
  none:  'a neutral, calm expression (score: low)',
};

export async function generateCaption(score: number, tier: SmileTier): Promise<string> {
  const description = TIER_PROMPTS[tier];
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 60,
    messages: [
      {
        role: 'system',
        content: 'You write short, warm, emoji-friendly captions for social media posts. Keep it under 15 words. Be positive and match the smile energy.',
      },
      {
        role: 'user',
        content: `Write a caption for a photo with ${description}. Smile intensity: ${Math.round(score * 100)}%.`,
      },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? 'Spreading smiles ✨';
}
