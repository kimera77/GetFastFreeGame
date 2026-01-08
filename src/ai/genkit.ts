import {genkit} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/google-genai';

const googleAI = googleAIPlugin();

//const modelGenkit = 'googleai/gemini-2.5-flash';
export const modelGenkit = 'googleai/gemini-3-flash-preview';

export const ai = genkit({
  plugins: [googleAI],
  model: modelGenkit,
});
