import { NextRequest, NextResponse } from 'next/server';
import { aiService, GenerateContentInput } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedInput = GenerateContentInput.parse(body);
    
    // Generate content using LangChain
    const result = await aiService.generateContent(validatedInput);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Better error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to generate content', 
          details: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
