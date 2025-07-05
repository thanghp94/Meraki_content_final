import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY || 'AIzaSyBySYjAgY1bUi-jDB--M9JMgyjefx5Cnow'
    })
  ],
});
