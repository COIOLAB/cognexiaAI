import { OpenAI } from "langchain/llms/openai";
import { LLMChain, PromptTemplate } from "langchain";
import { generateCode } from "./openrouter_agent.js";
import connectPrompts from "./prompts/connect.json" assert { type: "json" };

export function createERPChain() {
  const llama4 = new OpenAI({
    modelName: "llama-4-maverick",
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: "https://api.openrouter.ai/v1"
  });

  const promptTemplate = new PromptTemplate({
    inputVariables: ["instruction"],
    template: "{instruction}"
  });

  // Wrap LangChain with OpenRouter fallback
  return {
    call: async ({ instruction }) => {
      try {
        // Try via LangChain
        const chain = new LLMChain({ llm: llama4, prompt: promptTemplate });
        return await chain.call({ instruction });
      } catch (err) {
        console.warn("LangChain failed, using OpenRouter API", err);
        return await generateCode(instruction); // fallback
      }
    }
  };
}
