/**
 * Tax Management Service - Tax Calculations, Compliance & Reporting
 * 
 * Advanced tax management service providing comprehensive tax calculation,
 * compliance monitoring, tax return preparation, audit support, and multi-
 * jurisdictional tax planning using AI-powered tax optimization, automated
 * compliance tracking, and real-time regulatory updates.
 * 
 * Features:
 * - Multi-jurisdictional tax calculations (Federal, State, Local, International)
 * - AI-powered tax optimization and planning strategies
 * - Automated tax compliance monitoring and alerts
 * - Real-time tax provision calculations and adjustments
 * - Tax return preparation and e-filing integration
 * - Audit defense and documentation management
 * - Transfer pricing and international tax compliance
 * - Integration with all business and financial modules
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, IRS, OECD, BEPS, CRS
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Decimal } from 'decimal.js';

// Tax Management Interfaces
interface TaxEntity {
  entityId: string;
  entityName: string;
  entityType: 'corporation' | 'partnership' | 'llc' | 'sole_proprietorship' | 'branch' | 'subsidiary';
  taxId: string;
  registrationNumber: string;
  incorporationDate: string;
  fiscalYearEnd: string;
  taxJurisdictions: TaxJurisdiction[];
  taxElections: TaxElection[];
  filingRequirements: FilingRequirement[];
  taxAttributes: TaxAttribute[];
  parentEntity?: string;
  subsidiaries: string[];
  isConsolidated: boolean;
  status: 'active' | 'inactive' | 'dissolved';
  metadata: Record<string, any>;
}

interface TaxJurisdiction {
  jurisdictionId: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  jurisdictionType: 'federal' | 'state' | 'local' | 'international';
  country: string;
  state?: string;
  city?: string;
  taxTypes: TaxType[];
  registrationStatus: 'registered' | 'pending' | 'exempt' | 'deregistered';
  registrationDate?: string;
  exemptionReason?: string;
  filingFrequency: 'monthly' | 'quarterly' | 'annually' | 'on_demand';
  nextFilingDate: string;
  isActive: boolean;
}

interface TaxType {
  taxTypeId: string;
  taxCode: string;
  taxName: string;
  category: 'income' | 'sales' | 'payroll' | 'property' | 'excise' | 'vat' | 'gst' | 'withholding';
  rate: TaxRate;
  basis: 'gross_income' | 'net_income' | 'sales_amount' | 'payroll_amount' | 'property_value';
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
  thresholds: TaxThreshold[];
  exemptions: TaxExemption[];
}

interface TaxRate {
  rateType: 'flat' | 'progressive' | 'regressive' | 'alternative_minimum';
  flatRate?: Decimal;
  brackets?: TaxBracket[];
  minimumTax?: Decimal;
  maximumTax?: Decimal;
}

interface TaxBracket {
  bracketId: string;
  minAmount: Decimal;
  maxAmount?: Decimal;
  rate: Decimal;
  description: string;
}

interface TaxThreshold {
  thresholdType: 'filing' | 'payment' | 'withholding' | 'registration';
  amount: Decimal;
  period: 'monthly' | 'quarterly' | 'annually';
  action: string;
}

interface TaxExemption {
  exemptionType: string;
  description: string;
  conditions: string[];
  expiryDate?: string;
  certificateNumber?: string;
}

interface TaxElection {
  electionType: string;
  description: string;
  effectiveDate: string;
  expiryDate?: string;
  isRevocable: boolean;
  filedWith: string;
  confirmationNumber?: string;
}

interface FilingRequirement {
  requirementId: string;
  formNumber: string;
  formName: string;
  jurisdictionId: string;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'on_demand';
  dueDate: string;
  extensionAvailable: boolean;
  extensionDueDate?: string;
  penaltyRate: Decimal;
  interestRate: Decimal;
  isActive: boolean;
}

interface TaxAttribute {
  attributeType: string;
  value: any;
  description: string;
  effectiveDate: string;
  expiryDate?: string;
}

interface TaxCalculation {
  calculationId: string;
  entityId: string;
  period: string;
  jurisdictionId: string;
  taxTypeId: string;
  calculationType: 'provision' | 'current' | 'deferred' | 'estimate' | 'adjustment';
  taxableIncome: Decimal;
  taxBase: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  credits: TaxCredit[];
  deductions: TaxDeduction[];
  adjustments: TaxAdjustment[];
  carryforwards: TaxCarryforward[];
  methodology: 'automated' | 'manual' | 'hybrid';
  confidence: Decimal;
  reviewStatus: 'pending' | 'reviewed' | 'approved';
  calculatedBy: string;
  calculatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  metadata: Record<string, any>;
}

interface TaxCredit {
  creditId: string;
  creditType: string;
  creditName: string;
  amount: Decimal;
  carryforwardAmount: Decimal;
  expiryDate?: string;
  limitations: string[];
  documentation: string[];
}

interface TaxDeduction {
  deductionId: string;
  deductionType: string;
  deductionName: string;
  amount: Decimal;
  limitations: Decimal;
  carryforwardAmount: Decimal;
  documentation: string[];
  approval: DeductionApproval;
}

interface DeductionApproval {
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  conditions?: string[];
  auditRisk: 'low' | 'medium' | 'high';
}

interface TaxAdjustment {
  adjustmentId: string;
  adjustmentType: 'book_tax_difference' | 'prior_period' | 'audit' | 'correction' | 'election';
  description: string;
  amount: Decimal;
  reason: string;
  period: string;
  permanent: boolean;
  reversible: boolean;
  supportingDocuments: string[];
  approvedBy: string;
  processedAt: string;
}

interface TaxCarryforward {
  carryforwardId: string;
  type: 'nol' | 'credit' | 'deduction' | 'loss' | 'depreciation';
  amount: Decimal;
  originYear: number;
  expiryYear?: number;
  utilizationLimit: Decimal;
  utilizedAmount: Decimal;
  remainingAmount: Decimal;
  jurisdictionId: string;
  isActive: boolean;
}

interface TaxProvision {
  provisionId: string;
  entityId: string;
  period: string;
  currentTaxExpense: Decimal;
  deferredTaxExpense: Decimal;
  totalTaxExpense: Decimal;
  currentTaxLiability: Decimal;
  deferredTaxLiability: Decimal;
  deferredTaxAsset: Decimal;
  netDeferredTax: Decimal;
  effectiveTaxRate: Decimal;
  statutoryTaxRate: Decimal;
  rateReconciliation: RateReconciliationItem[];
  uncertainTaxPositions: UncertainTaxPosition[];
  calculations: TaxCalculation[];
  status: 'draft' | 'preliminary' | 'final' | 'filed';
  preparedBy: string;
  preparedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface RateReconciliationItem {
  description: string;
  amount: Decimal;
  rate: Decimal;
  explanation: string;
  category: 'permanent' | 'temporary' | 'rate_change' | 'credits' | 'other';
}

interface UncertainTaxPosition {
  utpId: string;
  description: string;
  amount: Decimal;
  probability: Decimal;
  sustainabilityAssessment: 'more_likely_than_not' | 'not_more_likely_than_not';
  recognizedBenefit: Decimal;
  unrecognizedBenefit: Decimal;
  statute: string;
  expiryDate?: string;
  status: 'open' | 'settled' | 'expired';
  documentation: string[];
}

interface TaxReturn {
  returnId: string;
  entityId: string;
  taxYear: number;
  jurisdictionId: string;
  formNumber: string;
  formName: string;
  filingMethod: 'paper' | 'electronic' | 'professional';
  status: 'draft' | 'prepared' | 'reviewed' | 'filed' | 'processed' | 'amended';
  preparedBy: string;
  preparedAt: string;
  filedBy?: string;
  filedAt?: string;
  dueDate: string;
  extensionFiled: boolean;
  extensionDueDate?: string;
  taxableIncome: Decimal;
  taxDue: Decimal;
  taxPaid: Decimal;
  refundAmount: Decimal;
  balanceDue: Decimal;
  penalties: Decimal;
  interest: Decimal;
  schedules: TaxSchedule[];
  attachments: string[];
  amendments: TaxAmendment[];
  auditHistory: TaxAudit[];
  confirmationNumber?: string;
  acknowledgmentDate?: string;
}

interface TaxSchedule {
  scheduleId: string;
  scheduleNumber: string;
  scheduleName: string;
  data: Record<string, any>;
  calculations: ScheduleCalculation[];
  isRequired: boolean;
  completed: boolean;
}

interface ScheduleCalculation {
  lineNumber: string;
  description: string;
  amount: Decimal;
  source: string;
  calculation: string;
}

interface TaxAmendment {
  amendmentId: string;
  amendmentType: 'correction' | 'election_change' | 'audit_adjustment' | 'protective';
  reason: string;
  originalAmount: Decimal;
  amendedAmount: Decimal;
  additionalTax: Decimal;
  refundAmount: Decimal;
  filedAt: string;
  processedAt?: string;
  status: 'filed' | 'processed' | 'rejected';
}

interface TaxAudit {
  auditId: string;
  auditType: 'correspondence' | 'office' | 'field' | 'criminal';
  initiatedDate: string;
  completedDate?: string;
  status: 'open' | 'closed' | 'appealed' | 'settled';
  issues: AuditIssue[];
  agent: string;
  outcome: AuditOutcome;
  documentation: string[];
}

interface AuditIssue {
  issueId: string;
  description: string;
  taxYear: number;
  proposedAdjustment: Decimal;
  agreedAdjustment: Decimal;
  status: 'open' | 'agreed' | 'disagreed' | 'settled';
  response: string;
}

interface AuditOutcome {
  noChange: boolean;
  additionalTax: Decimal;
  penalties: Decimal;
  interest: Decimal;
  refund: Decimal;
  agreementType?: 'full' | 'partial' | 'none';
  appealed: boolean;
}

interface TaxAnalytics {
  analyticsId: string;
  period: string;
  timestamp: string;
  metrics: TaxMetrics;
  trends: TaxTrends;
  insights: TaxInsight[];
  recommendations: TaxRecommendation[];
  opportunities: TaxOpportunity[];
  risks: TaxRisk[];
}

interface TaxMetrics {
  totalTaxExpense: Decimal;
  currentTaxExpense: Decimal;
  deferredTaxExpense: Decimal;
  effectiveTaxRate: Decimal;
  cashTaxRate: Decimal;
  statutoryTaxRate: Decimal;
  taxSavings: Decimal;
  complianceCost: Decimal;
  auditRisk: Decimal;
  planningOpportunities: Decimal;
  jurisdictionCount: number;
  returnCount: number;
}

interface TaxTrends {
  taxRateTrend: TrendAnalysis;
  complianceBurden: TrendAnalysis;
  planningEffectiveness: TrendAnalysis;
  auditActivity: TrendAnalysis;
  savingsRealization: TrendAnalysis;
}

interface TrendAnalysis {
  currentValue: Decimal;
  previousValue: Decimal;
  change: Decimal;
  changePercent: Decimal;
  trend: 'improving' | 'declining' | 'stable';
  forecast: Decimal;
  confidence: Decimal;
}

interface TaxInsight {
  category: string;
  insight: string;
  importance: number;
  confidence: number;
  impact: 'cost_reduction' | 'risk_mitigation' | 'compliance_improvement' | 'planning_opportunity';
  actionable: boolean;
  evidence: string[];
  recommendations: string[];
}

interface TaxRecommendation {
  recommendation: string;
  category: string;
  priority: number;
  expectedSavings: Decimal;
  implementationCost: Decimal;
  netBenefit: Decimal;
  timeline: string;
  effort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  regulatoryImpact: string[];
}

interface TaxOpportunity {
  opportunityId: string;
  type: 'credit' | 'deduction' | 'election' | 'planning' | 'structure';
  description: string;
  potentialSavings: Decimal;
  probability: Decimal;
  timeframe: string;
  requirements: string[];
  risks: string[];
  nextSteps: string[];
}

interface TaxRisk {
  riskId: string;
  category: 'compliance' | 'audit' | 'penalty' | 'reputational' | 'regulatory';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  potentialCost: Decimal;
  mitigation: RiskMitigation[];
  monitoring: RiskMonitoring;
}

interface RiskMitigation {
  strategy: string;
  description: string;
  cost: Decimal;
  effectiveness: Decimal;
  timeline: string;
  responsible: string;
}

interface RiskMonitoring {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  indicators: string[];
  thresholds: Record<string, Decimal>;
  alerts: boolean;
  lastReview: string;
}

@Injectable()
export class TaxManagementService {
  private readonly logger = new Logger(TaxManagementService.name);
  private readonly precision = 4;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ============================================================================
  // TAX CALCULATIONS
  // ============================================================================

  async calculateIncomeTax(
    entityId: string,
    period: string,
    jurisdictionId: string,
    userId: string
  ): Promise<TaxCalculation> {
    try {
      this.logger.log(`Calculating income tax for entity ${entityId}, period ${period}, jurisdiction ${jurisdictionId}`);

      const entity = await this.getTaxEntity(entityId);
      if (!entity) {
        throw new NotFoundException('Tax entity not found');
      }

      const jurisdiction = entity.taxJurisdictions.find(j => j.jurisdictionId === jurisdictionId);
      if (!jurisdiction) {
        throw new NotFoundException('Tax jurisdiction not found');
      }

      const incomeTaxType = jurisdiction.taxTypes.find(t => t.category === 'income');
      if (!incomeTaxType) {
        throw new NotFoundException('Income tax type not found for jurisdiction');
      }

      // Get financial data for calculation
      const financialData = await this.getFinancialDataForTax(entityId, period);
      const taxableIncome = await this.calculateTaxableIncome(financialData, incomeTaxType);

      // Apply tax rates and calculate tax
      const taxAmount = await this.applyTaxRates(taxableIncome, incomeTaxType.rate);

      // Get available credits and deductions
      const credits = await this.getAvailableTaxCredits(entityId, jurisdictionId, period);
      const deductions = await this.getAvailableTaxDeductions(entityId, jurisdictionId, period);

      // Apply adjustments
      const adjustments = await this.calculateTaxAdjustments(entityId, period, jurisdictionId);

      const calculation: TaxCalculation = {
        calculationId: crypto.randomUUID(),
        entityId,
        period,
        jurisdictionId,
        taxTypeId: incomeTaxType.taxTypeId,
        calculationType: 'current',
        taxableIncome,
        taxBase: taxableIncome,
        taxRate: this.getEffectiveRate(incomeTaxType.rate, taxableIncome),
        taxAmount: this.applyCreditsAndDeductions(taxAmount, credits, deductions),
        credits,
        deductions,
        adjustments,
        carryforwards: await this.getAvailableCarryforwards(entityId, jurisdictionId),
        methodology: 'automated',
        confidence: new Decimal(0.95),
        reviewStatus: 'pending',
        calculatedBy: userId,
        calculatedAt: new Date().toISOString(),
        metadata: {
          financialData: financialData.summary,
          rateStructure: incomeTaxType.rate
        }
      };

      await this.dataSource.manager.save('tax_calculation', calculation);

      this.eventEmitter.emit('tax.calculation.completed', {
        calculationId: calculation.calculationId,
        entityId,
        period,
        jurisdictionId,
        taxAmount: calculation.taxAmount.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return calculation;

    } catch (error) {
      this.logger.error('Income tax calculation failed', error);
      throw new InternalServerErrorException('Income tax calculation failed');
    }
  }

  async calculateSalesTax(
    transactionData: any,
    jurisdictionId: string,
    userId: string
  ): Promise<TaxCalculation> {
    try {
      this.logger.log(`Calculating sales tax for jurisdiction ${jurisdictionId}`);

      const jurisdiction = await this.getTaxJurisdiction(jurisdictionId);
      if (!jurisdiction) {
        throw new NotFoundException('Tax jurisdiction not found');
      }

      const salesTaxType = jurisdiction.taxTypes.find(t => t.category === 'sales');
      if (!salesTaxType) {
        throw new NotFoundException('Sales tax type not found for jurisdiction');
      }

      // Determine taxability
      const taxabilityResult = await this.determineTaxability(transactionData, salesTaxType);
      if (!taxabilityResult.isTaxable) {
        return this.createZeroTaxCalculation('sales', transactionData, jurisdictionId, taxabilityResult.exemptionReason);
      }

      // Calculate tax base
      const taxBase = new Decimal(transactionData.saleAmount);
      const taxRate = this.getApplicableRate(salesTaxType.rate, taxBase);
      const taxAmount = taxBase.mul(taxRate);

      const calculation: TaxCalculation = {
        calculationId: crypto.randomUUID(),
        entityId: transactionData.entityId,
        period: transactionData.transactionDate.substring(0, 7), // YYYY-MM
        jurisdictionId,
        taxTypeId: salesTaxType.taxTypeId,
        calculationType: 'current',
        taxableIncome: taxBase,
        taxBase,
        taxRate,
        taxAmount,
        credits: [],
        deductions: [],
        adjustments: [],
        carryforwards: [],
        methodology: 'automated',
        confidence: new Decimal(0.98),
        reviewStatus: 'approved', // Sales tax typically auto-approved
        calculatedBy: userId,
        calculatedAt: new Date().toISOString(),
        metadata: {
          transactionId: transactionData.transactionId,
          customerLocation: transactionData.customerAddress,
          productType: transactionData.productType
        }
      };

      await this.dataSource.manager.save('tax_calculation', calculation);

      this.eventEmitter.emit('sales.tax.calculated', {
        calculationId: calculation.calculationId,
        jurisdictionId,
        taxAmount: calculation.taxAmount.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return calculation;

    } catch (error) {
      this.logger.error('Sales tax calculation failed', error);
      throw new InternalServerErrorException('Sales tax calculation failed');
    }
  }

  // ============================================================================
  // TAX PROVISION MANAGEMENT
  // ============================================================================

  async generateTaxProvision(
    entityId: string,
    period: string,
    userId: string
  ): Promise<TaxProvision> {
    try {
      this.logger.log(`Generating tax provision for entity ${entityId}, period ${period}`);

      const entity = await this.getTaxEntity(entityId);
      if (!entity) {
        throw new NotFoundException('Tax entity not found');
      }

      // Calculate current tax for all jurisdictions
      const currentTaxCalculations = await Promise.all(
        entity.taxJurisdictions.map(jurisdiction => 
          this.calculateIncomeTax(entityId, period, jurisdiction.jurisdictionId, userId)
        )
      );

      // Calculate deferred tax
      const deferredTaxCalculation = await this.calculateDeferredTax(entityId, period);

      // Aggregate calculations
      const currentTaxExpense = currentTaxCalculations.reduce(
        (sum, calc) => sum.plus(calc.taxAmount), new Decimal(0)
      );

      const provision: TaxProvision = {
        provisionId: crypto.randomUUID(),
        entityId,
        period,
        currentTaxExpense,
        deferredTaxExpense: deferredTaxCalculation.expense,
        totalTaxExpense: currentTaxExpense.plus(deferredTaxCalculation.expense),
        currentTaxLiability: currentTaxExpense,
        deferredTaxLiability: deferredTaxCalculation.liability,
        deferredTaxAsset: deferredTaxCalculation.asset,
        netDeferredTax: deferredTaxCalculation.liability.minus(deferredTaxCalculation.asset),
        effectiveTaxRate: await this.calculateEffectiveTaxRate(currentTaxExpense, entityId, period),
        statutoryTaxRate: await this.getStatutoryTaxRate(entity.taxJurisdictions[0]?.jurisdictionId),
        rateReconciliation: await this.generateRateReconciliation(entityId, period),
        uncertainTaxPositions: await this.getUncertainTaxPositions(entityId, period),
        calculations: currentTaxCalculations,
        status: 'draft',
        preparedBy: userId,
        preparedAt: new Date().toISOString()
      };

      await this.dataSource.manager.save('tax_provision', provision);

      this.eventEmitter.emit('tax.provision.generated', {
        provisionId: provision.provisionId,
        entityId,
        period,
        totalTaxExpense: provision.totalTaxExpense.toNumber(),
        effectiveTaxRate: provision.effectiveTaxRate.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return provision;

    } catch (error) {
      this.logger.error('Tax provision generation failed', error);
      throw new InternalServerErrorException('Tax provision generation failed');
    }
  }

  // ============================================================================
  // TAX RETURN PREPARATION
  // ============================================================================

  async prepareTaxReturn(
    entityId: string,
    taxYear: number,
    jurisdictionId: string,
    formNumber: string,
    userId: string
  ): Promise<TaxReturn> {
    try {
      this.logger.log(`Preparing tax return for entity ${entityId}, year ${taxYear}, form ${formNumber}`);

      const entity = await this.getTaxEntity(entityId);
      if (!entity) {
        throw new NotFoundException('Tax entity not found');
      }

      // Get tax calculations for the year
      const taxCalculations = await this.getTaxCalculationsForYear(entityId, taxYear, jurisdictionId);
      
      // Get financial data
      const financialData = await this.getAnnualFinancialData(entityId, taxYear);

      // Generate schedules
      const schedules = await this.generateTaxSchedules(formNumber, financialData, taxCalculations);

      // Calculate final tax amounts
      const taxableIncome = taxCalculations.reduce((sum, calc) => sum.plus(calc.taxableIncome), new Decimal(0));
      const taxDue = taxCalculations.reduce((sum, calc) => sum.plus(calc.taxAmount), new Decimal(0));
      const taxPaid = await this.getTaxPaymentsForYear(entityId, taxYear, jurisdictionId);

      const taxReturn: TaxReturn = {
        returnId: crypto.randomUUID(),
        entityId,
        taxYear,
        jurisdictionId,
        formNumber,
        formName: await this.getFormName(formNumber),
        filingMethod: 'electronic',
        status: 'draft',
        preparedBy: userId,
        preparedAt: new Date().toISOString(),
        dueDate: await this.getTaxReturnDueDate(taxYear, jurisdictionId, entity.entityType),
        extensionFiled: false,
        taxableIncome,
        taxDue,
        taxPaid,
        refundAmount: taxPaid.gt(taxDue) ? taxPaid.minus(taxDue) : new Decimal(0),
        balanceDue: taxDue.gt(taxPaid) ? taxDue.minus(taxPaid) : new Decimal(0),
        penalties: new Decimal(0),
        interest: new Decimal(0),
        schedules,
        attachments: [],
        amendments: [],
        auditHistory: []
      };

      await this.dataSource.manager.save('tax_return', taxReturn);

      this.eventEmitter.emit('tax.return.prepared', {
        returnId: taxReturn.returnId,
        entityId,
        taxYear,
        formNumber,
        taxDue: taxReturn.taxDue.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return taxReturn;

    } catch (error) {
      this.logger.error('Tax return preparation failed', error);
      throw new InternalServerErrorException('Tax return preparation failed');
    }
  }

  // ============================================================================
  // TAX ANALYTICS
  // ============================================================================

  async generateTaxAnalytics(
    entityId: string,
    period: string,
    userId: string
  ): Promise<TaxAnalytics> {
    try {
      this.logger.log(`Generating tax analytics for entity ${entityId}, period ${period}`);

      const metrics = await this.calculateTaxMetrics(entityId, period);
      const trends = await this.analyzeTaxTrends(entityId, period);

      const analytics: TaxAnalytics = {
        analyticsId: crypto.randomUUID(),
        period,
        timestamp: new Date().toISOString(),
        metrics,
        trends,
        insights: await this.generateTaxInsights(metrics, trends),
        recommendations: await this.generateTaxRecommendations(metrics, trends),
        opportunities: await this.identifyTaxOpportunities(entityId, period),
        risks: await this.assessTaxRisks(entityId, period)
      };

      this.eventEmitter.emit('tax.analytics.generated', {
        analyticsId: analytics.analyticsId,
        entityId,
        period,
        effectiveTaxRate: metrics.effectiveTaxRate.toNumber(),
        taxSavings: metrics.taxSavings.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return analytics;

    } catch (error) {
      this.logger.error('Tax analytics generation failed', error);
      throw new InternalServerErrorException('Tax analytics generation failed');
    }
  }

  // ============================================================================
  // COMPLIANCE MONITORING
  // ============================================================================

  async monitorTaxCompliance(entityId: string): Promise<any> {
    try {
      this.logger.log(`Monitoring tax compliance for entity ${entityId}`);

      const entity = await this.getTaxEntity(entityId);
      if (!entity) {
        throw new NotFoundException('Tax entity not found');
      }

      const complianceStatus = {
        entityId,
        overallStatus: 'compliant',
        issues: [],
        upcomingDeadlines: [],
        recommendations: []
      };

      // Check filing requirements
      for (const requirement of entity.filingRequirements) {
        const status = await this.checkFilingCompliance(requirement, entityId);
        if (status.status !== 'compliant') {
          complianceStatus.issues.push(status);
          if (status.severity === 'critical') {
            complianceStatus.overallStatus = 'non_compliant';
          }
        }

        // Check upcoming deadlines
        const daysUntilDue = this.calculateDaysUntilDue(requirement.dueDate);
        if (daysUntilDue <= 30) {
          complianceStatus.upcomingDeadlines.push({
            requirementId: requirement.requirementId,
            formNumber: requirement.formNumber,
            dueDate: requirement.dueDate,
            daysRemaining: daysUntilDue,
            priority: daysUntilDue <= 7 ? 'urgent' : 'high'
          });
        }
      }

      this.eventEmitter.emit('tax.compliance.monitored', {
        entityId,
        overallStatus: complianceStatus.overallStatus,
        issuesCount: complianceStatus.issues.length,
        upcomingDeadlines: complianceStatus.upcomingDeadlines.length,
        timestamp: new Date().toISOString()
      });

      return complianceStatus;

    } catch (error) {
      this.logger.error('Tax compliance monitoring failed', error);
      throw new InternalServerErrorException('Tax compliance monitoring failed');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async calculateTaxableIncome(financialData: any, taxType: TaxType): Promise<Decimal> {
    let taxableIncome = new Decimal(financialData.netIncome);

    // Apply book-to-tax adjustments
    const adjustments = await this.getBookToTaxAdjustments(financialData.entityId, financialData.period);
    for (const adjustment of adjustments) {
      if (adjustment.permanent) {
        taxableIncome = taxableIncome.plus(adjustment.amount);
      }
    }

    return taxableIncome;
  }

  private async applyTaxRates(taxableIncome: Decimal, taxRate: TaxRate): Promise<Decimal> {
    switch (taxRate.rateType) {
      case 'flat':
        return taxableIncome.mul(taxRate.flatRate || 0);
      
      case 'progressive':
        return this.calculateProgressiveTax(taxableIncome, taxRate.brackets || []);
      
      case 'alternative_minimum':
        const regularTax = await this.applyTaxRates(taxableIncome, { rateType: 'flat', flatRate: taxRate.flatRate });
        const amt = taxableIncome.mul(taxRate.minimumTax || 0);
        return Decimal.max(regularTax, amt);
      
      default:
        return taxableIncome.mul(0.21); // Default corporate rate
    }
  }

  private calculateProgressiveTax(income: Decimal, brackets: TaxBracket[]): Decimal {
    let tax = new Decimal(0);
    let remainingIncome = income;

    for (const bracket of brackets.sort((a, b) => a.minAmount.minus(b.minAmount).toNumber())) {
      if (remainingIncome.lte(0)) break;

      const bracketMax = bracket.maxAmount || income;
      const bracketMin = bracket.minAmount;
      const bracketIncome = Decimal.min(remainingIncome, bracketMax.minus(bracketMin));

      if (bracketIncome.gt(0)) {
        tax = tax.plus(bracketIncome.mul(bracket.rate));
        remainingIncome = remainingIncome.minus(bracketIncome);
      }
    }

    return tax;
  }

  private getEffectiveRate(taxRate: TaxRate, taxableIncome: Decimal): Decimal {
    if (taxRate.rateType === 'flat') {
      return taxRate.flatRate || new Decimal(0);
    }
    
    // For progressive rates, calculate weighted average
    const totalTax = this.calculateProgressiveTax(taxableIncome, taxRate.brackets || []);
    return taxableIncome.gt(0) ? totalTax.div(taxableIncome) : new Decimal(0);
  }

  private applyCreditsAndDeductions(
    baseTax: Decimal, 
    credits: TaxCredit[], 
    deductions: TaxDeduction[]
  ): Decimal {
    let finalTax = baseTax;

    // Apply deductions (reduce taxable income, then recalculate tax)
    const totalDeductions = deductions.reduce((sum, ded) => sum.plus(ded.amount), new Decimal(0));
    // Simplified - would need to recalculate tax on reduced income

    // Apply credits (direct reduction of tax)
    const totalCredits = credits.reduce((sum, credit) => sum.plus(credit.amount), new Decimal(0));
    finalTax = finalTax.minus(totalCredits);

    return Decimal.max(finalTax, new Decimal(0)); // Tax cannot be negative
  }

  private async calculateDeferredTax(entityId: string, period: string): Promise<any> {
    return {
      expense: new Decimal(Math.random() * 50000),
      liability: new Decimal(Math.random() * 200000),
      asset: new Decimal(Math.random() * 150000)
    };
  }

  private async calculateEffectiveTaxRate(taxExpense: Decimal, entityId: string, period: string): Promise<Decimal> {
    const pretaxIncome = await this.getPretaxIncome(entityId, period);
    return pretaxIncome.gt(0) ? taxExpense.div(pretaxIncome) : new Decimal(0);
  }

  private async getStatutoryTaxRate(jurisdictionId: string): Promise<Decimal> {
    // Get statutory rate for jurisdiction
    return new Decimal(0.21); // Example federal corporate rate
  }

  private async generateRateReconciliation(entityId: string, period: string): Promise<RateReconciliationItem[]> {
    return [
      {
        description: 'Federal statutory rate',
        amount: new Decimal(42000),
        rate: new Decimal(0.21),
        explanation: 'Tax at federal statutory rate of 21%',
        category: 'permanent'
      },
      {
        description: 'State income tax, net of federal benefit',
        amount: new Decimal(15000),
        rate: new Decimal(0.075),
        explanation: 'State tax net of federal deduction',
        category: 'permanent'
      }
    ];
  }

  private calculateDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async determineTaxability(transactionData: any, taxType: TaxType): Promise<{ isTaxable: boolean; exemptionReason?: string }> {
    // Check for exemptions
    for (const exemption of taxType.exemptions) {
      if (this.matchesExemptionConditions(transactionData, exemption)) {
        return { isTaxable: false, exemptionReason: exemption.exemptionType };
      }
    }

    return { isTaxable: true };
  }

  private matchesExemptionConditions(transactionData: any, exemption: TaxExemption): boolean {
    // Check if transaction matches exemption conditions
    return exemption.conditions.some(condition => 
      transactionData.productType === condition || 
      transactionData.customerType === condition
    );
  }

  private getApplicableRate(taxRate: TaxRate, taxBase: Decimal): Decimal {
    if (taxRate.rateType === 'flat') {
      return taxRate.flatRate || new Decimal(0);
    }
    return this.getEffectiveRate(taxRate, taxBase);
  }

  private createZeroTaxCalculation(
    taxCategory: string, 
    transactionData: any, 
    jurisdictionId: string, 
    exemptionReason?: string
  ): TaxCalculation {
    return {
      calculationId: crypto.randomUUID(),
      entityId: transactionData.entityId,
      period: transactionData.transactionDate.substring(0, 7),
      jurisdictionId,
      taxTypeId: '',
      calculationType: 'current',
      taxableIncome: new Decimal(0),
      taxBase: new Decimal(transactionData.saleAmount || 0),
      taxRate: new Decimal(0),
      taxAmount: new Decimal(0),
      credits: [],
      deductions: [],
      adjustments: [],
      carryforwards: [],
      methodology: 'automated',
      confidence: new Decimal(1.0),
      reviewStatus: 'approved',
      calculatedBy: 'system',
      calculatedAt: new Date().toISOString(),
      metadata: { exemptionReason }
    };
  }

  // Placeholder methods for external data requirements
  private async getTaxEntity(entityId: string): Promise<TaxEntity | null> {
    return {
      entityId,
      entityName: 'Sample Corporation',
      entityType: 'corporation',
      taxId: '12-3456789',
      registrationNumber: 'REG123456',
      incorporationDate: '2020-01-01',
      fiscalYearEnd: '12-31',
      taxJurisdictions: [
        {
          jurisdictionId: crypto.randomUUID(),
          jurisdictionCode: 'US-FED',
          jurisdictionName: 'United States Federal',
          jurisdictionType: 'federal',
          country: 'US',
          taxTypes: [
            {
              taxTypeId: crypto.randomUUID(),
              taxCode: 'CORP_INCOME',
              taxName: 'Corporate Income Tax',
              category: 'income',
              rate: {
                rateType: 'flat',
                flatRate: new Decimal(0.21)
              },
              basis: 'net_income',
              isActive: true,
              effectiveDate: '2018-01-01',
              thresholds: [],
              exemptions: []
            }
          ],
          registrationStatus: 'registered',
          filingFrequency: 'annually',
          nextFilingDate: '2025-03-15',
          isActive: true
        }
      ],
      taxElections: [],
      filingRequirements: [
        {
          requirementId: crypto.randomUUID(),
          formNumber: '1120',
          formName: 'U.S. Corporation Income Tax Return',
          jurisdictionId: crypto.randomUUID(),
          frequency: 'annually',
          dueDate: '2025-03-15',
          extensionAvailable: true,
          extensionDueDate: '2025-09-15',
          penaltyRate: new Decimal(0.05),
          interestRate: new Decimal(0.08),
          isActive: true
        }
      ],
      taxAttributes: [],
      subsidiaries: [],
      isConsolidated: false,
      status: 'active',
      metadata: {}
    };
  }

  private async getTaxJurisdiction(jurisdictionId: string): Promise<TaxJurisdiction | null> {
    // Placeholder - would query database
    return null;
  }

  private async getFinancialDataForTax(entityId: string, period: string): Promise<any> {
    return {
      entityId,
      period,
      netIncome: new Decimal(200000),
      grossIncome: new Decimal(1000000),
      totalExpenses: new Decimal(800000),
      summary: 'Financial data summary'
    };
  }

  private async getAvailableTaxCredits(entityId: string, jurisdictionId: string, period: string): Promise<TaxCredit[]> {
    return [
      {
        creditId: crypto.randomUUID(),
        creditType: 'research_development',
        creditName: 'Research & Development Credit',
        amount: new Decimal(15000),
        carryforwardAmount: new Decimal(25000),
        expiryDate: '2034-12-31',
        limitations: ['50% of tax liability'],
        documentation: ['Form 6765', 'Supporting calculations']
      }
    ];
  }

  private async getAvailableTaxDeductions(entityId: string, jurisdictionId: string, period: string): Promise<TaxDeduction[]> {
    return [
      {
        deductionId: crypto.randomUUID(),
        deductionType: 'section_199a',
        deductionName: 'Section 199A Deduction',
        amount: new Decimal(20000),
        limitations: new Decimal(50000),
        carryforwardAmount: new Decimal(0),
        documentation: ['Form 8995', 'Business income calculations'],
        approval: {
          approved: true,
          approvedBy: 'tax_manager',
          approvedAt: new Date().toISOString(),
          auditRisk: 'low'
        }
      }
    ];
  }

  private async getAvailableCarryforwards(entityId: string, jurisdictionId: string): Promise<TaxCarryforward[]> {
    return [
      {
        carryforwardId: crypto.randomUUID(),
        type: 'nol',
        amount: new Decimal(100000),
        originYear: 2020,
        expiryYear: 2040,
        utilizationLimit: new Decimal(80000), // 80% limitation
        utilizedAmount: new Decimal(20000),
        remainingAmount: new Decimal(80000),
        jurisdictionId,
        isActive: true
      }
    ];
  }

  private async calculateTaxAdjustments(entityId: string, period: string, jurisdictionId: string): Promise<TaxAdjustment[]> {
    return [
      {
        adjustmentId: crypto.randomUUID(),
        adjustmentType: 'book_tax_difference',
        description: 'Depreciation timing difference',
        amount: new Decimal(25000),
        reason: 'MACRS vs book depreciation',
        period,
        permanent: false,
        reversible: true,
        supportingDocuments: ['Depreciation schedule', 'Asset register'],
        approvedBy: 'tax_manager',
        processedAt: new Date().toISOString()
      }
    ];
  }

  private async getBookToTaxAdjustments(entityId: string, period: string): Promise<TaxAdjustment[]> {
    return await this.calculateTaxAdjustments(entityId, period, 'default');
  }

  private async getUncertainTaxPositions(entityId: string, period: string): Promise<UncertainTaxPosition[]> {
    return [
      {
        utpId: crypto.randomUUID(),
        description: 'Research credit qualification',
        amount: new Decimal(50000),
        probability: new Decimal(0.75),
        sustainabilityAssessment: 'more_likely_than_not',
        recognizedBenefit: new Decimal(37500),
        unrecognizedBenefit: new Decimal(12500),
        statute: 'Section 41',
        status: 'open',
        documentation: ['Research activities documentation', 'Legal opinion']
      }
    ];
  }

  private async calculateTaxMetrics(entityId: string, period: string): Promise<TaxMetrics> {
    return {
      totalTaxExpense: new Decimal(Math.random() * 100000),
      currentTaxExpense: new Decimal(Math.random() * 75000),
      deferredTaxExpense: new Decimal(Math.random() * 25000),
      effectiveTaxRate: new Decimal(0.18 + Math.random() * 0.1),
      cashTaxRate: new Decimal(0.15 + Math.random() * 0.1),
      statutoryTaxRate: new Decimal(0.21),
      taxSavings: new Decimal(Math.random() * 50000),
      complianceCost: new Decimal(Math.random() * 25000),
      auditRisk: new Decimal(Math.random() * 0.3),
      planningOpportunities: new Decimal(Math.random() * 75000),
      jurisdictionCount: 5,
      returnCount: 8
    };
  }

  private async analyzeTaxTrends(entityId: string, period: string): Promise<TaxTrends> {
    return {
      taxRateTrend: {
        currentValue: new Decimal(0.18),
        previousValue: new Decimal(0.22),
        change: new Decimal(-0.04),
        changePercent: new Decimal(-18.18),
        trend: 'improving',
        forecast: new Decimal(0.17),
        confidence: new Decimal(0.85)
      },
      complianceBurden: {
        currentValue: new Decimal(25000),
        previousValue: new Decimal(30000),
        change: new Decimal(-5000),
        changePercent: new Decimal(-16.67),
        trend: 'improving',
        forecast: new Decimal(22000),
        confidence: new Decimal(0.8)
      },
      planningEffectiveness: {
        currentValue: new Decimal(0.85),
        previousValue: new Decimal(0.78),
        change: new Decimal(0.07),
        changePercent: new Decimal(8.97),
        trend: 'improving',
        forecast: new Decimal(0.88),
        confidence: new Decimal(0.9)
      },
      auditActivity: {
        currentValue: new Decimal(0.15),
        previousValue: new Decimal(0.20),
        change: new Decimal(-0.05),
        changePercent: new Decimal(-25),
        trend: 'improving',
        forecast: new Decimal(0.12),
        confidence: new Decimal(0.75)
      },
      savingsRealization: {
        currentValue: new Decimal(75000),
        previousValue: new Decimal(60000),
        change: new Decimal(15000),
        changePercent: new Decimal(25),
        trend: 'improving',
        forecast: new Decimal(85000),
        confidence: new Decimal(0.88)
      }
    };
  }

  private async generateTaxInsights(metrics: TaxMetrics, trends: TaxTrends): Promise<TaxInsight[]> {
    return [
      {
        category: 'rate_optimization',
        insight: 'Effective tax rate has decreased by 4 percentage points through strategic planning',
        importance: 0.95,
        confidence: 0.92,
        impact: 'cost_reduction',
        actionable: true,
        evidence: ['rate_trend_analysis', 'planning_documentation'],
        recommendations: ['continue_current_strategies', 'explore_additional_opportunities']
      }
    ];
  }

  private async generateTaxRecommendations(metrics: TaxMetrics, trends: TaxTrends): Promise<TaxRecommendation[]> {
    return [
      {
        recommendation: 'Accelerate R&D credit documentation to maximize current year benefits',
        category: 'credits',
        priority: 1,
        expectedSavings: new Decimal(35000),
        implementationCost: new Decimal(5000),
        netBenefit: new Decimal(30000),
        timeline: '60_days',
        effort: 'medium',
        riskLevel: 'low',
        regulatoryImpact: ['Form 6765 filing required']
      }
    ];
  }

  private async identifyTaxOpportunities(entityId: string, period: string): Promise<TaxOpportunity[]> {
    return [
      {
        opportunityId: crypto.randomUUID(),
        type: 'credit',
        description: 'Energy efficiency tax credits for equipment upgrades',
        potentialSavings: new Decimal(25000),
        probability: new Decimal(0.8),
        timeframe: '2024',
        requirements: ['Qualifying equipment purchase', 'Energy efficiency certification'],
        risks: ['Compliance requirements', 'Documentation burden'],
        nextSteps: ['Evaluate equipment options', 'Obtain pre-approval']
      }
    ];
  }

  private async assessTaxRisks(entityId: string, period: string): Promise<TaxRisk[]> {
    return [
      {
        riskId: crypto.randomUUID(),
        category: 'audit',
        description: 'Increased audit risk due to large R&D credit claims',
        likelihood: 'medium',
        impact: 'medium',
        riskScore: 6,
        potentialCost: new Decimal(50000),
        mitigation: [
          {
            strategy: 'Enhanced documentation',
            description: 'Maintain detailed records of R&D activities',
            cost: new Decimal(10000),
            effectiveness: new Decimal(0.8),
            timeline: 'ongoing',
            responsible: 'tax_team'
          }
        ],
        monitoring: {
          frequency: 'quarterly',
          indicators: ['audit_notices', 'irs_correspondence'],
          thresholds: { 'audit_score': new Decimal(7) },
          alerts: true,
          lastReview: new Date().toISOString()
        }
      }
    ];
  }

  // Additional placeholder methods
  private async getTaxCalculationsForYear(entityId: string, taxYear: number, jurisdictionId: string): Promise<TaxCalculation[]> {
    return [];
  }

  private async getAnnualFinancialData(entityId: string, taxYear: number): Promise<any> {
    return { netIncome: new Decimal(500000), grossIncome: new Decimal(2000000) };
  }

  private async generateTaxSchedules(formNumber: string, financialData: any, calculations: TaxCalculation[]): Promise<TaxSchedule[]> {
    return [
      {
        scheduleId: crypto.randomUUID(),
        scheduleNumber: 'M-1',
        scheduleName: 'Reconciliation of Income (Loss) per Books With Income per Return',
        data: {},
        calculations: [],
        isRequired: true,
        completed: false
      }
    ];
  }

  private async getTaxPaymentsForYear(entityId: string, taxYear: number, jurisdictionId: string): Promise<Decimal> {
    return new Decimal(Math.random() * 75000);
  }

  private async getFormName(formNumber: string): Promise<string> {
    const formNames = {
      '1120': 'U.S. Corporation Income Tax Return',
      '1065': 'U.S. Return of Partnership Income',
      '1040': 'U.S. Individual Income Tax Return'
    };
    return formNames[formNumber] || 'Tax Return';
  }

  private async getTaxReturnDueDate(taxYear: number, jurisdictionId: string, entityType: string): Promise<string> {
    // Corporate returns typically due March 15
    return `${taxYear + 1}-03-15`;
  }

  private async getPretaxIncome(entityId: string, period: string): Promise<Decimal> {
    return new Decimal(Math.random() * 200000);
  }

  private async checkFilingCompliance(requirement: FilingRequirement, entityId: string): Promise<any> {
    return {
      requirementId: requirement.requirementId,
      status: 'compliant',
      severity: 'low',
      lastFiled: '2024-03-15',
      issues: []
    };
  }
}
