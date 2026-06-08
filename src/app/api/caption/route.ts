import { NextRequest, NextResponse } from 'next/server';
import { generateCaption } from '@/lib/openai';
import type { SmileTier } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { score, tier } = await req.json() as { score: number; tier: SmileTier };
    const caption = await generateCaption(score, tier);
    return NextResponse.json({ caption });
  } catch {
    return NextResponse.json({ caption: 'Spreading smiles ✨' }, { status: 200 });
  }
}
