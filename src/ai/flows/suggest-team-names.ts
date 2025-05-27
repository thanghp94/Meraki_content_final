'use server';
/**
 * @fileOverview A team name suggestion AI agent.
 *
 * - suggestTeamNames - A function that suggests team names based on a topic or theme.
 * - SuggestTeamNamesInput - The input type for the suggestTeamNames function.
 * - SuggestTeamNamesOutput - The return type for the suggestTeamNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTeamNamesInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or theme for which to suggest team names.'),
  numberOfTeams: z.number().describe('The number of team names to generate.'),
});
export type SuggestTeamNamesInput = z.infer<typeof SuggestTeamNamesInputSchema>;

const SuggestTeamNamesOutputSchema = z.object({
  teamNames: z
    .array(z.string())
    .describe('An array of suggested team names based on the topic.'),
});
export type SuggestTeamNamesOutput = z.infer<typeof SuggestTeamNamesOutputSchema>;

export async function suggestTeamNames(input: SuggestTeamNamesInput): Promise<SuggestTeamNamesOutput> {
  return suggestTeamNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTeamNamesPrompt',
  input: {schema: SuggestTeamNamesInputSchema},
  output: {schema: SuggestTeamNamesOutputSchema},
  prompt: `You are a creative team name generator. Generate {{numberOfTeams}} team names based on the topic: {{{topic}}}. The team names should be creative and engaging. Output the names in a JSON array.`,
});

const suggestTeamNamesFlow = ai.defineFlow(
  {
    name: 'suggestTeamNamesFlow',
    inputSchema: SuggestTeamNamesInputSchema,
    outputSchema: SuggestTeamNamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
