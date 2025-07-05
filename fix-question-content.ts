import { db } from './src/lib/database';
import { sql } from 'drizzle-orm';

async function fixQuestionContent() {
  try {
    console.log('Checking current questions...');
    
    // First, let's see what questions exist
    const existingQuestions = await db.execute(sql`
      SELECT id, noi_dung, cau_tra_loi_1, cau_tra_loi_2, cau_tra_loi_3, cau_tra_loi_4, correct_choice, contentid 
      FROM question 
      WHERE contentid IS NOT NULL 
      LIMIT 10
    `);
    
    console.log('Existing questions:', existingQuestions.rows);
    
    // Get content IDs
    const contentResult = await db.execute(sql`
      SELECT id, "Title" as name FROM content LIMIT 5
    `);
    
    console.log('Available content:', contentResult.rows);
    
    // Sample questions to add/update
    const sampleQuestions = [
      {
        questionText: "What is 2 + 2?",
        choices: ["3", "4", "5", "6"],
        correctChoice: "2",
        answer: "4"
      },
      {
        questionText: "What is the capital of France?",
        choices: ["London", "Paris", "Berlin", "Madrid"],
        correctChoice: "2",
        answer: "Paris"
      },
      {
        questionText: "Which planet is closest to the Sun?",
        choices: ["Venus", "Mercury", "Earth", "Mars"],
        correctChoice: "2",
        answer: "Mercury"
      },
      {
        questionText: "What is 10 × 5?",
        choices: ["45", "50", "55", "60"],
        correctChoice: "2",
        answer: "50"
      },
      {
        questionText: "What is the largest ocean on Earth?",
        choices: ["Atlantic", "Pacific", "Indian", "Arctic"],
        correctChoice: "2",
        answer: "Pacific"
      },
      {
        questionText: "How many sides does a triangle have?",
        choices: ["2", "3", "4", "5"],
        correctChoice: "2",
        answer: "3"
      },
      {
        questionText: "What gas do plants absorb from the atmosphere?",
        choices: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctChoice: "2",
        answer: "Carbon Dioxide"
      },
      {
        questionText: "What is the freezing point of water in Celsius?",
        choices: ["-1°C", "0°C", "1°C", "32°C"],
        correctChoice: "2",
        answer: "0°C"
      }
    ];
    
    // Update existing questions with proper content
    if (existingQuestions.rows.length > 0) {
      console.log('Updating existing questions with proper content...');
      
      for (let i = 0; i < Math.min(existingQuestions.rows.length, sampleQuestions.length); i++) {
        const existingQ = existingQuestions.rows[i] as any;
        const sampleQ = sampleQuestions[i];
        
        await db.execute(sql`
          UPDATE question 
          SET 
            noi_dung = ${sampleQ.questionText},
            cau_tra_loi_1 = ${sampleQ.choices[0]},
            cau_tra_loi_2 = ${sampleQ.choices[1]},
            cau_tra_loi_3 = ${sampleQ.choices[2]},
            cau_tra_loi_4 = ${sampleQ.choices[3]},
            correct_choice = ${sampleQ.correctChoice},
            answer = ${sampleQ.answer},
            question_type = 'multiple_choice'
          WHERE id = ${existingQ.id}
        `);
        
        console.log(`Updated question ${existingQ.id} with: "${sampleQ.questionText}"`);
      }
    }
    
    console.log('Questions updated successfully!');
    
    // Verify the updates
    const updatedQuestions = await db.execute(sql`
      SELECT id, noi_dung, cau_tra_loi_1, cau_tra_loi_2, correct_choice, answer 
      FROM question 
      WHERE contentid IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('Updated questions:', updatedQuestions.rows);
    
  } catch (error) {
    console.error('Error fixing question content:', error);
  }
}

fixQuestionContent();
