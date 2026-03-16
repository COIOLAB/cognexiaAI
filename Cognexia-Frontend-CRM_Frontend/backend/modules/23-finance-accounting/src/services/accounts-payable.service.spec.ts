/**
 * Accounts Payable Service Unit Tests
 * Comprehensive test suite for AP invoice and vendor payment management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AccountsPayableService } from './accounts-payable.service';
import Decimal from 'decimal.js';

describe('AccountsPayableService', () => {
  let service: AccountsPayableService;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let configService: jest.Mocked<ConfigService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
      },
    } as any;

    dataSource = {
      createQueryRunner: jest.fn(() => queryRunner),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
      },
    } as any;

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'ap.autoApprovalThreshold': 1000,
          'ap.paymentTerms.default': 'NET30',
          'ap.currency.default': 'USD',
        };
        return config[key];
      }),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsPayableService,
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: configService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<AccountsPayableService>(AccountsPayableService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have required dependencies injected', () => {
      expect(service['dataSource']).toBeDefined();
      expect(service['configService']).toBeDefined();
      expect(service['eventEmitter']).toBeDefined();
    });
  });

  describe('createInvoice', () => {
    const validInvoiceData = {
      invoiceNumber: 'INV-001',
      vendorId: 'vendor-123',
      vendorCode: 'VEN001',
      vendorName: 'Test Vendor LLC',
      invoiceDate: '2026-01-28',
      dueDate: '2026-02-27',
      paymentTerms: 'NET30',
      subtotal: 1000,
      taxAmount: 80,
      discountAmount: 0,
      totalAmount: 1080,
      currencyCode: 'USD',
      lineItems: [
        {
          description: 'Office Supplies',
          quantity: 10,
          unitPrice: 100,
          lineTotal: 1000,
          taxAmount: 80,
          discountAmount: 0,
          glAccount: '5000',
        },
      ],
    };

    it('should create a new vendor invoice successfully', async () => {
      const userId = 'user-123';
      queryRunner.manager.save.mockResolvedValue(validInvoiceData);

      const result = await service.createInvoice(validInvoiceData, userId);

      expect(result).toBeDefined();
      expect(result.invoiceId).toBeDefined();
      expect(result.invoiceNumber).toBe('INV-001');
      expect(result.status).toBe('pending');
      expect(result.totalAmount.toNumber()).toBe(1080);
      expect(result.outstandingAmount.toNumber()).toBe(1080);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'ap.invoice.created',
        expect.objectContaining({
          invoiceId: expect.any(String),
          vendorId: 'vendor-123',
          amount: 1080,
        })
      );
    });

    it('should validate line items total matches invoice total', async () => {
      const invalidData = {
        ...validInvoiceData,
        totalAmount: 5000, // Doesn't match line items
      };

      await expect(
        service.createInvoice(invalidData, 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle missing vendor information', async () => {
      const missingVendor = {
        ...validInvoiceData,
        vendorId: '',
      };

      await expect(
        service.createInvoice(missingVendor, 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should create invoice with multiple line items', async () => {
      const multiLineData = {
        ...validInvoiceData,
        subtotal: 2000,
        taxAmount: 160,
        totalAmount: 2160,
        lineItems: [
          {
            description: 'Item 1',
            quantity: 5,
            unitPrice: 100,
            lineTotal: 500,
            taxAmount: 40,
            discountAmount: 0,
            glAccount: '5000',
          },
          {
            description: 'Item 2',
            quantity: 10,
            unitPrice: 150,
            lineTotal: 1500,
            taxAmount: 120,
            discountAmount: 0,
            glAccount: '5100',
          },
        ],
      };

      queryRunner.manager.save.mockResolvedValue(multiLineData);

      const result = await service.createInvoice(multiLineData, 'user-123');

      expect(result.lineItems).toHaveLength(2);
      expect(result.subtotal.toNumber()).toBe(2000);
    });

    it('should rollback transaction on error', async () => {
      queryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createInvoice(validInvoiceData, 'user-123')
      ).rejects.toThrow(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle discount calculations correctly', async () => {
      const discountedData = {
        ...validInvoiceData,
        subtotal: 1000,
        taxAmount: 80,
        discountAmount: 100,
        totalAmount: 980,
      };

      queryRunner.manager.save.mockResolvedValue(discountedData);

      const result = await service.createInvoice(discountedData, 'user-123');

      expect(result.discountAmount.toNumber()).toBe(100);
      expect(result.totalAmount.toNumber()).toBe(980);
    });
  });

  describe('approveInvoice', () => {
    const pendingInvoice = {
      invoiceId: 'invoice-123',
      invoiceNumber: 'INV-001',
      status: 'pending',
      totalAmount: new Decimal(1080),
      approvals: [],
      auditTrail: [],
    };

    beforeEach(() => {
      jest.spyOn(service, 'getInvoice').mockResolvedValue(pendingInvoice as any);
    });

    it('should approve a pending invoice', async () => {
      queryRunner.manager.save.mockResolvedValue({
        ...pendingInvoice,
        status: 'approved',
      });

      const result = await service.approveInvoice('invoice-123', 'approver-123', 'Looks good');

      expect(result.status).toBe('approved');
      expect(result.approvals).toHaveLength(1);
      expect(result.approvals[0].approver).toBe('approver-123');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'ap.invoice.approved',
        expect.any(Object)
      );
    });

    it('should throw NotFoundException for non-existent invoice', async () => {
      jest.spyOn(service, 'getInvoice').mockResolvedValue(null);

      await expect(
        service.approveInvoice('invalid-id', 'approver-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject approval of already approved invoice', async () => {
      const approvedInvoice = { ...pendingInvoice, status: 'approved' };
      jest.spyOn(service, 'getInvoice').mockResolvedValue(approvedInvoice as any);

      await expect(
        service.approveInvoice('invoice-123', 'approver-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle multi-level approval workflow', async () => {
      const invoice = {
        ...pendingInvoice,
        approvals: [
          {
            approvalId: 'approval-001',
            approver: 'approver-1',
            level: 1,
            status: 'approved',
            timestamp: '2026-01-28T10:00:00.000Z',
          },
        ],
      };

      jest.spyOn(service, 'getInvoice').mockResolvedValue(invoice as any);
      queryRunner.manager.save.mockResolvedValue(invoice);

      const result = await service.approveInvoice('invoice-123', 'approver-2', 'Approved');

      expect(result.approvals).toHaveLength(2);
      expect(result.approvals[1].level).toBe(2);
    });
  });

  describe('processPayment', () => {
    const approvedInvoice = {
      invoiceId: 'invoice-123',
      invoiceNumber: 'INV-001',
      vendorId: 'vendor-123',
      totalAmount: new Decimal(1080),
      outstandingAmount: new Decimal(1080),
      status: 'approved',
      payments: [],
      currencyCode: 'USD',
    };

    const paymentRequest = {
      paymentMethod: 'ach' as const,
      paymentDate: '2026-01-28',
      amount: 1080,
      bankAccount: 'BANK-001',
      reference: 'Payment for INV-001',
    };

    beforeEach(() => {
      jest.spyOn(service, 'getInvoice').mockResolvedValue(approvedInvoice as any);
    });

    it('should process payment for approved invoice', async () => {
      queryRunner.manager.save.mockResolvedValue({
        ...approvedInvoice,
        status: 'paid',
        outstandingAmount: new Decimal(0),
      });

      const result = await service.processPayment(
        'invoice-123',
        paymentRequest,
        'user-123'
      );

      expect(result.status).toBe('paid');
      expect(result.outstandingAmount.toNumber()).toBe(0);
      expect(result.payments).toHaveLength(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'ap.payment.processed',
        expect.any(Object)
      );
    });

    it('should handle partial payments', async () => {
      const partialPayment = {
        ...paymentRequest,
        amount: 500,
      };

      queryRunner.manager.save.mockResolvedValue({
        ...approvedInvoice,
        status: 'partially_paid',
        outstandingAmount: new Decimal(580),
      });

      const result = await service.processPayment(
        'invoice-123',
        partialPayment,
        'user-123'
      );

      expect(result.outstandingAmount.toNumber()).toBe(580);
      expect(result.status).toBe('partially_paid');
    });

    it('should reject payment amount exceeding outstanding balance', async () => {
      const overpayment = {
        ...paymentRequest,
        amount: 2000,
      };

      await expect(
        service.processPayment('invoice-123', overpayment, 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject payment for non-approved invoice', async () => {
      const pendingInvoice = { ...approvedInvoice, status: 'pending' };
      jest.spyOn(service, 'getInvoice').mockResolvedValue(pendingInvoice as any);

      await expect(
        service.processPayment('invoice-123', paymentRequest, 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate and apply payment fees', async () => {
      queryRunner.manager.save.mockResolvedValue({
        ...approvedInvoice,
        payments: [
          {
            paymentId: 'payment-001',
            amount: new Decimal(1080),
            fees: new Decimal(2.70), // 0.25% for ACH
          },
        ],
      });

      const result = await service.processPayment(
        'invoice-123',
        paymentRequest,
        'user-123'
      );

      expect(result.payments[0].fees.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('getAgingReport', () => {
    it('should generate aging report with correct buckets', async () => {
      const mockInvoices = [
        {
          invoiceId: 'inv-001',
          dueDate: '2026-01-20', // 8 days overdue
          outstandingAmount: new Decimal(1000),
        },
        {
          invoiceId: 'inv-002',
          dueDate: '2026-01-10', // 18 days overdue
          outstandingAmount: new Decimal(2000),
        },
        {
          invoiceId: 'inv-003',
          dueDate: '2025-12-15', // 44 days overdue
          outstandingAmount: new Decimal(500),
        },
      ];

      dataSource.manager.find.mockResolvedValue(mockInvoices);

      const result = await service.getAgingReport('2026-01-28');

      expect(result).toBeDefined();
      expect(result.buckets).toBeDefined();
      expect(result.totalOutstanding).toBeInstanceOf(Decimal);
      expect(result.buckets['0-30']).toBeDefined();
      expect(result.buckets['31-60']).toBeDefined();
      expect(result.buckets['61-90']).toBeDefined();
      expect(result.buckets['90+']).toBeDefined();
    });

    it('should calculate total outstanding correctly', async () => {
      const mockInvoices = [
        { outstandingAmount: new Decimal(1000) },
        { outstandingAmount: new Decimal(2000) },
        { outstandingAmount: new Decimal(500) },
      ];

      dataSource.manager.find.mockResolvedValue(mockInvoices);

      const result = await service.getAgingReport('2026-01-28');

      expect(result.totalOutstanding.toNumber()).toBe(3500);
    });

    it('should handle empty invoice list', async () => {
      dataSource.manager.find.mockResolvedValue([]);

      const result = await service.getAgingReport('2026-01-28');

      expect(result.totalOutstanding.toNumber()).toBe(0);
      expect(result.invoiceCount).toBe(0);
    });
  });

  describe('calculateEarlyPaymentDiscount', () => {
    it('should calculate 2/10 net 30 discount correctly', async () => {
      const invoiceData = {
        totalAmount: new Decimal(10000),
        invoiceDate: '2026-01-28',
        paymentTerms: '2/10 NET 30',
      };

      const result = await service.calculateEarlyPaymentDiscount(invoiceData);

      expect(result.discountRate).toBe(0.02);
      expect(result.discountAmount.toNumber()).toBe(200);
      expect(result.netAmount.toNumber()).toBe(9800);
      expect(result.discountDeadline).toBeDefined();
    });

    it('should return zero discount for NET30 terms', async () => {
      const invoiceData = {
        totalAmount: new Decimal(10000),
        invoiceDate: '2026-01-28',
        paymentTerms: 'NET 30',
      };

      const result = await service.calculateEarlyPaymentDiscount(invoiceData);

      expect(result.discountRate).toBe(0);
      expect(result.discountAmount.toNumber()).toBe(0);
      expect(result.netAmount.toNumber()).toBe(10000);
    });

    it('should handle custom discount terms', async () => {
      const invoiceData = {
        totalAmount: new Decimal(5000),
        invoiceDate: '2026-01-28',
        paymentTerms: '3/15 NET 45',
      };

      const result = await service.calculateEarlyPaymentDiscount(invoiceData);

      expect(result.discountRate).toBe(0.03);
      expect(result.discountAmount.toNumber()).toBe(150);
      expect(result.netAmount.toNumber()).toBe(4850);
    });
  });

  describe('getVendorPaymentHistory', () => {
    it('should retrieve payment history for vendor', async () => {
      const mockPayments = [
        {
          paymentId: 'pay-001',
          invoiceId: 'inv-001',
          amount: new Decimal(1000),
          paymentDate: '2026-01-28',
          status: 'completed',
        },
        {
          paymentId: 'pay-002',
          invoiceId: 'inv-002',
          amount: new Decimal(2000),
          paymentDate: '2026-01-20',
          status: 'completed',
        },
      ];

      dataSource.manager.find.mockResolvedValue(mockPayments);

      const result = await service.getVendorPaymentHistory('vendor-123');

      expect(result).toHaveLength(2);
      expect(result[0].paymentId).toBe('pay-001');
      expect(result[1].paymentId).toBe('pay-002');
    });

    it('should return empty array for vendor with no payments', async () => {
      dataSource.manager.find.mockResolvedValue([]);

      const result = await service.getVendorPaymentHistory('vendor-456');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should filter by date range when provided', async () => {
      const mockPayments = [
        {
          paymentId: 'pay-001',
          paymentDate: '2026-01-28',
        },
      ];

      dataSource.manager.find.mockResolvedValue(mockPayments);

      const result = await service.getVendorPaymentHistory(
        'vendor-123',
        '2026-01-01',
        '2026-01-31'
      );

      expect(result).toHaveLength(1);
      expect(dataSource.manager.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          where: expect.objectContaining({
            paymentDate: expect.anything(),
          }),
        })
      );
    });
  });

  describe('validateInvoiceDuplicate', () => {
    it('should detect duplicate invoice numbers', async () => {
      const existingInvoice = {
        invoiceId: 'existing-001',
        invoiceNumber: 'INV-001',
        vendorId: 'vendor-123',
      };

      dataSource.manager.findOne.mockResolvedValue(existingInvoice);

      const result = await service.validateInvoiceDuplicate(
        'INV-001',
        'vendor-123'
      );

      expect(result.isDuplicate).toBe(true);
      expect(result.existingInvoiceId).toBe('existing-001');
    });

    it('should return false for unique invoice numbers', async () => {
      dataSource.manager.findOne.mockResolvedValue(null);

      const result = await service.validateInvoiceDuplicate(
        'INV-NEW-001',
        'vendor-123'
      );

      expect(result.isDuplicate).toBe(false);
      expect(result.existingInvoiceId).toBeUndefined();
    });
  });

  describe('calculatePaymentSchedule', () => {
    it('should generate payment schedule for multiple invoices', async () => {
      const invoices = [
        {
          invoiceId: 'inv-001',
          dueDate: '2026-02-15',
          outstandingAmount: new Decimal(1000),
        },
        {
          invoiceId: 'inv-002',
          dueDate: '2026-02-20',
          outstandingAmount: new Decimal(2000),
        },
        {
          invoiceId: 'inv-003',
          dueDate: '2026-02-25',
          outstandingAmount: new Decimal(1500),
        },
      ];

      const result = await service.calculatePaymentSchedule(invoices);

      expect(result).toBeDefined();
      expect(result.schedule).toBeDefined();
      expect(result.totalAmount.toNumber()).toBe(4500);
      expect(result.schedule.length).toBeGreaterThan(0);
    });

    it('should optimize schedule based on discount opportunities', async () => {
      const invoices = [
        {
          invoiceId: 'inv-001',
          dueDate: '2026-03-01',
          outstandingAmount: new Decimal(10000),
          paymentTerms: '2/10 NET 30',
          invoiceDate: '2026-01-28',
        },
      ];

      const result = await service.calculatePaymentSchedule(invoices, {
        optimizeForDiscounts: true,
      });

      expect(result.discountsAvailable.toNumber()).toBeGreaterThan(0);
      expect(result.recommendedPaymentDates).toBeDefined();
    });

    it('should respect cash flow constraints', async () => {
      const invoices = [
        {
          invoiceId: 'inv-001',
          dueDate: '2026-02-15',
          outstandingAmount: new Decimal(50000),
        },
        {
          invoiceId: 'inv-002',
          dueDate: '2026-02-16',
          outstandingAmount: new Decimal(50000),
        },
      ];

      const result = await service.calculatePaymentSchedule(invoices, {
        maxDailyPayment: 60000,
      });

      // Should spread payments across multiple days
      expect(result.schedule.length).toBeGreaterThan(1);
    });
  });
});
