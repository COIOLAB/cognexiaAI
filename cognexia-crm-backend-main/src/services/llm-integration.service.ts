import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LLMConversation } from '../entities/llm-conversation.entity';
import { LLMMessage } from '../entities/llm-message.entity';
import { LLMAnalysis } from '../entities/llm-analysis.entity';
import { GeneratedContent } from '../entities/generated-content.entity';
import { LLMModel } from '../entities/llm-model.entity';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class LLMIntegrationService {
  private readonly groqClient: Groq | null;
  private readonly groqModel: string;
  private readonly geminiApiKey: string;
  private readonly geminiModel: string;
  private readonly openRouterApiKey: string;
  private readonly openRouterModel: string;
  private readonly togetherApiKey: string;
  private readonly togetherModel: string;
  private readonly fireworksApiKey: string;
  private readonly fireworksModel: string;
  private readonly deepInfraApiKey: string;
  private readonly deepInfraModel: string;
  private readonly mistralApiKey: string;
  private readonly mistralModel: string;
  private readonly providerOrder: Array<
    'groq' | 'gemini' | 'openrouter' | 'together' | 'fireworks' | 'deepinfra' | 'mistral'
  >;

  constructor(
    @InjectRepository(LLMConversation)
    private conversationRepo: Repository<LLMConversation>,
    @InjectRepository(LLMMessage)
    private messageRepo: Repository<LLMMessage>,
    @InjectRepository(LLMAnalysis)
    private analysisRepo: Repository<LLMAnalysis>,
    @InjectRepository(GeneratedContent)
    private contentRepo: Repository<GeneratedContent>,
    @InjectRepository(LLMModel)
    private modelRepo: Repository<LLMModel>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {
    const apiKey = process.env.GROQ_API_KEY || '';
    this.groqClient = apiKey ? new Groq({ apiKey }) : null;
    this.groqModel = process.env.GROQ_MODEL || 'llama3-8b-8192';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
    this.togetherApiKey = process.env.TOGETHER_API_KEY || '';
    this.togetherModel = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.1-8B-Instruct-Turbo';
    this.fireworksApiKey = process.env.FIREWORKS_API_KEY || '';
    this.fireworksModel = process.env.FIREWORKS_MODEL || 'accounts/fireworks/models/llama-v3-8b-instruct';
    this.deepInfraApiKey = process.env.DEEPINFRA_API_KEY || '';
    this.deepInfraModel = process.env.DEEPINFRA_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct';
    this.mistralApiKey = process.env.MISTRAL_API_KEY || '';
    this.mistralModel = process.env.MISTRAL_MODEL || 'mistral-small-latest';
    const order = (process.env.LLM_PROVIDER_ORDER || 'groq,gemini,openrouter,together,fireworks,deepinfra,mistral')
      .split(',')
      .map((provider) => provider.trim().toLowerCase())
      .filter(Boolean);
    this.providerOrder = order.filter((provider) =>
      ['groq', 'gemini', 'openrouter', 'together', 'fireworks', 'deepinfra', 'mistral'].includes(provider),
    ) as Array<'groq' | 'gemini' | 'openrouter' | 'together' | 'fireworks' | 'deepinfra' | 'mistral'>;
  }

  private hasAnyProvider(): boolean {
    return Boolean(
      this.groqClient ||
        this.geminiApiKey ||
        this.openRouterApiKey ||
        this.togetherApiKey ||
        this.fireworksApiKey ||
        this.deepInfraApiKey ||
        this.mistralApiKey,
    );
  }

  private getProviderOrder(preferredProvider?: string) {
    const normalized = preferredProvider?.toLowerCase();
    if (normalized && ['groq', 'gemini', 'openrouter', 'together', 'fireworks', 'deepinfra', 'mistral'].includes(normalized)) {
      return [
        normalized as 'groq' | 'gemini' | 'openrouter' | 'together' | 'fireworks' | 'deepinfra' | 'mistral',
        ...this.providerOrder,
      ];
    }
    return this.providerOrder;
  }

  private async generateChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    preferredProvider?: string,
  ): Promise<{ text: string; provider: string; model: string }> {
    const providers = this.getProviderOrder(preferredProvider);
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        if (provider === 'groq' && this.groqClient) {
          const completion = await this.groqClient.chat.completions.create({
            model: this.groqModel,
            messages,
          });
          const text = completion.choices?.[0]?.message?.content?.trim() || '';
          return { text, provider: 'groq', model: this.groqModel };
        }

        if (provider === 'gemini' && this.geminiApiKey) {
          const systemMessage = messages.find((msg) => msg.role === 'system')?.content;
          const contents = messages
            .filter((msg) => msg.role !== 'system')
            .map((msg) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            }));
          const payload = {
            contents,
            ...(systemMessage
              ? { system_instruction: { parts: [{ text: systemMessage }] } }
              : {}),
          };
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
            payload,
          );
          const text =
            response.data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join('') ||
            '';
          return { text: text.trim(), provider: 'gemini', model: this.geminiModel };
        }

        if (provider === 'openrouter' && this.openRouterApiKey) {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: this.openRouterModel,
              messages,
            },
            {
              headers: {
                Authorization: `Bearer ${this.openRouterApiKey}`,
                'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'http://localhost',
                'X-Title': process.env.OPENROUTER_APP_NAME || 'CognexiaAI ERP',
              },
            },
          );
          const text = response.data?.choices?.[0]?.message?.content?.trim() || '';
          return { text, provider: 'openrouter', model: this.openRouterModel };
        }

        if (provider === 'together' && this.togetherApiKey) {
          const response = await axios.post(
            'https://api.together.xyz/v1/chat/completions',
            {
              model: this.togetherModel,
              messages,
            },
            {
              headers: {
                Authorization: `Bearer ${this.togetherApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          );
          const text = response.data?.choices?.[0]?.message?.content?.trim() || '';
          return { text, provider: 'together', model: this.togetherModel };
        }

        if (provider === 'fireworks' && this.fireworksApiKey) {
          const response = await axios.post(
            'https://api.fireworks.ai/inference/v1/chat/completions',
            {
              model: this.fireworksModel,
              messages,
            },
            {
              headers: {
                Authorization: `Bearer ${this.fireworksApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          );
          const text = response.data?.choices?.[0]?.message?.content?.trim() || '';
          return { text, provider: 'fireworks', model: this.fireworksModel };
        }

        if (provider === 'deepinfra' && this.deepInfraApiKey) {
          const response = await axios.post(
            'https://api.deepinfra.com/v1/openai/chat/completions',
            {
              model: this.deepInfraModel,
              messages,
            },
            {
              headers: {
                Authorization: `Bearer ${this.deepInfraApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          );
          const text = response.data?.choices?.[0]?.message?.content?.trim() || '';
          return { text, provider: 'deepinfra', model: this.deepInfraModel };
        }

        if (provider === 'mistral' && this.mistralApiKey) {
          const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
              model: this.mistralModel,
              messages,
            },
            {
              headers: {
                Authorization: `Bearer ${this.mistralApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          );
          const text = response.data?.choices?.[0]?.message?.content?.trim() || '';
          return { text, provider: 'mistral', model: this.mistralModel };
        }
      } catch (error: any) {
        lastError = error;
        console.error(`LLM provider ${provider} failed:`, error?.message || error);
      }
    }

    if (lastError) {
      console.error('All LLM providers failed. Returning fallback response.');
    }
    return { text: '', provider: 'unavailable', model: 'unavailable' };
  }

  async startConversation(data: any, organizationId: string) {
    try {
      const { customerId, ...rest } = data || {};
      let safeCustomerId: string | null | undefined = customerId;

      if (customerId) {
        const customerExists = await this.customerRepo.findOne({ where: { id: customerId } });
        if (!customerExists) {
          safeCustomerId = null;
        }
      }

      const conversation = this.conversationRepo.create({
        ...rest,
        organizationId,
        customerId: safeCustomerId,
        startedAt: new Date(),
        model:
          data.model ||
          this.groqModel ||
          this.geminiModel ||
          this.openRouterModel ||
          this.togetherModel ||
          this.fireworksModel ||
          this.deepInfraModel ||
          this.mistralModel ||
          'unknown',
        messageCount: 0,
        status: 'ACTIVE',
        metadata: {
          ...(data?.metadata || {}),
          ...(customerId && !safeCustomerId ? { customerWarning: 'Customer not found; saved without customer.' } : {}),
        },
      });
      return await this.conversationRepo.save(conversation);
    } catch (error) {
      console.error('Error starting conversation:', error.message);
      throw new Error(`Failed to start conversation: ${error.message}`);
    }
  }

  async sendMessage(conversationId: string, message: string, role: string, organizationId: string) {
    try {
      // Verify conversation exists first
      const conversation = await this.conversationRepo.findOne({ where: { id: conversationId, organizationId } });
      if (!conversation) {
        return null; // Return null to let controller handle 404
      }
      
      const msg = this.messageRepo.create({
        conversationId,
        content: message || '',
        role: role || 'user',
        organizationId,
        timestamp: new Date(),
      });
      
      await this.conversationRepo.update({ id: conversationId, organizationId }, {
        messageCount: () => '"messageCount" + 1',
      });

      const savedUserMessage = await this.messageRepo.save(msg);

      if (!this.hasAnyProvider()) {
        return savedUserMessage;
      }

      const completion = await this.generateChatCompletion(
        [
          {
            role: 'system',
            content: 'You are a helpful business assistant for CRM users.',
          },
          { role: 'user', content: message || '' },
        ],
        conversation?.model,
      );

      const assistantText = completion.text || '';
      const assistantMessage = this.messageRepo.create({
        conversationId,
        content: assistantText,
        role: 'assistant',
        organizationId,
        timestamp: new Date(),
      });

      await this.conversationRepo.update({ id: conversationId, organizationId }, {
        messageCount: () => '"messageCount" + 1',
      });

      return await this.messageRepo.save(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async getConversation(id: string, organizationId: string) {
    return this.conversationRepo.findOne({ where: { id, organizationId } });
  }

  async generateContent(prompt: string, contentType: string, organizationId: string) {
    try {
      if (!this.hasAnyProvider()) {
        throw new Error('No LLM provider API keys configured');
      }

      const systemPrompt = contentType
        ? `You are an expert ${contentType} copywriter. Provide concise, high-quality output.`
        : 'You are an expert copywriter. Provide concise, high-quality output.';

      const completion = await this.generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt || 'Generate content' },
      ]);

      const generatedText = completion.text || '';

      const content = this.contentRepo.create({
        prompt: prompt || 'Default prompt',
        contentType: contentType || 'text',
        generatedText: generatedText || `Generated response for: ${prompt || 'default'}`,
        model: completion.model,
        organizationId,
        usageCount: 0,
      });
      return await this.contentRepo.save(content);
    } catch (error) {
      console.error('Error generating content:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async analyzeData(entityType: string, entityId: string, analysisType: string, organizationId: string) {
    try {
      const analysis = this.analysisRepo.create({
        entityType: entityType || 'unknown',
        entityId: entityId || 'unknown',
        analysisType: analysisType || 'general',
        results: { summary: 'Analysis complete', insights: [] },
        confidence: 85,
        organizationId,
      });
      return await this.analysisRepo.save(analysis);
    } catch (error) {
      console.error('Error analyzing data:', error.message);
      throw new Error(`Failed to analyze data: ${error.message}`);
    }
  }

  async analyzeSentiment(customerId: string, organizationId: string) {
    return { customerId, sentiment: 'positive', score: 0.82 };
  }

  async generateEmailCopy(data: any, organizationId: string) {
    if (!this.hasAnyProvider()) {
      return { subject: 'Generated Subject', body: 'Generated email body', tone: data.tone };
    }
    const tone = data?.tone || 'professional';
    const prompt = `Write a concise sales email in a ${tone} tone. Include subject and body.`;
    const completion = await this.generateChatCompletion([
      { role: 'system', content: 'You generate sales email copy.' },
      { role: 'user', content: prompt },
    ]);
    return { subject: 'Generated Subject', body: completion.text, tone };
  }

  async summarizeText(text: string, organizationId: string) {
    try {
      if (!this.hasAnyProvider()) {
        return { summary: `Summary of: ${text.substring(0, 50)}...` };
      }
      const completion = await this.generateChatCompletion([
        { role: 'system', content: 'Summarize the following text in 2-3 sentences.' },
        { role: 'user', content: text || '' },
      ]);
      return { summary: completion.text };
    } catch (error) {
      console.error('Error summarizing text:', error.message);
      return null;
    }
  }

  async getModels(organizationId: string) {
    const models: Array<any> = [];
    if (this.groqClient) {
      models.push({
        id: this.groqModel,
        name: this.groqModel,
        provider: 'groq',
        organizationId,
        isActive: true,
      });
    }
    if (this.geminiApiKey) {
      models.push({
        id: this.geminiModel,
        name: this.geminiModel,
        provider: 'gemini',
        organizationId,
        isActive: true,
      });
    }
    if (this.openRouterApiKey) {
      models.push({
        id: this.openRouterModel,
        name: this.openRouterModel,
        provider: 'openrouter',
        organizationId,
        isActive: true,
      });
    }
    if (this.togetherApiKey) {
      models.push({
        id: this.togetherModel,
        name: this.togetherModel,
        provider: 'together',
        organizationId,
        isActive: true,
      });
    }
    if (this.fireworksApiKey) {
      models.push({
        id: this.fireworksModel,
        name: this.fireworksModel,
        provider: 'fireworks',
        organizationId,
        isActive: true,
      });
    }
    if (this.deepInfraApiKey) {
      models.push({
        id: this.deepInfraModel,
        name: this.deepInfraModel,
        provider: 'deepinfra',
        organizationId,
        isActive: true,
      });
    }
    if (this.mistralApiKey) {
      models.push({
        id: this.mistralModel,
        name: this.mistralModel,
        provider: 'mistral',
        organizationId,
        isActive: true,
      });
    }
    if (models.length > 0) {
      return models;
    }
    return this.modelRepo.find({ where: { organizationId } });
  }
}
