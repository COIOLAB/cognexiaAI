
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private groq: Groq;
  private readonly model = 'llama-3.1-8b-instant'; // Using Llama 3.1 8B Instant for speed and efficiency

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not set. LLM features will be disabled or mocked.');
    }

    this.groq = new Groq({
      apiKey: apiKey || 'dummy-key', // Prevent crash on init if key is missing, handle errors at runtime
    });
  }

  /**
   * Generate a chat response using the LLM
   */
  async generateChatResponse(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    temperature: number = 0.7
  ): Promise<string> {
    if (!this.configService.get<string>('GROQ_API_KEY')) {
      return "I'm sorry, but I haven't been configured with an API key yet. Please check the system configuration.";
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: temperature,
        max_tokens: 1024,
      });

      return completion.choices[0]?.message?.content || "I couldn't generate a response.";
    } catch (error) {
      this.logger.error(`Error generating chat response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze sentiment of a given text
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    analysis: string;
  }> {
    if (!this.configService.get<string>('GROQ_API_KEY')) {
      return { sentiment: 'neutral', score: 0, analysis: 'LLM not configured' };
    }

    try {
      const prompt = `Analyze the sentiment of the following text. Return a JSON object with the following fields:
      - sentiment: "positive", "neutral", or "negative"
      - score: a number between -1 (negative) and 1 (positive)
      - analysis: a brief explanation of the sentiment

      Text: "${text}"
      
      JSON Response:`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.1, // Low temperature for consistent output
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No content received from LLM');

      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Error analyzing sentiment: ${error.message}`);
      // Fallback
      return { sentiment: 'neutral', score: 0, analysis: 'Error in analysis' };
    }
  }

  /**
   * Generic text analysis or generation
   */
  async generateCompletion(prompt: string): Promise<string> {
    if (!this.configService.get<string>('GROQ_API_KEY')) {
      return "LLM Service not configured.";
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error(`Error generating completion: ${error.message}`);
      throw error;
    }
  }
}
