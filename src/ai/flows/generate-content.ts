import { ai } from '../genkit';
import { z } from 'zod';

export const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContent',
    inputSchema: z.object({
      topicName: z.string(),
      topicSummary: z.string(),
      contentType: z.enum(['lesson', 'explanation', 'overview', 'tutorial', 'custom']).optional(),
      targetAudience: z.string().optional(),
      length: z.enum(['short', 'medium', 'long']).optional(),
      customPrompt: z.string().optional(),
      useCustomPrompt: z.boolean().default(false),
    }),
    outputSchema: z.object({
      title: z.string(),
      content: z.string(),
      summary: z.string(),
    }),
  },
  async (input) => {
    let prompt: string;

    if (input.useCustomPrompt && input.customPrompt) {
      prompt = `Topic: "${input.topicName}"
Topic Summary: ${input.topicSummary}

Custom Instructions: ${input.customPrompt}

Please generate educational content in markdown format that follows the custom instructions above while staying relevant to the topic. Include appropriate headings, bullet points, code blocks (if applicable), and other markdown formatting to make the content well-structured and easy to read.`;
    } else {
      const contentType = input.contentType || 'lesson';
      const targetAudience = input.targetAudience || 'students';
      const length = input.length || 'medium';
      
      prompt = `Create educational content about "${input.topicName}".
    
Topic Summary: ${input.topicSummary}
Content Type: ${contentType}
Target Audience: ${targetAudience}
Length: ${length}

Generate well-structured markdown content including:
- Clear headings and subheadings
- Bullet points and numbered lists where appropriate
- Code blocks for examples (if applicable)
- Bold and italic text for emphasis
- Tables for comparisons (if relevant)

Format the response as educational content that can be easily displayed in a learning management system.`;
    }

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
    });

    const contentType = input.contentType || 'lesson';
    const title = input.useCustomPrompt 
      ? `Custom Content: ${input.topicName}`
      : `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${input.topicName}`;

    return {
      title,
      content: response.text,
      summary: input.topicSummary,
    };
  }
);
