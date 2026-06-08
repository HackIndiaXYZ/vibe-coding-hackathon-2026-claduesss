import OpenAI from 'openai';
import type { SmileTier } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCaption(score: number, tier: SmileTier): Promise<string> {
  const smilePercent = Math.round(score * 100);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    max_tokens: 120,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You generate social media post descriptions for SmileChain, a platform where smile intensity is a currency.
Respond only with valid JSON in this format:
{ "caption": "<your caption here>" }
Rules:
- Max 20 words
- Warm, fun, positive tone
- Match the energy of the smile score
- No hashtags`,
      },
      {
        role: 'user',
        content: `This person has a smile score of ${smilePercent}% (tier: ${tier}). Write a post description for their SmileChain post.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { caption?: string };
  return parsed.caption?.trim() ?? '';
}
