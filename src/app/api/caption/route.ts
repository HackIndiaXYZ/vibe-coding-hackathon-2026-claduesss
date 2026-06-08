import { NextRequest, NextResponse } from 'next/server';
import { generateCaption } from '@/lib/openai';
import type { SmileTier } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { score, tier } = await req.json() as { score: number; tier: SmileTier };
    const caption = await generateCaption(score, tier);
    return NextResponse.json({ caption });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[caption] OpenAI error:', message);
    return NextResponse.json({ caption: null, error: message }, { status: 500 });
  }
}
