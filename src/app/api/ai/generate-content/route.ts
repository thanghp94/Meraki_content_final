import { NextRequest, NextResponse } from 'next/server';
import { generateContentFlow } from '@/ai/flows/generate-content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await generateContentFlow(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
