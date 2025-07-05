// This script adds sample content by directly inserting into the database using the existing database service
import { addQuestionToCentralDatabase } from './src/lib/databaseService';

async function addSampleContentViaAPI() {
  try {
    console.log('Adding sample content via database service...');
    
    // Sample content 1: Math Basics
    const mathQuestions = [
      {
        contentId: 'math-basics',
        questionText: 'What is 2 + 2?',
        answer: '4',
        points: 10,
        type: 'WSC' as const,
        questionType: 'multiple_choice' as const,
        cauTraLoi1: '3',
        cauTraLoi2: '4',
        cauTraLoi3: '5',
        cauTraLoi4: '6',
        correctChoice: 'B',
        topic: 'Mathematics',
        questionOrder: 1
      },
      {
        contentId: 'math-basics',
        questionText: 'What is 5 × 3?',
        answer: '15',
        points: 10,
        type: 'WSC' as const,
        questionType: 'multiple_choice' as const,
        cauTraLoi1: '12',
        cauTraLoi2: '15',
        cauTraLoi3: '18',
        cauTraLoi4: '20',
        correctChoice: 'B',
        topic: 'Mathematics',
        questionOrder: 2
      },
      {
        contentId: 'math-basics',
        questionText: 'What is the square root of 16?',
        answer: '4',
        points: 15,
        type: 'WSC' as const,
        questionType: 'text' as const,
        topic: 'Mathematics',
        questionOrder: 3
      }
    ];

    // Sample content 2: Science Quiz
    const scienceQuestions = [
      {
        contentId: 'science-basics',
        questionText: 'What is the chemical symbol for water?',
        answer: 'H2O',
        points: 10,
        type: 'WSC' as const,
        questionType: 'text' as const,
        topic: 'Science',
        questionOrder: 1
      },
      {
        contentId: 'science-basics',
        questionText: 'How many planets are in our solar system?',
        answer: '8',
        points: 10,
        type: 'WSC' as const,
        questionType: 'multiple_choice' as const,
        cauTraLoi1: '7',
        cauTraLoi2: '8',
        cauTraLoi3: '9',
        cauTraLoi4: '10',
        correctChoice: 'B',
        topic: 'Science',
        questionOrder: 2
      },
      {
        contentId: 'science-basics',
        questionText: 'What gas do plants absorb from the atmosphere?',
        answer: 'Carbon dioxide',
        points: 15,
        type: 'WSC' as const,
        questionType: 'multiple_choice' as const,
        cauTraLoi1: 'Oxygen',
        cauTraLoi2: 'Carbon dioxide',
        cauTraLoi3: 'Nitrogen',
        cauTraLoi4: 'Hydrogen',
        correctChoice: 'B',
        topic: 'Science',
        questionOrder: 3
      }
    ];

    // Sample content 3: History Quiz
    const historyQuestions = [
      {
        contentId: 'world-history',
        questionText: 'In which year did World War II end?',
        answer: '1945',
        points: 10,
        type: 'WSC' as const,
        questionType: 'multiple_choice' as const,
        cauTraLoi1: '1944',
        cauTraLoi2: '1945',
        cauTraLoi3: '1946',
        cauTraLoi4: '1947',
        correctChoice: 'B',
        topic: 'History',
        questionOrder: 1
      },
      {
        contentId: 'world-history',
        questionText: 'Who was the first President of the United States?',
        answer: 'George Washington',
        points: 10,
        type: 'WSC' as const,
        questionType: 'text' as const,
        topic: 'History',
        questionOrder: 2
      }
    ];

    // Insert all questions
    const allQuestions = [...mathQuestions, ...scienceQuestions, ...historyQuestions];
    
    for (const question of allQuestions) {
      try {
        const questionId = await addQuestionToCentralDatabase(question);
        console.log(`Added question: ${question.questionText} (ID: ${questionId})`);
      } catch (error) {
        console.error(`Failed to add question: ${question.questionText}`, error);
      }
    }

    console.log(`Successfully processed ${allQuestions.length} questions across 3 content groups:`);
    console.log('- math-basics (3 questions)');
    console.log('- science-basics (3 questions)');
    console.log('- world-history (2 questions)');
    
  } catch (error) {
    console.error('Error adding sample content:', error);
  }
}

addSampleContentViaAPI();
