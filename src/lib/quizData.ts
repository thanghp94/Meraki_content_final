
import type { Topic, Question } from '@/types/quiz';

const commonPoints = 10;

const scienceQuestions: Question[] = Array.from({ length: 25 }, (_, i) => ({
  id: `sci_q${i + 1}`,
  questionText: `Grade 5 Science Question ${i + 1}: What is ...?`,
  answerText: `Answer for Science Question ${i + 1}`,
  points: commonPoints + (i % 3 * 5), // 10, 15, 20 points
  ...(i === 0 && { // Add media to the first question
    media: {
      url: 'https://placehold.co/600x400.png',
      type: 'image' as 'image',
      alt: 'Placeholder image for science question',
    }
  }),
  ...(i === 5 && { // Add media to another question
    media: {
      url: 'https://placehold.co/300x200.png',
      type: 'image' as 'image',
      alt: 'Another placeholder for science',
    }
  }),
}));

const historyQuestions: Question[] = Array.from({ length: 25 }, (_, i) => ({
  id: `hist_q${i + 1}`,
  questionText: `US History Trivia Question ${i + 1}: Who was ...?`,
  answerText: `Answer for History Question ${i + 1}`,
  points: commonPoints + (i % 3 * 10), // 10, 20, 30 points
  ...(i === 1 && { // Add media to the second question
    media: {
      url: 'https://placehold.co/600x400.png',
      type: 'image' as 'image',
      alt: 'Placeholder image for history question',
    }
  }),
}));

const mathQuestions: Question[] = Array.from({ length: 25 }, (_, i) => ({
  id: `math_q${i + 1}`,
  questionText: `Basic Math Question ${i + 1}: What is ${i+5} + ${i+2}?`,
  answerText: `The answer is ${ (i+5) + (i+2) }`,
  points: commonPoints,
  ...(i === 2 && { // Add media to the third question
    media: {
      url: 'https://placehold.co/400x300.png',
      type: 'image' as 'image',
      alt: 'Placeholder image for math question',
    }
  }),
}));


export const TOPICS: Topic[] = [
  {
    id: 'science-g5-ch3',
    name: 'Grade 5 Science - Chapter 3',
    questions: scienceQuestions.slice(0, 24), // Ensure enough for max grid size
  },
  {
    id: 'us-history-trivia',
    name: 'US History Trivia',
    questions: historyQuestions.slice(0, 24),
  },
  {
    id: 'basic-math-review',
    name: 'Basic Math Review',
    questions: mathQuestions.slice(0, 24),
  },
   {
    id: 'general-knowledge-15',
    name: 'General Knowledge (15 Qs)',
    // Create 15 unique questions for this topic
    questions: Array.from({ length: 15 }, (_, i) => ({
      id: `gk15_q${i + 1}`,
      questionText: `General Knowledge Question ${i + 1}: What is the capital of...?`,
      answerText: `Answer for GK Question ${i + 1}`,
      points: 10 + ((i % 5) * 5), // 10, 15, 20, 25, 30
      ...(i % 4 === 0 && { // Add media to some questions
        media: {
          url: `https://placehold.co/${600 + i*10}x${400 + i*5}.png`,
          type: 'image' as 'image',
          alt: `Placeholder for GK Q${i+1}`,
        }
      }),
    }))
  }
];

export const GRID_SIZES = [4, 6, 8, 15, 16, 24]; // Added 4 and 6 for smaller grids
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;
