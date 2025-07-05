import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Input/Output schemas for content generation
export const GenerateContentInput = z.object({
  topicName: z.string(),
  topicSummary: z.string(),
  contentType: z.enum(['lesson', 'explanation', 'overview', 'tutorial']).optional(),
  targetAudience: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  customPrompt: z.string().optional(),
  useCustomPrompt: z.boolean().default(false),
});

export const GenerateContentOutput = z.object({
  title: z.string(),
  content: z.string(),
  summary: z.string(),
});

// Input/Output schemas for quiz generation
export const GenerateQuizInput = z.object({
  topicName: z.string(),
  topicSummary: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().min(1).max(20).optional(),
  questionTypes: z.array(z.enum(['multiple-choice', 'true-false', 'short-answer'])).optional(),
  customPrompt: z.string().optional(),
  useCustomPrompt: z.boolean().default(false),
});

export const GenerateQuizOutput = z.object({
  title: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    type: z.string(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string(),
    explanation: z.string().optional(),
  })),
});

export type GenerateContentInputType = z.infer<typeof GenerateContentInput>;
export type GenerateContentOutputType = z.infer<typeof GenerateContentOutput>;
export type GenerateQuizInputType = z.infer<typeof GenerateQuizInput>;
export type GenerateQuizOutputType = z.infer<typeof GenerateQuizOutput>;

// AI Service using LangChain with Google Gemini
class AIService {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY || 'AIzaSyBySYjAgY1bUi-jDB--M9JMgyjefx5Cnow',
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
  }

  private createContentPrompt(input: GenerateContentInputType): string {
    if (input.useCustomPrompt && input.customPrompt) {
      return `Topic: "${input.topicName}"
Topic Summary: ${input.topicSummary}

Custom Instructions: ${input.customPrompt}

Please generate educational content in markdown format that follows the custom instructions above while staying relevant to the topic. Include appropriate headings, bullet points, code blocks (if applicable), and other markdown formatting to make the content well-structured and easy to read.

The content should be engaging, informative, and suitable for educational purposes.`;
    }

    const contentType = input.contentType || 'lesson';
    const targetAudience = input.targetAudience || 'students';
    const length = input.length || 'medium';

    const lengthGuide = {
      short: '1-2 paragraphs with key points',
      medium: '3-5 paragraphs with detailed explanations',
      long: '6+ paragraphs with comprehensive coverage'
    };

    return `Create educational content about "${input.topicName}".

Topic Summary: ${input.topicSummary}
Content Type: ${contentType}
Target Audience: ${targetAudience}
Length: ${length} (${lengthGuide[length]})

Generate well-structured markdown content including:
- Clear headings and subheadings (use # ## ### appropriately)
- Bullet points and numbered lists where appropriate
- **Bold** and *italic* text for emphasis
- Code blocks for examples (if applicable)
- Tables for comparisons (if relevant)
- Blockquotes for important notes

Make the content engaging, educational, and easy to understand for ${targetAudience}. 
Format the response as clean markdown that can be easily displayed in a learning management system.

Focus on making the content practical and actionable while maintaining academic rigor.`;
  }

  private createQuizPrompt(input: GenerateQuizInputType): string {
    if (input.useCustomPrompt && input.customPrompt) {
      return `Topic: "${input.topicName}"
Topic Summary: ${input.topicSummary}

Custom Instructions: ${input.customPrompt}

Please generate quiz questions following the custom instructions above while staying relevant to the topic.

Return the response in this exact JSON format:
{
  "title": "Quiz title here",
  "questions": [
    {
      "question": "Question text here",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;
    }

    const difficulty = input.difficulty || 'medium';
    const questionCount = input.questionCount || 5;
    const questionTypes = input.questionTypes || ['multiple-choice'];

    return `Create a quiz about "${input.topicName}".

Topic Summary: ${input.topicSummary}
Difficulty: ${difficulty}
Number of Questions: ${questionCount}
Question Types: ${questionTypes.join(', ')}

Generate ${questionCount} quiz questions that test understanding of the topic. 
Make sure questions are at ${difficulty} difficulty level.

Return the response in this exact JSON format:
{
  "title": "Quiz: ${input.topicName}",
  "questions": [
    {
      "question": "Question text here",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Guidelines:
- For multiple-choice: Provide 4 options with one correct answer
- For true-false: Provide true/false options
- For short-answer: Provide the expected answer
- Include brief explanations for each question
- Make questions clear and unambiguous
- Test different aspects of the topic`;
  }

  async generateContent(input: GenerateContentInputType): Promise<GenerateContentOutputType> {
    try {
      // Validate input
      const validatedInput = GenerateContentInput.parse(input);
      
      const prompt = this.createContentPrompt(validatedInput);
      
      // Generate content using LangChain
      const response = await this.model.invoke(prompt);
      const content = response.content.toString();
      
      const contentType = validatedInput.contentType || 'lesson';
      const title = validatedInput.useCustomPrompt 
        ? `Custom Content: ${validatedInput.topicName}`
        : `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${validatedInput.topicName}`;

      return {
        title,
        content,
        summary: validatedInput.topicSummary,
      };
    } catch (error) {
      console.error('Content generation error:', error);
      throw new Error('Failed to generate content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async generateQuiz(input: GenerateQuizInputType): Promise<GenerateQuizOutputType> {
    try {
      // Validate input
      const validatedInput = GenerateQuizInput.parse(input);
      
      const prompt = this.createQuizPrompt(validatedInput);
      
      // Generate quiz using LangChain
      const response = await this.model.invoke(prompt);
      const responseText = response.content.toString();
      
      // Try to parse JSON response
      let quizData;
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
        quizData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse quiz JSON:', parseError);
        // Fallback: create a simple quiz structure
        quizData = {
          title: `Quiz: ${validatedInput.topicName}`,
          questions: [{
            question: `What is the main concept of ${validatedInput.topicName}?`,
            type: 'multiple-choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'This is a fallback question due to parsing error.'
          }]
        };
      }
      
      // Validate the generated quiz structure
      return GenerateQuizOutput.parse(quizData);
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error('Failed to generate quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Test method to verify the service is working
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testResponse = await this.model.invoke('Say "Hello from LangChain with Gemini!" if you can hear me.');
      return {
        success: true,
        message: testResponse.content.toString()
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
