import { ai } from '../genkit';
import { z } from 'zod';

const QuestionSchema = z.object({
  questionText: z.string(),
  questionType: z.enum(['multiple_choice', 'true_false']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  difficulty: z.string(),
  imageSearchTerm: z.string().optional(),
  points: z.number()
});

const GenerateQuizInputSchema = z.object({
  contentTitle: z.string(),
  contentText: z.string(),
  questionCount: z.number(),
  questionTypes: z.array(z.string()),
  difficulty: z.string(),
  gradeLevel: z.string().optional(),
  customInstructions: z.string().optional()
});

const GenerateQuizOutputSchema = z.array(QuestionSchema);

export const generateQuiz = ai.defineFlow(
  {
    name: 'generateQuiz',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { contentTitle, contentText, questionCount, questionTypes, difficulty, gradeLevel, customInstructions } = input;
    
    const prompt = `You are an educational quiz generator. Generate ${questionCount} quiz questions based on this content:

Title: ${contentTitle}
Content: ${contentText}
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}

Requirements:
- Create questions of types: ${questionTypes.join(', ')}
- Difficulty level: ${difficulty}
- For multiple choice: provide 4 options with 1 correct answer
- Include educational explanations
- For each question, suggest an image search term that would enhance the question visually
- Ensure questions test comprehension and critical thinking
- Make questions engaging and relevant to the content
${gradeLevel ? `- Adjust language and complexity appropriate for ${gradeLevel}` : ''}

${customInstructions ? `Additional Instructions:
${customInstructions}

Please follow these custom instructions carefully when generating questions.` : ''}

Return ONLY a valid JSON array of questions with this exact structure:
[
  {
    "questionText": "What is...",
    "questionType": "multiple_choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "The answer is Option A because...",
    "difficulty": "${difficulty}",
    "imageSearchTerm": "relevant search term",
    "points": 10
  }
]`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const generatedText = response.text;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  }
);
