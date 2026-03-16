import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentProcessingService, PaymentRequest, PaymentResult } from '../services/payment-processing.service';
import { ForecastCashFlowDto, OptimizeDisbursementDto, RecommendDiscountDto, SelectPaymentRailDto, SimulatePaymentScenariosDto } from '../dto/payment-processing.dto';

@ApiTags('payment-processing')
@Controller('payment-processing')
export class PaymentProcessingController {
  constructor(private readonly paymentService: PaymentProcessingService) {}

  @Post('process')
  async process(@Body() body: PaymentRequest & { userId: string }): Promise<PaymentResult> {
    const { userId, ...req } = body;
    return this.paymentService.processPayment(req, userId);
    }

  @Get('status')
  async status(@Query('paymentId') paymentId: string) {
    return this.paymentService.getPaymentStatus(paymentId);
  }

  @Post('optimize/cash-flow')
  async optimizeCashFlow(@Body() dto: ForecastCashFlowDto) {
    return this.paymentService.forecastCashFlow(dto);
  }

  @Post('optimize/disbursement')
  async optimizeDisbursement(@Body() dto: OptimizeDisbursementDto) {
    return this.paymentService.optimizeDisbursementSchedule(dto);
  }

  @Post('recommend/discount')
  async recommendDiscount(@Body() dto: RecommendDiscountDto) {
    return this.paymentService.recommendEarlyPaymentDiscount(dto);
  }

  @Post('select/rail')
  async selectRail(@Body() dto: SelectPaymentRailDto) {
    return this.paymentService.selectOptimalPaymentRail(dto);
  }

  @Post('simulate/scenarios')
  async simulate(@Body() dto: SimulatePaymentScenariosDto) {
    return this.paymentService.simulatePaymentScenarios(dto);
  }
}

