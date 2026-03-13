/**
 * Validation Middleware - Request Data Validation
 * 
 * Advanced validation middleware for financial data integrity,
 * business rule validation, and security compliance.
 */

import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { Decimal } from 'decimal.js';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidationMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Validate financial amounts
    this.validateFinancialAmounts(req.body);
    
    // Validate currency codes
    this.validateCurrencyCodes(req.body);
    
    // Validate dates
    this.validateDates(req.body);
    
    // Check for suspicious patterns
    this.validateSuspiciousPatterns(req.body);

    next();
  }

  private validateFinancialAmounts(body: any) {
    if (!body) return;

    const amountFields = ['amount', 'totalAmount', 'debitAmount', 'creditAmount', 'subtotal'];
    
    for (const field of amountFields) {
      if (body[field] !== undefined) {
        const amount = new Decimal(body[field]);
        
        if (amount.lt(0) && !this.isAllowedNegative(field)) {
          throw new BadRequestException(`${field} cannot be negative`);
        }
        
        if (amount.gt(1000000000)) { // 1 billion limit
          throw new BadRequestException(`${field} exceeds maximum allowed amount`);
        }
        
        // Check for unrealistic precision
        if (amount.decimalPlaces() > 4) {
          throw new BadRequestException(`${field} has too many decimal places`);
        }
      }
    }
  }

  private validateCurrencyCodes(body: any) {
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD'];
    
    if (body.currencyCode && !supportedCurrencies.includes(body.currencyCode)) {
      throw new BadRequestException(`Unsupported currency code: ${body.currencyCode}`);
    }
  }

  private validateDates(body: any) {
    const dateFields = ['date', 'dueDate', 'transactionDate', 'postingDate'];
    
    for (const field of dateFields) {
      if (body[field]) {
        const date = new Date(body[field]);
        
        if (isNaN(date.getTime())) {
          throw new BadRequestException(`Invalid date format for ${field}`);
        }
        
        // Check for future dates where not allowed
        if (field === 'transactionDate' && date > new Date()) {
          throw new BadRequestException('Transaction date cannot be in the future');
        }
      }
    }
  }

  private validateSuspiciousPatterns(body: any) {
    // Check for round numbers that might indicate fraud
    if (body.amount) {
      const amount = new Decimal(body.amount);
      
      // Flag perfectly round amounts over certain threshold
      if (amount.gt(10000) && amount.mod(1000).eq(0)) {
        this.logger.warn('Suspicious round amount detected', {
          amount: amount.toNumber(),
          endpoint: 'validation-middleware'
        });
      }
    }
  }

  private isAllowedNegative(field: string): boolean {
    const allowedNegativeFields = ['adjustment', 'refund', 'creditAmount', 'variance'];
    return allowedNegativeFields.some(allowed => field.toLowerCase().includes(allowed));
  }
}
