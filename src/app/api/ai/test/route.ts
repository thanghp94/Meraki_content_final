import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function GET() {
  try {
    // Test the connection
    const connectionTest = await aiService.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        status: 'error',
        message: 'AI service connection failed',
        details: connectionTest.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'LangChain with Gemini API is working!',
      response: connectionTest.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'content' } = body;

    if (testType === 'content') {
      // Test content generation
      const result = await aiService.generateContent({
        topicName: 'Test Topic',
        topicSummary: 'This is a test topic for verifying LangChain integration',
        contentType: 'lesson',
        targetAudience: 'students',
        length: 'short',
        useCustomPrompt: false
      });

      return NextResponse.json({
        status: 'success',
        testType: 'content',
        result,
        timestamp: new Date().toISOString()
      });
    } else if (testType === 'quiz') {
      // Test quiz generation
      const result = await aiService.generateQuiz({
        topicName: 'Test Topic',
        topicSummary: 'This is a test topic for verifying quiz generation',
        difficulty: 'medium',
        questionCount: 2,
        questionTypes: ['multiple-choice', 'true-false'],
        useCustomPrompt: false
      });

      return NextResponse.json({
        status: 'success',
        testType: 'quiz',
        result,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid test type. Use "content" or "quiz"'
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
