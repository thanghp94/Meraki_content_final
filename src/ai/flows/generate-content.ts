import { ai } from '../genkit';
import { z } from 'zod';

export const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContent',
    inputSchema: z.object({
      topicName: z.string(),
      topicSummary: z.string(),
      contentType: z.enum(['lesson', 'explanation', 'overview', 'tutorial', 'custom']),
      targetAudience: z.string(),
      length: z.enum(['short', 'medium', 'long']),
      customPrompt: z.string().optional(), // NEW: Custom prompt field
      useCustomPrompt: z.boolean().default(false), // NEW: Toggle for custom prompt
    }),
    outputSchema: z.object({
      title: z.string(),
      content: z.string(), // Markdown formatted
      summary: z.string(),
    }),
  },
  async (input: {
    topicName: string;
    topicSummary: string;
    contentType: 'lesson' | 'explanation' | 'overview' | 'tutorial' | 'custom';
    targetAudience: string;
    length: 'short' | 'medium' | 'long';
    customPrompt?: string;
    useCustomPrompt?: boolean;
  }) => {
    let prompt: string;

    if (input.useCustomPrompt && input.customPrompt) {
      // Use custom prompt with topic context
      prompt = `Topic: "${input.topicName}"
Topic Summary: ${input.topicSummary}

Custom Instructions: ${input.customPrompt}

Please generate educational content in markdown format that follows the custom instructions above while staying relevant to the topic. Include appropriate headings, bullet points, code blocks (if applicable), and other markdown formatting to make the content well-structured and easy to read.`;
    } else {
      // Use default structured prompt
      prompt = `Create educational content about "${input.topicName}".
    
Topic Summary: ${input.topicSummary}
Content Type: ${input.contentType}
Target Audience: ${input.targetAudience}
Length: ${input.length}

Generate well-structured markdown content including:
- Clear headings and subheadings
- Bullet points and numbered lists where appropriate
- Code blocks for examples (if applicable)
- Bold and italic text for emphasis
- Tables for comparisons (if relevant)

Format the response as educational content that can be easily displayed in a learning management system.`;
    }

    const response = await ai.generate({
      prompt,
    });

    const title = input.useCustomPrompt 
      ? `Custom Content: ${input.topicName}`
      : `${input.contentType.charAt(0).toUpperCase() + input.contentType.slice(1)}: ${input.topicName}`;

    return {
      title,
      content: response.text,
      summary: input.topicSummary,
    };
  }
);
