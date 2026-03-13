/**
 * Collection Management Service
 * 
 * Handles accounts receivable collections including automated collection
 * workflows, customer communication, payment arrangements, and collection analytics.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';

// Collection interfaces and types
export interface CollectionStrategy {
  strategyId: string;
  customerId: string;
  accountId: string;
  strategyType: 'gentle' | 'firm' | 'legal' | 'writeoff';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions: CollectionAction[];
  timeline: CollectionTimeline;
  targetAmount: number;
  expectedRecovery: number;
}

export interface CollectionAction {
  actionId: string;
  type: 'email' | 'phone' | 'letter' | 'legal_notice' | 'payment_plan';
  description: string;
  dueDate: string;
  completed: boolean;
  result?: string;
  notes?: string;
}

export interface CollectionTimeline {
  startDate: string;
  phases: CollectionPhase[];
  escalationTriggers: EscalationTrigger[];
}

export interface CollectionPhase {
  phaseId: string;
  name: string;
  daysFromStart: number;
  actions: string[];
  successCriteria: string;
  escalationCriteria: string;
}

export interface EscalationTrigger {
  triggerId: string;
  condition: string;
  action: string;
  delay: number;
}

export interface CollectionResult {
  strategyId: string;
  success: boolean;
  amountCollected: number;
  timeToCollection: number;
  actionsExecuted: number;
  customerSatisfaction: number;
}

@Injectable()
export class CollectionManagementService {
  private readonly logger = new Logger(CollectionManagementService.name);

  constructor(
    // Repositories will be added when entities are created
    // @InjectRepository(CollectionStrategy) private strategyRepository: Repository<CollectionStrategy>,
    // @InjectRepository(CollectionAction) private actionRepository: Repository<CollectionAction>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a collection strategy for a customer
   */
  async createCollectionStrategy(
    customerId: string,
    accountId: string,
    amount: number,
    daysPastDue: number,
    userId: string
  ): Promise<CollectionStrategy> {
    try {
      // Determine strategy type based on amount and days past due
      const strategyType = this.determineStrategyType(amount, daysPastDue);
      const priority = this.determinePriority(amount, daysPastDue);

      // Generate collection actions
      const actions = await this.generateCollectionActions(strategyType, daysPastDue);

      // Create timeline
      const timeline = this.createCollectionTimeline(strategyType, actions);

      const strategy: CollectionStrategy = {
        strategyId: this.generateStrategyId(),
        customerId,
        accountId,
        strategyType,
        priority,
        actions,
        timeline,
        targetAmount: amount,
        expectedRecovery: this.calculateExpectedRecovery(amount, strategyType),
      };

      // Save strategy to database (when entity is created)
      // await this.strategyRepository.save(strategy);

      // Emit strategy created event
      this.eventEmitter.emit('collection.strategy.created', {
        strategyId: strategy.strategyId,
        customerId,
        amount,
        strategyType,
        userId,
      });

      return strategy;
    } catch (error) {
      this.logger.error(`Collection strategy creation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Execute collection strategy
   */
  async executeCollectionStrategy(strategyId: string, userId: string): Promise<CollectionResult> {
    try {
      // Get strategy details (when entity is created)
      const strategy = await this.getCollectionStrategy(strategyId);

      let actionsExecuted = 0;
      let amountCollected = 0;

      // Execute collection actions
      for (const action of strategy.actions) {
        if (!action.completed) {
          const actionResult = await this.executeCollectionAction(action, strategy);
          actionsExecuted++;

          if (actionResult.success) {
            amountCollected += actionResult.amountCollected || 0;
            action.completed = true;
            action.result = actionResult.result;
          }
        }
      }

      const result: CollectionResult = {
        strategyId,
        success: amountCollected >= strategy.targetAmount * 0.8, // 80% recovery considered success
        amountCollected,
        timeToCollection: this.calculateTimeToCollection(strategy),
        actionsExecuted,
        customerSatisfaction: this.calculateCustomerSatisfaction(strategy),
      };

      // Update strategy status
      // await this.updateStrategyStatus(strategyId, result);

      return result;
    } catch (error) {
      this.logger.error(`Collection strategy execution failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get collection strategy
   */
  async getCollectionStrategy(strategyId: string): Promise<CollectionStrategy> {
    // Mock strategy for now - will be replaced with database query
    return {
      strategyId,
      customerId: 'CUST_001',
      accountId: 'ACC_001',
      strategyType: 'gentle',
      priority: 'medium',
      actions: [],
      timeline: {
        startDate: new Date().toISOString(),
        phases: [],
        escalationTriggers: [],
      },
      targetAmount: 5000,
      expectedRecovery: 4000,
    };
  }

  /**
   * Execute individual collection action
   */
  private async executeCollectionAction(action: CollectionAction, strategy: CollectionStrategy): Promise<any> {
    try {
      switch (action.type) {
        case 'email':
          return this.sendCollectionEmail(action, strategy);
        case 'phone':
          return this.initiateCollectionCall(action, strategy);
        case 'letter':
          return this.sendCollectionLetter(action, strategy);
        case 'legal_notice':
          return this.sendLegalNotice(action, strategy);
        case 'payment_plan':
          return this.proposePaymentPlan(action, strategy);
        default:
          throw new BadRequestException(`Unsupported collection action: ${action.type}`);
      }
    } catch (error) {
      this.logger.error(`Collection action execution failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send collection email
   */
  private async sendCollectionEmail(action: CollectionAction, strategy: CollectionStrategy): Promise<any> {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      result: 'Email sent successfully',
      amountCollected: 0,
      responseReceived: Math.random() > 0.7, // 30% response rate
    };
  }

  /**
   * Initiate collection call
   */
  private async initiateCollectionCall(action: CollectionAction, strategy: CollectionStrategy): Promise<any> {
    // Simulate phone call
    await new Promise(resolve => setTimeout(resolve, 200));

    const success = Math.random() > 0.5; // 50% success rate
    return {
      success,
      result: success ? 'Customer contacted successfully' : 'No answer',
      amountCollected: success ? strategy.targetAmount * 0.3 : 0, // 30% collection on successful call
    };
  }

  /**
   * Send collection letter
   */
  private async sendCollectionLetter(action: CollectionAction, strategy: CollectionStrategy): Promise<any> {
    // Simulate letter sending
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
      success: true,
      result: 'Letter sent successfully',
      amountCollected: 0,
    };
  }

  /**
   * Send legal notice
   */
  private async sendLegalNotice(action: CollectionAction, strategy: CollectionStrategy): Promise<any> {
    // Simulate legal notice
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = Math.random() > 0.3; // 70% success rate for legal notices
    return {
      success,
      result: 'Legal notice sent',
      amountCollected: success ? strategy.targetAmount * 0.8 : 0, // 80% collection on legal notice
    };
  }

  /**
   * Propose payment plan
   */
  private async proposePaymentPlan(action: CollectionAction, strategy: CollectionStrategy): Promise<any> {
    // Simulate payment plan proposal
    await new Promise(resolve => setTimeout(resolve, 100));

    const accepted = Math.random() > 0.4; // 60% acceptance rate
    return {
      success: accepted,
      result: accepted ? 'Payment plan accepted' : 'Payment plan rejected',
      amountCollected: accepted ? strategy.targetAmount * 0.5 : 0, // 50% immediate collection
    };
  }

  /**
   * Determine strategy type based on amount and days past due
   */
  private determineStrategyType(amount: number, daysPastDue: number): CollectionStrategy['strategyType'] {
    if (daysPastDue <= 30) return 'gentle';
    if (daysPastDue <= 60) return 'firm';
    if (daysPastDue <= 90 || amount < 10000) return 'legal';
    return 'writeoff';
  }

  /**
   * Determine priority based on amount and days past due
   */
  private determinePriority(amount: number, daysPastDue: number): CollectionStrategy['priority'] {
    if (amount >= 50000 || daysPastDue >= 90) return 'urgent';
    if (amount >= 10000 || daysPastDue >= 60) return 'high';
    if (amount >= 1000 || daysPastDue >= 30) return 'medium';
    return 'low';
  }

  /**
   * Generate collection actions based on strategy type
   */
  private async generateCollectionActions(strategyType: string, daysPastDue: number): Promise<CollectionAction[]> {
    const actions: CollectionAction[] = [];
    const baseDate = new Date();

    switch (strategyType) {
      case 'gentle':
        actions.push({
          actionId: this.generateActionId(),
          type: 'email',
          description: 'Send friendly payment reminder',
          dueDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
        });
        break;

      case 'firm':
        actions.push(
          {
            actionId: this.generateActionId(),
            type: 'email',
            description: 'Send formal payment demand',
            dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
          },
          {
            actionId: this.generateActionId(),
            type: 'phone',
            description: 'Call customer to discuss payment',
            dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
          }
        );
        break;

      case 'legal':
        actions.push(
          {
            actionId: this.generateActionId(),
            type: 'legal_notice',
            description: 'Send legal demand letter',
            dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
          },
          {
            actionId: this.generateActionId(),
            type: 'payment_plan',
            description: 'Offer payment plan',
            dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
          }
        );
        break;

      default:
        break;
    }

    return actions;
  }

  /**
   * Create collection timeline
   */
  private createCollectionTimeline(strategyType: string, actions: CollectionAction[]): CollectionTimeline {
    const phases: CollectionPhase[] = [];
    const escalationTriggers: EscalationTrigger[] = [];

    // Create phases based on strategy type
    switch (strategyType) {
      case 'gentle':
        phases.push({
          phaseId: 'phase_1',
          name: 'Gentle Reminder',
          daysFromStart: 0,
          actions: ['email'],
          successCriteria: 'Payment received within 7 days',
          escalationCriteria: 'No response after 14 days',
        });
        break;

      case 'firm':
        phases.push(
          {
            phaseId: 'phase_1',
            name: 'Formal Demand',
            daysFromStart: 0,
            actions: ['email', 'phone'],
            successCriteria: 'Payment commitment received',
            escalationCriteria: 'No payment after 10 days',
          }
        );
        break;

      case 'legal':
        phases.push(
          {
            phaseId: 'phase_1',
            name: 'Legal Action',
            daysFromStart: 0,
            actions: ['legal_notice', 'payment_plan'],
            successCriteria: 'Payment plan agreed or full payment',
            escalationCriteria: 'No response after 30 days',
          }
        );
        break;
    }

    return {
      startDate: new Date().toISOString(),
      phases,
      escalationTriggers,
    };
  }

  /**
   * Calculate expected recovery based on strategy and historical data
   */
  private calculateExpectedRecovery(amount: number, strategyType: string): number {
    const recoveryRates = {
      gentle: 0.85,
      firm: 0.70,
      legal: 0.45,
      writeoff: 0.10,
    };

    return new Decimal(amount).mul(recoveryRates[strategyType] || 0.5).toNumber();
  }

  /**
   * Calculate time to collection
   */
  private calculateTimeToCollection(strategy: CollectionStrategy): number {
    const startDate = new Date(strategy.timeline.startDate);
    const currentDate = new Date();
    return Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  /**
   * Calculate customer satisfaction score
   */
  private calculateCustomerSatisfaction(strategy: CollectionStrategy): number {
    // Base satisfaction score
    let satisfaction = 100;

    // Reduce satisfaction based on strategy aggressiveness
    const reductions = {
      gentle: 5,
      firm: 20,
      legal: 50,
      writeoff: 90,
    };

    satisfaction -= reductions[strategy.strategyType] || 25;

    // Adjust based on actions taken
    const actionPenalties = {
      email: 2,
      phone: 5,
      letter: 10,
      legal_notice: 30,
      payment_plan: -5, // Positive impact
    };

    for (const action of strategy.actions) {
      if (action.completed) {
        satisfaction -= actionPenalties[action.type] || 0;
      }
    }

    return Math.max(0, Math.min(100, satisfaction));
  }

  /**
   * Generate unique strategy ID
   */
  private generateStrategyId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `COLL_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `ACT_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Create an AI-powered collection strategy.
   * @param strategyDto - The data for the collection strategy.
   * @returns The created collection strategy.
   */
  async createAICollectionStrategy(strategyDto: any): Promise<CollectionStrategy> {
    this.logger.log(`Creating AI collection strategy for party: ${strategyDto.partyId}`);

    const strategy = await this.createCollectionStrategy(
      strategyDto.partyId,
      strategyDto.accountId,
      strategyDto.outstandingAmount,
      strategyDto.daysPastDue,
      strategyDto.userId
    );

    // Enhance with AI recommendations
    strategy.priority = 'high';

    return strategy;
  }

  /**
   * Execute automated collection actions.
   * @param collectionParams - The parameters for the automated collections.
   * @returns The results of the automated collections.
   */
  async executeAutomatedCollections(collectionParams: any): Promise<any> {
    this.logger.log('Executing automated collections');

    const strategies = await this.getCustomerCollectionStrategies(collectionParams.customerId);
    let actionsExecuted = 0;
    let successfulActions = 0;
    let failedActions = 0;

    for (const strategy of strategies) {
      const result = await this.executeCollectionStrategy(strategy.strategyId, collectionParams.userId);
      actionsExecuted += result.actionsExecuted;
      if(result.success) {
        successfulActions++;
      } else {
        failedActions++;
      }
    }

    return {
      actionsExecuted,
      successfulActions,
      failedActions,
    };
  }

  /**
   * Get collection strategies for a customer
   */
  async getCustomerCollectionStrategies(customerId: string): Promise<CollectionStrategy[]> {
    try {
      // This will query the database when entity is created
      // For now, return mock data
      return [
        {
          strategyId: 'COLL_MOCK_001',
          customerId,
          accountId: 'ACC_001',
          strategyType: 'gentle',
          priority: 'medium',
          actions: [],
          timeline: {
            startDate: new Date().toISOString(),
            phases: [],
            escalationTriggers: [],
          },
          targetAmount: 5000,
          expectedRecovery: 4250,
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get collection strategies: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update collection action status
   */
  async updateActionStatus(
    actionId: string,
    completed: boolean,
    result?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      // Update action in database (when entity is created)
      // const action = await this.actionRepository.findOne({ where: { actionId } });
      // if (action) {
      //   action.completed = completed;
      //   action.result = result;
      //   action.notes = notes;
      //   await this.actionRepository.save(action);
      // }

      // Emit action updated event
      this.eventEmitter.emit('collection.action.updated', {
        actionId,
        completed,
        result,
        notes,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to update action status: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Generate collection analytics
   */
  async generateCollectionAnalytics(entityId?: string, period?: string): Promise<any> {
    try {
      // Calculate collection metrics
      const metrics = {
        totalStrategies: 150,
        activeStrategies: 45,
        completedStrategies: 105,
        totalTargetAmount: 750000,
        totalCollected: 637500,
        recoveryRate: 0.85,
        averageTimeToCollection: 18, // days
        strategyEffectiveness: {
          gentle: { rate: 0.90, avgTime: 12 },
          firm: { rate: 0.75, avgTime: 20 },
          legal: { rate: 0.45, avgTime: 45 },
          writeoff: { rate: 0.10, avgTime: 90 },
        },
        customerSatisfactionImpact: {
          gentle: 85,
          firm: 70,
          legal: 40,
          writeoff: 20,
        },
      };

      return {
        period: period || 'current_month',
        entityId: entityId || 'all',
        generatedAt: new Date().toISOString(),
        metrics,
        recommendations: [
          'Increase use of gentle strategies for amounts under $10,000',
          'Implement payment plan options earlier in the process',
          'Consider customer satisfaction in strategy selection',
        ],
      };
    } catch (error) {
      this.logger.error(`Collection analytics generation failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
