// Industry 5.0 ERP Backend - Procurement Module
// PurchaseRequisitionService - Advanced requisition workflow management
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Entities
import { PurchaseRequisition, RequisitionStatus, PriorityLevel, RequisitionType } from '../entities/purchase-requisition.entity';
import { LineItem } from '../entities/line-item.entity';
import { Vendor } from '../entities/vendor.entity';
import { ProcurementAlert } from '../entities/procurement-alert.entity';

// Services
import { AIProcurementIntelligenceService } from './ai-procurement-intelligence.service';
import { SupplierManagementService } from './supplier-management.service';

@Injectable()
export class PurchaseRequisitionService {
  private readonly logger = new Logger(PurchaseRequisitionService.name);

  constructor(
    @InjectRepository(PurchaseRequisition)
    private readonly requisitionRepository: Repository<PurchaseRequisition>,
    @InjectRepository(LineItem)
    private readonly lineItemRepository: Repository<LineItem>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(ProcurementAlert)
    private readonly alertRepository: Repository<ProcurementAlert>,
    private readonly aiService: AIProcurementIntelligenceService,
    private readonly supplierService: SupplierManagementService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== REQUISITION LIFECYCLE ====================

  async createRequisition(data: any): Promise<PurchaseRequisition> {
    try {
      this.logger.log('Creating new purchase requisition');

      const requisition = this.requisitionRepository.create({
        ...data,
        status: RequisitionStatus.DRAFT,
        submissionDate: new Date(),
        createdAt: new Date(),
      });

      const savedRequisition = await this.requisitionRepository.save(requisition);

      // Create line items
      if (data.lineItems && data.lineItems.length > 0) {
        for (const itemData of data.lineItems) {
          const lineItem = this.lineItemRepository.create({
            ...itemData,
            requisitionId: savedRequisition.id,
            createdAt: new Date(),
          });
          await this.lineItemRepository.save(lineItem);
        }
      }

      // Trigger AI analysis
      try {
        await this.aiService.analyzeRequisition(savedRequisition.id);
      } catch (error) {
        this.logger.warn('AI analysis failed for requisition', error);
      }

      // Emit event
      this.eventEmitter.emit('requisition.created', {
        requisitionId: savedRequisition.id,
        requesterId: savedRequisition.requesterId,
        totalAmount: savedRequisition.totalAmount,
      });

      this.logger.log(`Requisition created with ID: ${savedRequisition.id}`);
      return savedRequisition;
    } catch (error) {
      this.logger.error('Error creating requisition', error.stack);
      throw error;
    }
  }

  async submitForApproval(requisitionId: string, userId: string): Promise<PurchaseRequisition> {
    try {
      this.logger.log(`Submitting requisition ${requisitionId} for approval`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId },
        relations: ['lineItems', 'approvals'],
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      if (requisition.status !== RequisitionStatus.DRAFT) {
        throw new Error('Only draft requisitions can be submitted for approval');
      }

      // Validate requisition completeness
      await this.validateRequisitionForSubmission(requisition);

      // Update status
      requisition.status = RequisitionStatus.PENDING_APPROVAL;
      requisition.submissionDate = new Date();
      requisition.updatedAt = new Date();

      const updatedRequisition = await this.requisitionRepository.save(requisition);

      // Create approval workflow
      await this.createApprovalWorkflow(requisition);

      // Emit event
      this.eventEmitter.emit('requisition.submitted', {
        requisitionId: requisition.id,
        requesterId: requisition.requesterId,
        totalAmount: requisition.totalAmount,
      });

      return updatedRequisition;
    } catch (error) {
      this.logger.error(`Error submitting requisition ${requisitionId}`, error.stack);
      throw error;
    }
  }

  async approveRequisition(requisitionId: string, approverId: string, comments?: string): Promise<PurchaseRequisition> {
    try {
      this.logger.log(`Approving requisition ${requisitionId} by ${approverId}`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId },
        relations: ['approvals', 'lineItems'],
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      // Process approval
      const approval = requisition.addApproval(approverId, 'approved', comments);
      
      // Check if all required approvals are complete
      if (requisition.isFullyApproved()) {
        requisition.status = RequisitionStatus.APPROVED;
        requisition.approvalDate = new Date();

        // Trigger automatic conversion to purchase order if configured
        if (requisition.autoConvertToPO) {
          await this.convertToPurchaseOrder(requisition);
        }
      }

      requisition.updatedAt = new Date();
      const updatedRequisition = await this.requisitionRepository.save(requisition);

      // Emit event
      this.eventEmitter.emit('requisition.approved', {
        requisitionId: requisition.id,
        approverId,
        isFullyApproved: requisition.isFullyApproved(),
      });

      return updatedRequisition;
    } catch (error) {
      this.logger.error(`Error approving requisition ${requisitionId}`, error.stack);
      throw error;
    }
  }

  async rejectRequisition(requisitionId: string, rejectorId: string, reason: string): Promise<PurchaseRequisition> {
    try {
      this.logger.log(`Rejecting requisition ${requisitionId} by ${rejectorId}`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId },
        relations: ['approvals'],
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      requisition.addApproval(rejectorId, 'rejected', reason);
      requisition.status = RequisitionStatus.REJECTED;
      requisition.rejectionReason = reason;
      requisition.updatedAt = new Date();

      const updatedRequisition = await this.requisitionRepository.save(requisition);

      // Create alert for requester
      await this.createRequisitionAlert(requisition, 'REQUISITION_REJECTED', 
        `Your requisition ${requisition.requisitionNumber} has been rejected: ${reason}`);

      // Emit event
      this.eventEmitter.emit('requisition.rejected', {
        requisitionId: requisition.id,
        rejectorId,
        reason,
      });

      return updatedRequisition;
    } catch (error) {
      this.logger.error(`Error rejecting requisition ${requisitionId}`, error.stack);
      throw error;
    }
  }

  // ==================== INTELLIGENT PROCESSING ====================

  async analyzeRequisitionWithAI(requisitionId: string): Promise<any> {
    try {
      this.logger.log(`Analyzing requisition ${requisitionId} with AI`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId },
        relations: ['lineItems'],
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      const analysis = await this.aiService.analyzeRequisition(requisitionId);

      // Update requisition with AI insights
      requisition.aiAnalysis = analysis;
      requisition.riskAssessment = analysis.riskAssessment;
      requisition.updatedAt = new Date();

      await this.requisitionRepository.save(requisition);

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing requisition ${requisitionId}`, error.stack);
      throw error;
    }
  }

  async suggestVendors(requisitionId: string): Promise<Vendor[]> {
    try {
      this.logger.log(`Suggesting vendors for requisition ${requisitionId}`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId },
        relations: ['lineItems'],
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      // Use AI to suggest best vendors
      const suggestions = await this.aiService.suggestVendorsForRequisition(requisitionId);

      // Get detailed vendor information
      const vendors = await this.vendorRepository.findByIds(
        suggestions.map(s => s.vendorId),
        { relations: ['performanceHistory'] }
      );

      return vendors;
    } catch (error) {
      this.logger.error(`Error suggesting vendors for requisition ${requisitionId}`, error.stack);
      throw error;
    }
  }

  async optimizeBudgetAllocation(requisitionId: string): Promise<any> {
    try {
      this.logger.log(`Optimizing budget allocation for requisition ${requisitionId}`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId },
        relations: ['lineItems'],
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      const optimization = await this.aiService.optimizeBudgetAllocation(requisitionId);

      // Update line items with optimized allocations
      for (const item of requisition.lineItems) {
        const optimizedItem = optimization.lineItems.find(li => li.id === item.id);
        if (optimizedItem) {
          item.suggestedQuantity = optimizedItem.optimizedQuantity;
          item.suggestedPrice = optimizedItem.optimizedPrice;
          item.updatedAt = new Date();
          await this.lineItemRepository.save(item);
        }
      }

      return optimization;
    } catch (error) {
      this.logger.error(`Error optimizing budget for requisition ${requisitionId}`, error.stack);
      throw error;
    }
  }

  // ==================== WORKFLOW AUTOMATION ====================

  async processAutomaticApprovals(): Promise<void> {
    try {
      this.logger.log('Processing automatic approvals');

      // Find requisitions eligible for auto-approval
      const eligibleRequisitions = await this.requisitionRepository.find({
        where: { 
          status: RequisitionStatus.PENDING_APPROVAL,
          autoApprovalEligible: true,
        },
        relations: ['lineItems'],
      });

      for (const requisition of eligibleRequisitions) {
        // Check auto-approval criteria
        if (await this.meetsAutoApprovalCriteria(requisition)) {
          await this.approveRequisition(requisition.id, 'system', 'Auto-approved based on predefined criteria');
        }
      }

      this.logger.log(`Processed ${eligibleRequisitions.length} requisitions for auto-approval`);
    } catch (error) {
      this.logger.error('Error processing automatic approvals', error.stack);
    }
  }

  async convertToPurchaseOrder(requisition: PurchaseRequisition): Promise<any> {
    try {
      this.logger.log(`Converting requisition ${requisition.id} to purchase order`);

      // Create purchase order data
      const poData = {
        requisitionId: requisition.id,
        vendorId: requisition.preferredVendorId,
        orderDate: new Date(),
        expectedDeliveryDate: requisition.requiredDate,
        totalAmount: requisition.totalAmount,
        status: 'DRAFT',
        lineItems: requisition.lineItems.map(item => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.estimatedPrice,
          totalPrice: item.totalPrice,
        })),
      };

      // This would integrate with the Purchase Order service
      // For now, we'll just update the requisition status
      requisition.status = RequisitionStatus.CONVERTED_TO_PO;
      requisition.conversionDate = new Date();
      requisition.updatedAt = new Date();

      await this.requisitionRepository.save(requisition);

      // Emit event
      this.eventEmitter.emit('requisition.converted_to_po', {
        requisitionId: requisition.id,
        poData,
      });

      return { success: true, message: 'Requisition converted to purchase order' };
    } catch (error) {
      this.logger.error(`Error converting requisition ${requisition.id} to PO`, error.stack);
      throw error;
    }
  }

  // ==================== REPORTING & ANALYTICS ====================

  async getRequisitionMetrics(filters: any = {}): Promise<any> {
    try {
      this.logger.log('Generating requisition metrics');

      const queryBuilder = this.requisitionRepository.createQueryBuilder('req');

      // Apply filters
      if (filters.startDate) {
        queryBuilder.andWhere('req.submissionDate >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        queryBuilder.andWhere('req.submissionDate <= :endDate', { endDate: filters.endDate });
      }
      if (filters.department) {
        queryBuilder.andWhere('req.department = :department', { department: filters.department });
      }

      const requisitions = await queryBuilder.getMany();

      // Calculate metrics
      const metrics = {
        total: requisitions.length,
        byStatus: this.groupByProperty(requisitions, 'status'),
        byPriority: this.groupByProperty(requisitions, 'priority'),
        byDepartment: this.groupByProperty(requisitions, 'department'),
        totalValue: requisitions.reduce((sum, req) => sum + req.totalAmount, 0),
        averageValue: requisitions.length > 0 ? 
          requisitions.reduce((sum, req) => sum + req.totalAmount, 0) / requisitions.length : 0,
        avgProcessingTime: this.calculateAverageProcessingTime(requisitions),
        autoApprovalRate: this.calculateAutoApprovalRate(requisitions),
      };

      return metrics;
    } catch (error) {
      this.logger.error('Error generating requisition metrics', error.stack);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private async validateRequisitionForSubmission(requisition: PurchaseRequisition): Promise<void> {
    if (!requisition.lineItems || requisition.lineItems.length === 0) {
      throw new Error('Requisition must have at least one line item');
    }

    if (!requisition.justification || requisition.justification.trim().length === 0) {
      throw new Error('Requisition must include justification');
    }

    if (!requisition.requiredDate || requisition.requiredDate <= new Date()) {
      throw new Error('Required date must be in the future');
    }

    // Additional business rule validations
    if (requisition.totalAmount <= 0) {
      throw new Error('Total amount must be greater than zero');
    }
  }

  private async createApprovalWorkflow(requisition: PurchaseRequisition): Promise<void> {
    // Create approval workflow based on amount and department
    const approvalLevels = this.determineApprovalLevels(requisition);
    
    requisition.approvalWorkflow = {
      levels: approvalLevels,
      currentLevel: 0,
      requiredApprovals: approvalLevels.length,
    };

    await this.requisitionRepository.save(requisition);
  }

  private determineApprovalLevels(requisition: PurchaseRequisition): any[] {
    const levels = [];

    // Supervisor approval for amounts > $1000
    if (requisition.totalAmount > 1000) {
      levels.push({
        level: 1,
        role: 'supervisor',
        department: requisition.department,
        required: true,
      });
    }

    // Manager approval for amounts > $5000
    if (requisition.totalAmount > 5000) {
      levels.push({
        level: 2,
        role: 'manager',
        department: requisition.department,
        required: true,
      });
    }

    // Director approval for amounts > $25000
    if (requisition.totalAmount > 25000) {
      levels.push({
        level: 3,
        role: 'director',
        department: requisition.department,
        required: true,
      });
    }

    return levels;
  }

  private async meetsAutoApprovalCriteria(requisition: PurchaseRequisition): Promise<boolean> {
    // Auto-approval criteria
    const criteria = [
      requisition.totalAmount <= 500, // Small amounts
      requisition.type === RequisitionType.RECURRING, // Recurring orders
      requisition.priority === PriorityLevel.LOW, // Low priority items
      // Add more criteria as needed
    ];

    return criteria.some(criterion => criterion === true);
  }

  private async createRequisitionAlert(requisition: PurchaseRequisition, type: string, message: string): Promise<void> {
    const alert = this.alertRepository.create({
      entityType: 'REQUISITION',
      entityId: requisition.id,
      alertType: type,
      severity: 'MEDIUM',
      title: `Requisition ${type}`,
      message,
      recipientId: requisition.requesterId,
      createdAt: new Date(),
    });

    await this.alertRepository.save(alert);
  }

  private groupByProperty(items: any[], property: string): any {
    return items.reduce((groups, item) => {
      const key = item[property];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  private calculateAverageProcessingTime(requisitions: PurchaseRequisition[]): number {
    const completedRequisitions = requisitions.filter(req => 
      req.status === RequisitionStatus.APPROVED || req.status === RequisitionStatus.REJECTED
    );

    if (completedRequisitions.length === 0) return 0;

    const totalTime = completedRequisitions.reduce((sum, req) => {
      const processTime = req.approvalDate ? 
        (req.approvalDate.getTime() - req.submissionDate.getTime()) / (1000 * 60 * 60 * 24) : 0;
      return sum + processTime;
    }, 0);

    return Math.round(totalTime / completedRequisitions.length * 100) / 100;
  }

  private calculateAutoApprovalRate(requisitions: PurchaseRequisition[]): number {
    const autoApproved = requisitions.filter(req => req.autoApproved).length;
    return requisitions.length > 0 ? Math.round((autoApproved / requisitions.length) * 10000) / 100 : 0;
  }
}
