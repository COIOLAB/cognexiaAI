// Industry 5.0 ERP Backend - Human-AI Collaboration Controller
// Advanced human-AI interaction and collaborative workflows
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

import { HumanAICollaborationService } from '../services/human-ai-collaboration.service';
import { ShopFloorSecurityGuard } from '../guards/shop-floor-security.guard';

export class CreateCollaborationSessionDto {
  operatorId: string;
  taskType: 'ASSEMBLY' | 'INSPECTION' | 'MAINTENANCE' | 'TRAINING' | 'PROBLEM_SOLVING';
  aiAssistantType: 'GUIDANCE' | 'AUGMENTED_REALITY' | 'PREDICTIVE' | 'QUALITY_CHECK';
  workCellId: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT';
  expectedDuration: number; // minutes
  safetyRequirements: {
    level: 'STANDARD' | 'ENHANCED' | 'MAXIMUM';
    certifications: string[];
    equipmentRequired: string[];
  };
}

@ApiTags('Human-AI Collaboration')
@Controller('shop-floor/human-ai')
@UseGuards(ShopFloorSecurityGuard)
@ApiBearerAuth()
export class HumanAICollaborationController {
  private readonly logger = new Logger(HumanAICollaborationController.name);

  constructor(
    private readonly collaborationService: HumanAICollaborationService,
  ) {}

  @Post('sessions')
  @ApiOperation({
    summary: 'Start collaboration session',
    description: 'Initialize a new human-AI collaboration session',
  })
  @ApiBody({ type: CreateCollaborationSessionDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Collaboration session started',
    schema: {
      example: {
        sessionId: 'session_123',
        operatorId: 'OP_001',
        aiAssistant: {
          type: 'AUGMENTED_REALITY',
          capabilities: ['visual_guidance', 'real_time_feedback', 'quality_check'],
          confidence: 0.94
        },
        status: 'ACTIVE',
        recommendations: [
          'Use torque wrench for precise tightening',
          'Check component alignment before assembly'
        ]
      }
    }
  })
  async startCollaborationSession(@Body() createDto: CreateCollaborationSessionDto) {
    try {
      this.logger.log(`Starting collaboration session for operator: ${createDto.operatorId}`);
      
      const session = await this.collaborationService.startSession(createDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Collaboration session started successfully',
        data: session,
      };
    } catch (error) {
      this.logger.error(`Failed to start collaboration session: ${error.message}`);
      throw new HttpException(
        'Failed to start collaboration session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sessions/active')
  @ApiOperation({
    summary: 'Get active collaboration sessions',
    description: 'Retrieve all currently active human-AI collaboration sessions',
  })
  @ApiQuery({ name: 'operatorId', required: false })
  @ApiQuery({ name: 'workCellId', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Active sessions retrieved',
    schema: {
      example: {
        activeSessions: [
          {
            sessionId: 'session_123',
            operatorId: 'OP_001',
            taskType: 'ASSEMBLY',
            aiAssistantType: 'AUGMENTED_REALITY',
            progress: 0.65,
            efficiency: 0.92,
            qualityScore: 0.96
          }
        ],
        totalActive: 8,
        averageEfficiency: 0.89
      }
    }
  })
  async getActiveSessions(
    @Query('operatorId') operatorId?: string,
    @Query('workCellId') workCellId?: string,
  ) {
    try {
      const sessions = await this.collaborationService.getActiveSessions({
        operatorId,
        workCellId,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Active collaboration sessions retrieved',
        data: sessions,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve sessions: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get collaboration analytics',
    description: 'Analyze human-AI collaboration performance and effectiveness',
  })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Collaboration analytics retrieved',
    schema: {
      example: {
        overallPerformance: {
          efficiency: 0.89,
          qualityImprovement: 0.15,
          errorReduction: 0.34,
          trainingAcceleration: 0.67
        },
        operatorBreakdown: {
          'OP_001': { efficiency: 0.94, aiReliance: 0.45, improvement: 0.12 },
          'OP_002': { efficiency: 0.85, aiReliance: 0.67, improvement: 0.23 }
        },
        aiEffectiveness: {
          guidanceAccuracy: 0.92,
          predictionAccuracy: 0.88,
          userSatisfaction: 0.91
        }
      }
    }
  })
  async getCollaborationAnalytics(@Query('period') period?: string) {
    try {
      const analytics = await this.collaborationService.getAnalytics({ period });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Collaboration analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve analytics: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
