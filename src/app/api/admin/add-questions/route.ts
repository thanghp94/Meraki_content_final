import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { questions } from '@/lib/schema';
import { sql } from 'drizzle-orm';

const questionTemplates = [
  {
    title: "What is the capital of France?",
    type: "multiple_choice",
    answers: ["Paris", "London", "Berlin", "Madrid"],
    correct: "0"
  },
  {
    title: "The Earth is round.",
    type: "true_false", 
    answers: ["True", "False", "", ""],
    correct: "0"
  },
  {
    title: "What is 5 + 5?",
    type: "multiple_choice",
    answers: ["8", "9", "10", "11"],
    correct: "2"
  },
  {
    title: "Water boils at 100°C at sea level.",
    type: "true_false",
    answers: ["True", "False", "", ""],
    correct: "0"
  },
  {
    title: "Which planet is closest to the Sun?",
    type: "multiple_choice",
    answers: ["Venus", "Mercury", "Earth", "Mars"],
    correct: "1"
  },
  {
    title: "A triangle has four sides.",
    type: "true_false",
    answers: ["True", "False", "", ""],
    correct: "1"
  },
  {
    title: "What is the largest ocean on Earth?",
    type: "multiple_choice",
    answers: ["Atlantic", "Pacific", "Indian", "Arctic"],
    correct: "1"
  },
  {
    title: "Photosynthesis occurs in plants.",
    type: "true_false",
    answers: ["True", "False", "", ""],
    correct: "0"
  }
];

export async function POST() {
  try {
    // Get all content IDs and their current question counts
    const result = await db.execute<{
      content_id: string;
      question_count: number;
      program_type: string;
    }>(sql`
      SELECT 
        contentid as content_id,
        COUNT(*) as question_count,
        COALESCE(MAX(chuong_trinh), 'General Program') as program_type
      FROM question 
      WHERE contentid IS NOT NULL AND contentid != '' 
      GROUP BY contentid
    `);

    let totalAdded = 0;

    for (const row of result.rows) {
      const contentId = row.content_id as string;
      const currentCount = Number(row.question_count);
      const questionsToAdd = Math.max(0, 8 - currentCount);

      if (questionsToAdd > 0) {
        console.log(`Adding ${questionsToAdd} questions to content ${contentId}`);

        for (let i = 0; i < questionsToAdd; i++) {
          const template = questionTemplates[i % questionTemplates.length];
          const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await db.insert(questions).values({
            id: questionId,
            contentId: contentId,
            questionType: template.type,
            chuongTrinh: row.program_type as string,
            questionLevel: 'medium',
            noiDung: `${template.title}`,
            cauTraLoi1: template.answers[0],
            cauTraLoi2: template.answers[1],
            cauTraLoi3: template.answers[2] || null,
            cauTraLoi4: template.answers[3] || null,
            correctChoice: template.correct,
            time: '30',
            explanation: `This is the explanation for: ${template.title}`,
            tgTao: new Date().toISOString(),
          });
          
          totalAdded++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${totalAdded} questions`,
      contentProcessed: result.rows.length
    });

  } catch (error) {
    console.error('Error adding questions:', error);
    return NextResponse.json(
      { error: 'Failed to add questions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
