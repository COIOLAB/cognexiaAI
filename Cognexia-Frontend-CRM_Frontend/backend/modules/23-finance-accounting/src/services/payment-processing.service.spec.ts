import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentProcessingService } from './payment-processing.service';
import { PaymentTransaction } from '../entities';
import Decimal from 'decimal.js';

describe('PaymentProcessingService', () => {
  let service: PaymentProcessingService;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const eventEmitterMock = {
      emit: jest.fn(),
    };

    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessingService,
        { provide: getRepositoryToken(PaymentTransaction), useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = module.get<PaymentProcessingService>(PaymentProcessingService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forecastCashFlow', () => {
    it('should generate a baseline cash flow forecast', async () => {
      const result = await service.forecastCashFlow({
        days: 7,
        baselineDailyNet: 1000,
        seasonality: [1, 0.8, 1.2],
      });

      expect(result.forecastId).toMatch(/FCF_\d+/);
      expect(result.horizonDays).toBe(7);
      expect(result.series).toHaveLength(7);
      expect(result.series[0]).toHaveProperty('date');
      expect(result.series[0]).toHaveProperty('inflow');
      expect(result.series[0]).toHaveProperty('outflow');
      expect(result.series[0]).toHaveProperty('net');
      expect(result.assumptions.baselineDailyNet).toBe(1000);
    });

    it('should handle edge case with zero baseline', async () => {
      const result = await service.forecastCashFlow({
        days: 1,
        baselineDailyNet: 0,
      });

      expect(result.series).toHaveLength(1);
      expect(result.series[0].inflow).toBe(0);
      expect(result.series[0].outflow).toBe(0);
      expect(result.series[0].net).toBe(0);
    });
  });

  describe('optimizeDisbursementSchedule', () => {
    it('should optimize a simple disbursement schedule', async () => {
      const input = {
        payables: [
          {
            id: 'INV_001',
            amount: 1000,
            currency: 'USD',
            dueDate: '2026-09-01T00:00:00.000Z',
          },
          {
            id: 'INV_002',
            amount: 2000,
            currency: 'USD',
            dueDate: '2026-09-02T00:00:00.000Z',
          },
        ],
      };

      const result = await service.optimizeDisbursementSchedule(input);

      expect(result.optimizationId).toMatch(/DSP_\d+/);
      expect(result.schedule).toHaveLength(2);
      expect(result.feesEstimate).toBeGreaterThan(0);
      expect(result.discountsCaptured).toHaveLength(0);
    });

    it('should capture discounts when preferDiscounts is true', async () => {
      const input = {
        payables: [
          {
            id: 'INV_003',
            amount: 5000,
            currency: 'USD',
            dueDate: '2026-09-30T00:00:00.000Z',
            discount: {
              rate: 0.02,
              deadline: '2026-09-10T00:00:00.000Z',
            },
          },
        ],
        constraints: {
          preferDiscounts: true,
        },
      };

      const result = await service.optimizeDisbursementSchedule(input);

      expect(result.discountsCaptured).toHaveLength(1);
      expect(result.discountsCaptured[0].payableId).toBe('INV_003');
      expect(result.discountsCaptured[0].discountAmount).toBe(100); // 2% of 5000
    });
  });

  describe('recommendEarlyPaymentDiscount', () => {
    it('should recommend taking a favorable discount', async () => {
      const input = {
        invoiceAmount: 10000,
        discountRate: 0.02, // 2%
        discountDeadline: '2026-09-10T00:00:00.000Z',
        netDueDate: '2026-09-30T00:00:00.000Z',
        costOfCapitalAPR: 0.10, // 10%
      };

      const result = await service.recommendEarlyPaymentDiscount(input);

      expect(result.takeDiscount).toBe(true);
      expect(result.effectiveAPR).toBeGreaterThan(0.1); // Should exceed cost of capital
      expect(result.rationale).toHaveLength(2);
    });

    it('should not recommend taking an unfavorable discount', async () => {
      const input = {
        invoiceAmount: 10000,
        discountRate: 0.005, // 0.5%
        // Large window between discount deadline and net due leads to low effective APR
        discountDeadline: '2026-02-01T00:00:00.000Z',
        netDueDate: '2026-08-01T00:00:00.000Z', // ~180 days -> ~1.0% APR
        costOfCapitalAPR: 0.15, // 15%
      };

      const result = await service.recommendEarlyPaymentDiscount(input);

      expect(result.takeDiscount).toBe(false);
      expect(result.effectiveAPR).toBeLessThan(0.15); // Should be below cost of capital
    });
  });

  describe('selectOptimalPaymentRail', () => {
    it('should select ACH for low urgency, low amount', async () => {
      const result = await service.selectOptimalPaymentRail({
        amount: 1000,
        urgency: 'low',
      });

      expect(result.method).toBe('ach');
      expect(result.etaHours).toBeGreaterThan(0);
      expect(result.estimatedFees).toBeGreaterThan(0);
    });

    it('should select wire for high urgency, high amount', async () => {
      const result = await service.selectOptimalPaymentRail({
        amount: 100000,
        urgency: 'high',
      });

      expect(result.method).toBe('wire');
      expect(result.etaHours).toBeLessThan(24);
      expect(result.estimatedFees).toBe(25); // Fixed wire fee
    });

    it('should select card for high urgency, low amount', async () => {
      const result = await service.selectOptimalPaymentRail({
        amount: 1000,
        urgency: 'high',
      });

      expect(result.method).toBe('card');
      expect(result.etaHours).toBe(1);
    });

    it('should prefer ACH when low fees are requested', async () => {
      const result = await service.selectOptimalPaymentRail({
        amount: 50000,
        urgency: 'medium',
        preferLowFees: true,
      });

      expect(result.method).toBe('ach');
      expect(result.rationale).toContain('Low fee preference favors ACH.');
    });
  });

  describe('simulatePaymentScenarios', () => {
    it('should simulate and rank payment scenarios', async () => {
      const input = {
        scenarios: [
          {
            id: 'scenario_1',
            description: 'All ACH',
            payments: [
              {
                amount: 1000,
                method: 'ach' as const,
                date: '2025-09-01T00:00:00.000Z',
              },
              {
                amount: 2000,
                method: 'ach' as const,
                date: '2025-09-02T00:00:00.000Z',
              },
            ],
          },
          {
            id: 'scenario_2',
            description: 'Mixed methods',
            payments: [
              {
                amount: 1000,
                method: 'wire' as const,
                date: '2025-09-01T00:00:00.000Z',
              },
              {
                amount: 2000,
                method: 'card' as const,
                date: '2025-09-02T00:00:00.000Z',
              },
            ],
          },
        ],
      };

      const result = await service.simulatePaymentScenarios(input);

      expect(result.simulationId).toMatch(/SIM_\d+/);
      expect(result.results).toHaveLength(2);
      expect(result.bestScenarioId).toBeDefined();

      // ACH scenario should have lower fees
      const achScenario = result.results.find(r => r.scenarioId === 'scenario_1');
      const mixedScenario = result.results.find(r => r.scenarioId === 'scenario_2');
      
      expect(achScenario).toBeDefined();
      expect(mixedScenario).toBeDefined();
      expect(achScenario!.totalFees).toBeLessThan(mixedScenario!.totalFees);
    });

    it('should handle empty scenarios gracefully', async () => {
      const result = await service.simulatePaymentScenarios({
        scenarios: [],
      });

      expect(result.results).toHaveLength(0);
      expect(result.bestScenarioId).toBeNull();
    });
  });

  describe('processPayment', () => {
    it('should process a valid payment request', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'ach' as const,
        description: 'Test payment',
      };

      const result = await service.processPayment(paymentRequest, 'user123');

      expect(result.paymentId).toMatch(/PAY_/);
      expect(result.status).toBe('processing');
      expect(result.fees).toBeGreaterThan(0);
      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.processed', expect.any(Object));
    });

    it('should validate payment amount', async () => {
      const paymentRequest = {
        amount: 0,
        currency: 'USD',
        paymentMethod: 'ach' as const,
      };

      await expect(service.processPayment(paymentRequest, 'user123')).rejects.toThrow(
        'Payment validation failed'
      );
    });

    it('should validate currency', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'INVALID',
        paymentMethod: 'ach' as const,
      };

      await expect(service.processPayment(paymentRequest, 'user123')).rejects.toThrow(
        'Unsupported currency'
      );
    });
  });

  describe('validatePayment', () => {
    it('should validate a correct payment request', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'ach' as const,
      };

      const result = await service.validatePayment(paymentRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect high-risk payments', async () => {
      const paymentRequest = {
        amount: 2000000, // Large amount
        currency: 'USD',
        paymentMethod: 'crypto' as const, // High-risk method
      };

      const result = await service.validatePayment(paymentRequest);

      expect(result.isValid).toBe(true); // Still valid but risky
      expect(result.riskScore).toBeGreaterThan(50);
      expect(result.warnings).toContain('Large payment amount detected');
    });
  });

  describe('Payment method specific processing', () => {
    it('should process wire payments with fixed fees', async () => {
      const mockPayment = { id: 'test', amount: 10000 };
      const result = await (service as any).processWirePayment(mockPayment);

      expect(result.fees).toBe(25);
      expect(result.status).toBe('processing');
      expect(result.transactionId).toMatch(/WIRE_/);
    });

    it('should process card payments with percentage fees', async () => {
      const mockPayment = { id: 'test', amount: 1000 };
      const result = await (service as any).processCardPayment(mockPayment);

      expect(result.fees).toBe(29); // 2.9% of 1000
      expect(result.status).toBe('completed');
      expect(result.transactionId).toMatch(/CARD_/);
    });

    it('should process check payments as pending', async () => {
      const mockPayment = { id: 'test', amount: 1000 };
      const result = await (service as any).processCheckPayment(mockPayment);

      expect(result.status).toBe('pending');
      expect(result.fees).toBe(2.5);
      expect(result.transactionId).toMatch(/CHECK_/);
    });
  });
});
