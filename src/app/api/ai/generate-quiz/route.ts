import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface GeneratedQuestion {
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  imageSearchTerm?: string;
  suggestedImage?: string;
  selectedImage?: string;
  points: number;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { 
    contentId, 
    questionCount = 5, 
    questionTypes, 
    difficulty = 'medium',
    gradeLevel,
    customInstructions 
  } = body;

  // Fetch content data
  const contentResult = await db.execute(sql`
    SELECT "Title", infor1, infor2 FROM content WHERE id = ${contentId}
  `);

  if (contentResult.rows.length === 0) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  const content = contentResult.rows[0];
  const contentText = `${content.infor1 || ''} ${content.infor2 || ''}`.trim();

  try {
    // Convert existing question type formats to LangChain formats
    const convertedQuestionTypes = questionTypes?.map((type: string) => 
      type.replace('_', '-') // Convert 'multiple_choice' to 'multiple-choice'
    ) as ('multiple-choice' | 'true-false' | 'short-answer')[];

    // Generate questions using LangChain AI service
    const quizResult = await aiService.generateQuiz({
      topicName: content.Title as string,
      topicSummary: contentText,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      questionCount,
      questionTypes: convertedQuestionTypes,
      customPrompt: customInstructions,
      useCustomPrompt: !!customInstructions
    });

    // Convert LangChain format to existing format
    const questions = quizResult.questions.map(q => ({
      questionText: q.question,
      questionType: q.type.replace('-', '_'), // Convert 'multiple-choice' to 'multiple_choice'
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: difficulty,
      imageSearchTerm: `${content.Title} ${q.question.split(' ').slice(0, 3).join(' ')}`,
      points: difficulty === 'easy' ? 5 : difficulty === 'hard' ? 15 : 10
    }));

    // Auto-search images for questions that need them
    const questionsWithImages = await Promise.all(
      questions.map(async (question: GeneratedQuestion) => {
        if (question.imageSearchTerm) {
          try {
            const imageResponse = await fetch(
              `http://localhost:9002/api/search-images?q=${encodeURIComponent(question.imageSearchTerm)}&source=google`
            );
            const imageData = await imageResponse.json();
            const firstImage = imageData.results?.[0];
            
            return {
              ...question,
              suggestedImage: firstImage?.url,
              imageSearchTerm: question.imageSearchTerm
            };
          } catch (error) {
            console.error('Image search failed:', error);
            return question;
          }
        }
        return question;
      })
    );

    return NextResponse.json({ 
      questions: questionsWithImages,
      contentId,
      contentTitle: content.Title 
    });

  } catch (error) {
    console.error('Failed to generate questions:', error);
    
    // Create better fallback questions based on actual content
    const fallbackQuestions = [
      {
        questionText: `Based on the content about "${content.Title}", what is the main concept discussed?`,
        questionType: "multiple_choice",
        options: [
          "The primary topic covered in the material",
          "A secondary supporting detail", 
          "An unrelated concept",
          "Background information only"
        ],
        correctAnswer: "The primary topic covered in the material",
        explanation: `This question tests understanding of the main concept in "${content.Title}".`,
        difficulty: difficulty,
        imageSearchTerm: `${content.Title} concept`,
        points: 10
      },
      {
        questionText: `True or False: The content "${content.Title}" provides educational information relevant to the topic.`,
        questionType: "true_false",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: `Based on the educational content provided about "${content.Title}".`,
        difficulty: difficulty,
        imageSearchTerm: `${content.Title} education`,
        points: 10
      },
      {
        questionText: `What key information can be learned from studying "${content.Title}"?`,
        questionType: "short_answer",
        correctAnswer: "Key concepts and principles related to the topic",
        explanation: `This question assesses comprehension of the material in "${content.Title}".`,
        difficulty: difficulty,
        imageSearchTerm: `${content.Title} learning`,
        points: 15
      }
    ].slice(0, questionCount);

    return NextResponse.json({ 
      questions: fallbackQuestions,
      contentId,
      contentTitle: content.Title,
      note: "Using enhanced fallback questions - AI service temporarily unavailable"
    });
  }
}

// Save approved questions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, questions } = body;

    // Save approved questions to database
    const savedQuestions = [];
    
    for (const question of questions as GeneratedQuestion[]) {
      const questionId = uuidv4();
      
      await db.execute(sql`
        INSERT INTO question (
          id, contentid, noi_dung, question_type, 
          cau_tra_loi_1, cau_tra_loi_2, cau_tra_loi_3, cau_tra_loi_4,
          correct_choice, explanation, picture, time, tg_tao
        ) VALUES (
          ${questionId}, ${contentId}, ${question.questionText}, ${question.questionType},
          ${question.options?.[0] || ''}, ${question.options?.[1] || ''}, 
          ${question.options?.[2] || ''}, ${question.options?.[3] || ''},
          ${question.correctAnswer}, ${question.explanation}, 
          ${question.selectedImage || ''}, ${question.points * 3 || 30}, NOW()
        )
      `);
      
      savedQuestions.push({ id: questionId, ...question });
    }

    return NextResponse.json({ 
      message: `Successfully saved ${savedQuestions.length} questions`,
      questions: savedQuestions 
    });

  } catch (error) {
    console.error('Failed to save questions:', error);
    return NextResponse.json(
      { error: 'Failed to save questions' },
      { status: 500 }
    );
  }
}
