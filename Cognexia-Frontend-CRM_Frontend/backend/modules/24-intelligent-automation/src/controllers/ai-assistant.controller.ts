// Industry 5.0 ERP Backend - Hyper-Intelligent AI Assistant Controller
// Revolutionary conversational AI with manufacturing intelligence and collaboration capabilities
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Server, Socket } from 'socket.io';

import { HyperIntelligentAssistantService } from '../services/hyper-intelligent-assistant.service';
import { ContextualIntelligenceService } from '../services/contextual-intelligence.service';
import { ConversationalAIService } from '../services/conversational-ai.service';
import { ManufacturingKnowledgeService } from '../services/manufacturing-knowledge.service';
import { IntelligentAutomationGuard } from '../guards/intelligent-automation.guard';

// DTOs for AI Assistant
export class ConversationRequestDto {
  message: string;
  context: {
    userId: string;
    sessionId?: string;
    currentModule?: string;
    currentView?: string;
    recentActions?: string[];
    environmentalData?: Record<string, any>;
    urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  intent?: 'QUERY' | 'COMMAND' | 'GUIDANCE' | 'TROUBLESHOOT' | 'ANALYZE' | 'PREDICT';
  preferredResponseStyle?: 'BRIEF' | 'DETAILED' | 'TECHNICAL' | 'VISUAL' | 'STEP_BY_STEP';
  multimodal?: {
    includeVisuals?: boolean;
    includeAudio?: boolean;
    includeInteractiveElements?: boolean;
  };
}

export class ProactiveInsightRequestDto {
  targetAudience: 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ENGINEER' | 'EXECUTIVE';
  focusAreas: ('PRODUCTION' | 'QUALITY' | 'MAINTENANCE' | 'EFFICIENCY' | 'SAFETY' | 'COST')[];
  timeHorizon: 'IMMEDIATE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER';
  includeRecommendations: boolean;
  contextFilters?: {
    departmentId?: string;
    equipmentIds?: string[];
    processIds?: string[];
    shiftPatterns?: string[];
  };
}

export class ManufacturingGuidanceDto {
  taskType: 'SETUP' | 'OPERATION' | 'TROUBLESHOOTING' | 'MAINTENANCE' | 'QUALITY_CHECK' | 'OPTIMIZATION';
  equipmentId?: string;
  processId?: string;
  operatorExperienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  currentSituation: {
    description: string;
    symptoms?: string[];
    measurements?: Record<string, number>;
    previousActions?: string[];
  };
  preferredGuidanceFormat: 'TEXT' | 'VISUAL' | 'AUDIO' | 'AR_OVERLAY' | 'INTERACTIVE';
}

export class KnowledgeQueryDto {
  query: string;
  knowledgeDomains: ('TECHNICAL' | 'PROCEDURAL' | 'REGULATORY' | 'BEST_PRACTICES' | 'HISTORICAL')[];
  searchDepth: 'SURFACE' | 'COMPREHENSIVE' | 'EXHAUSTIVE';
  includeRelatedTopics: boolean;
  personalizeForUser: boolean;
  contextualRelevance?: {
    currentTask?: string;
    equipmentContext?: string;
    processContext?: string;
    timeContext?: string;
  };
}

@ApiTags('Hyper-Intelligent AI Assistant')
@Controller('intelligent-automation/ai-assistant')
@WebSocketGateway({ 
  cors: true,
  transports: ['websocket', 'polling'],
  path: '/ai-assistant-socket'
})
@UseGuards(IntelligentAutomationGuard)
@ApiBearerAuth()
export class AIAssistantController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AIAssistantController.name);
  private activeConversations = new Map<string, any>();

  constructor(
    private readonly aiAssistantService: HyperIntelligentAssistantService,
    private readonly contextualService: ContextualIntelligenceService,
    private readonly conversationalService: ConversationalAIService,
    private readonly knowledgeService: ManufacturingKnowledgeService,
  ) {}

  @Post('conversation')
  @ApiOperation({
    summary: 'Intelligent Conversation Interface',
    description: 'Contextual AI conversation with manufacturing intelligence and proactive assistance',
  })
  @ApiBody({ type: ConversationRequestDto })
  @ApiResponse({
    status: 200,
    description: 'AI conversation response generated successfully',
    schema: {
      example: {
        response: {
          text: "I've analyzed your production line data and noticed a 12% efficiency drop in Station 3. The root cause appears to be inconsistent material flow timing.",
          confidence: 0.94,
          responseType: 'ANALYTICAL_INSIGHT',
          actionable: true
        },
        contextualInsights: {
          relevantData: ['Station 3 throughput', 'Material buffer levels', 'Cycle time variations'],
          relatedIssues: ['Similar pattern detected last month', 'Potential equipment calibration drift'],
          urgencyIndicators: ['Production target at risk', 'Quality metrics declining']
        },
        recommendations: [
          {
            action: 'Adjust material feed timing by 15 seconds',
            confidence: 0.89,
            expectedImpact: 'Restore 8-10% efficiency',
            implementation: 'IMMEDIATE'
          },
          {
            action: 'Schedule equipment calibration check',
            confidence: 0.76,
            expectedImpact: 'Prevent future drift',
            implementation: 'WITHIN_24H'
          }
        ],
        proactiveAlerts: [
          'Station 4 showing early signs of similar pattern',
          'Raw material inventory optimization opportunity detected'
        ],
        visualizations: {
          available: true,
          types: ['trend-chart', 'process-flow-diagram', 'heatmap'],
          interactiveElements: ['drill-down', 'what-if-scenarios']
        }
      }
    }
  })
  async handleConversation(@Body() conversationDto: ConversationRequestDto) {
    try {
      this.logger.log(`AI conversation request from user: ${conversationDto.context.userId}`);
      
      // Contextual intelligence analysis
      const contextAnalysis = await this.contextualService.analyzeContext(conversationDto.context);
      
      // Generate intelligent response
      const response = await this.aiAssistantService.generateResponse({
        ...conversationDto,
        contextAnalysis,
      });
      
      // Proactive insights generation
      const proactiveInsights = await this.aiAssistantService.generateProactiveInsights(contextAnalysis);
      
      // Store conversation for learning
      await this.conversationalService.storeConversation(conversationDto, response);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AI conversation completed successfully',
        data: {
          ...response,
          proactiveInsights,
          sessionId: response.sessionId,
        },
      };
    } catch (error) {
      this.logger.error(`AI conversation failed: ${error.message}`);
      throw new HttpException(
        'AI conversation processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('guidance')
  @ApiOperation({
    summary: 'Contextual Manufacturing Guidance',
    description: 'Step-by-step intelligent guidance for manufacturing tasks and troubleshooting',
  })
  @ApiBody({ type: ManufacturingGuidanceDto })
  @ApiResponse({
    status: 200,
    description: 'Manufacturing guidance generated successfully',
    schema: {
      example: {
        guidance: {
          taskId: 'GUIDANCE_2024_001',
          title: 'Equipment Setup - CNC Machine A',
          complexity: 'INTERMEDIATE',
          estimatedTime: '25 minutes',
          safetyLevel: 'STANDARD'
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Safety Verification',
            description: 'Ensure all safety protocols are followed before beginning setup',
            details: ['Verify emergency stop functionality', 'Check safety barriers', 'Confirm PPE compliance'],
            visualAid: 'safety-checklist-diagram',
            interactiveElement: 'safety-verification-checklist',
            estimatedTime: '3 minutes',
            criticalityLevel: 'HIGH'
          },
          {
            stepNumber: 2,
            title: 'Tool Installation',
            description: 'Install and calibrate cutting tools according to specifications',
            details: ['Select appropriate cutting tool', 'Mount tool with proper torque', 'Verify tool dimensions'],
            visualAid: 'tool-installation-video',
            arOverlay: 'tool-positioning-guide',
            estimatedTime: '8 minutes',
            criticalityLevel: 'MEDIUM'
          }
        ],
        adaptiveElements: {
          difficultyAdjustment: true,
          personalizedTips: ['Based on your experience with similar setups...'],
          contextualWarnings: ['Station temperature is higher than usual today'],
          realTimeOptimization: 'Steps can be reordered based on current conditions'
        },
        qualityCheckpoints: [
          { step: 2, checkpoint: 'Tool runout < 0.05mm', critical: true },
          { step: 4, checkpoint: 'Surface finish within specification', critical: false }
        ]
      }
    }
  })
  async provideGuidance(@Body() guidanceDto: ManufacturingGuidanceDto) {
    try {
      this.logger.log(`Manufacturing guidance requested: ${guidanceDto.taskType}`);
      
      const guidance = await this.aiAssistantService.generateManufacturingGuidance(guidanceDto);
      
      // Personalization based on operator experience
      const personalizedGuidance = await this.contextualService.personalizeGuidance(
        guidance,
        guidanceDto.operatorExperienceLevel
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Manufacturing guidance generated successfully',
        data: personalizedGuidance,
      };
    } catch (error) {
      this.logger.error(`Guidance generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate manufacturing guidance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('proactive-insights')
  @ApiOperation({
    summary: 'Proactive Intelligence Insights',
    description: 'AI-generated proactive insights and recommendations based on real-time manufacturing data',
  })
  @ApiBody({ type: ProactiveInsightRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Proactive insights generated successfully',
    schema: {
      example: {
        insights: [
          {
            id: 'INSIGHT_2024_001',
            type: 'PREDICTIVE_MAINTENANCE',
            priority: 'HIGH',
            confidence: 0.92,
            title: 'Bearing Replacement Required Soon',
            description: 'Vibration analysis indicates bearing wear in Motor M-245',
            expectedImpact: 'Potential 6-hour downtime if not addressed',
            recommendedAction: 'Schedule replacement within 72 hours',
            timeToAction: '72 hours',
            affectedSystems: ['Production Line 2', 'Quality Station Q-12'],
            businessImpact: { cost: 15000, production: 500 }
          },
          {
            id: 'INSIGHT_2024_002',
            type: 'EFFICIENCY_OPTIMIZATION',
            priority: 'MEDIUM',
            confidence: 0.85,
            title: 'Production Scheduling Optimization Opportunity',
            description: 'Pattern analysis shows 15% efficiency gain possible with adjusted scheduling',
            expectedImpact: 'Additional 150 units per day capacity',
            recommendedAction: 'Implement revised scheduling algorithm',
            timeToAction: '1 week',
            implementationComplexity: 'LOW'
          }
        ],
        trendAnalysis: {
          overallEfficiency: { current: 0.87, trend: 'IMPROVING', prediction: 0.91 },
          qualityMetrics: { current: 0.94, trend: 'STABLE', prediction: 0.94 },
          maintenanceHealth: { current: 0.89, trend: 'DECLINING', prediction: 0.85 }
        },
        crossModuleCorrelations: [
          'Production efficiency correlates with maintenance schedule adherence (r=0.78)',
          'Quality defects increase 2 hours before shift change (p<0.01)'
        ],
        futureRecommendations: [
          'Consider implementing predictive quality control',
          'Evaluate shift transition optimization program'
        ]
      }
    }
  })
  async generateProactiveInsights(@Body() insightDto: ProactiveInsightRequestDto) {
    try {
      this.logger.log(`Proactive insights requested for: ${insightDto.targetAudience}`);
      
      const insights = await this.aiAssistantService.generateProactiveInsights(insightDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Proactive insights generated successfully',
        data: insights,
      };
    } catch (error) {
      this.logger.error(`Proactive insights generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate proactive insights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('knowledge-query')
  @ApiOperation({
    summary: 'Intelligent Knowledge Retrieval',
    description: 'AI-powered knowledge base query with contextual relevance and personalization',
  })
  @ApiBody({ type: KnowledgeQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Knowledge query processed successfully',
    schema: {
      example: {
        results: [
          {
            id: 'KB_001',
            title: 'CNC Machine Troubleshooting Guide',
            relevanceScore: 0.95,
            type: 'PROCEDURAL',
            summary: 'Comprehensive guide for diagnosing and resolving common CNC machine issues',
            keyPoints: ['Spindle alignment procedures', 'Tool wear identification', 'Calibration methods'],
            lastUpdated: '2024-02-15',
            expertValidated: true,
            accessCount: 156,
            successRate: 0.89
          }
        ],
        relatedTopics: [
          'Preventive maintenance schedules',
          'Tool life optimization',
          'Quality control procedures'
        ],
        contextualSuggestions: [
          'Consider reviewing recent maintenance logs for this equipment',
          'Similar issues resolved using method KB_045 last month'
        ],
        personalization: {
          userExperience: 'INTERMEDIATE',
          customizedContent: 'Highlighted advanced techniques based on your profile',
          learningPath: 'Next recommended: Advanced CNC Programming'
        }
      }
    }
  })
  async queryKnowledge(@Body() queryDto: KnowledgeQueryDto) {
    try {
      this.logger.log(`Knowledge query: ${queryDto.query}`);
      
      const results = await this.knowledgeService.intelligentSearch(queryDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Knowledge query processed successfully',
        data: results,
      };
    } catch (error) {
      this.logger.error(`Knowledge query failed: ${error.message}`);
      throw new HttpException(
        'Failed to process knowledge query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('assistant-status')
  @ApiOperation({
    summary: 'AI Assistant System Status',
    description: 'Real-time status of AI assistant capabilities and performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'AI assistant status retrieved successfully',
    schema: {
      example: {
        systemHealth: {
          overall: 0.98,
          components: {
            conversationalAI: 0.99,
            contextualIntelligence: 0.97,
            knowledgeRetrieval: 0.98,
            proactiveInsights: 0.96
          }
        },
        performance: {
          averageResponseTime: '1.2 seconds',
          conversationsPerDay: 1250,
          accuracyRate: 0.94,
          userSatisfactionScore: 4.7
        },
        capabilities: {
          supportedLanguages: ['English', 'Spanish', 'French', 'German', 'Chinese'],
          multimodalSupport: true,
          realTimeAnalysis: true,
          predictiveInsights: true,
          collaborativeFeatures: true
        },
        learningMetrics: {
          knowledgeBaseSize: '2.5M documents',
          dailyLearningRate: '15K interactions',
          modelUpdateFrequency: 'Real-time',
          expertValidations: 1250
        }
      }
    }
  })
  async getAssistantStatus() {
    try {
      const status = await this.aiAssistantService.getSystemStatus();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AI assistant status retrieved successfully',
        data: status,
      };
    } catch (error) {
      this.logger.error(`Assistant status retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve assistant status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time AI interaction
  @SubscribeMessage('start-conversation')
  handleStartConversation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeConversations.set(client.id, sessionId);
    
    client.emit('conversation-started', {
      sessionId,
      capabilities: ['natural-language', 'contextual-awareness', 'proactive-insights', 'visual-responses'],
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`AI conversation session started: ${sessionId}`);
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const sessionId = this.activeConversations.get(client.id);
    
    if (!sessionId) {
      client.emit('error', { message: 'No active session found' });
      return;
    }

    try {
      // Process message with AI
      const response = await this.conversationalService.processRealTimeMessage({
        ...data,
        sessionId,
        clientId: client.id
      });

      // Send AI response
      client.emit('ai-response', {
        response: response.text,
        confidence: response.confidence,
        suggestions: response.suggestions,
        visualElements: response.visualElements,
        timestamp: new Date().toISOString()
      });

      // Send proactive insights if available
      if (response.proactiveInsights && response.proactiveInsights.length > 0) {
        client.emit('proactive-insights', {
          insights: response.proactiveInsights,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.logger.error(`Chat message processing failed: ${error.message}`);
      client.emit('error', { message: 'Failed to process message' });
    }
  }

  @SubscribeMessage('request-guidance')
  async handleGuidanceRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const guidance = await this.aiAssistantService.generateRealTimeGuidance(data);
      
      client.emit('guidance-response', {
        guidance,
        interactiveElements: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Guidance request failed: ${error.message}`);
      client.emit('error', { message: 'Failed to generate guidance' });
    }
  }

  @SubscribeMessage('context-update')
  handleContextUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const sessionId = this.activeConversations.get(client.id);
    
    if (sessionId) {
      // Update context and trigger proactive analysis
      this.contextualService.updateContext(sessionId, data).then(insights => {
        if (insights && insights.length > 0) {
          client.emit('contextual-insights', {
            insights,
            timestamp: new Date().toISOString()
          });
        }
      });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const sessionId = this.activeConversations.get(client.id);
    if (sessionId) {
      this.activeConversations.delete(client.id);
      this.logger.log(`AI conversation session ended: ${sessionId}`);
    }
  }
}
