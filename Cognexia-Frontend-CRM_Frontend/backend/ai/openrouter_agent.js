// backend/ai/openrouter_agent.js
import { OpenRouter } from '@henotic/openrouter';


export function createOpenRouterAgent(apiKey) {
  const client = new OpenRouter({ apiKey });

  return {
    ask: async (prompt) => {
      const response = await client.chat.completions.create({
        model: 'llama-4',
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content;
    }
  };
}
