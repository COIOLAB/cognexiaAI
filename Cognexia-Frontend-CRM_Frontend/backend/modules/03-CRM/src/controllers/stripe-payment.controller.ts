import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import {
  StripePaymentService,
  CreateStripeCustomerDto,
  CreateSubscriptionDto,
  AddPaymentMethodDto,
  ProcessPaymentDto,
} from '../services/stripe-payment.service';

/**
 * Stripe Payment Controller
 * Handles Stripe payment operations for organizations
 */
@Controller('stripe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  /**
   * Create Stripe Customer
   * POST /stripe/customer
   */
  @Post('customer')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async createCustomer(@Body() dto: CreateStripeCustomerDto) {
    const result = await this.stripePaymentService.createCustomer(dto);
    return {
      message: 'Stripe customer created successfully',
      data: result,
    };
  }

  /**
   * Add Payment Method
   * POST /stripe/payment-method
   */
  @Post('payment-method')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async addPaymentMethod(@Body() dto: AddPaymentMethodDto) {
    const result = await this.stripePaymentService.addPaymentMethod(dto);
    return {
      message: 'Payment method added successfully',
      data: result,
    };
  }

  /**
   * Create Subscription
   * POST /stripe/subscription
   */
  @Post('subscription')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    const result = await this.stripePaymentService.createSubscription(dto);
    return {
      message: 'Stripe subscription created successfully',
      data: result,
    };
  }

  /**
   * Update Subscription (Change Plan)
   * POST /stripe/subscription/:organizationId/update
   */
  @Post('subscription/:organizationId/update')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async updateSubscription(
    @Param('organizationId') organizationId: string,
    @Body() body: { newPlanId: string; prorate?: boolean },
  ) {
    const result = await this.stripePaymentService.updateSubscription(
      organizationId,
      body.newPlanId,
      body.prorate ?? true,
    );
    return {
      message: 'Subscription updated successfully',
      data: result,
    };
  }

  /**
   * Cancel Subscription
   * POST /stripe/subscription/:organizationId/cancel
   */
  @Post('subscription/:organizationId/cancel')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async cancelSubscription(
    @Param('organizationId') organizationId: string,
    @Body() body: { cancelAtPeriodEnd?: boolean },
  ) {
    const result = await this.stripePaymentService.cancelSubscription(
      organizationId,
      body.cancelAtPeriodEnd ?? true,
    );
    return {
      message: 'Subscription cancelled successfully',
      data: result,
    };
  }

  /**
   * Process One-Time Payment
   * POST /stripe/payment
   */
  @Post('payment')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async processPayment(@Body() dto: ProcessPaymentDto) {
    const result = await this.stripePaymentService.processPayment(dto);
    return {
      message: 'Payment processed successfully',
      data: result,
    };
  }

  /**
   * Process Refund
   * POST /stripe/refund/:transactionId
   */
  @Post('refund/:transactionId')
  @UserTypes(UserType.SUPER_ADMIN)
  async processRefund(
    @Param('transactionId') transactionId: string,
    @Body() body: { amount?: number; reason?: string },
  ) {
    const result = await this.stripePaymentService.processRefund(
      transactionId,
      body.amount,
      body.reason,
    );
    return {
      message: 'Refund processed successfully',
      data: result,
    };
  }

  /**
   * Stripe Webhook Handler
   * POST /stripe/webhook
   * 
   * This endpoint receives webhook events from Stripe
   * NOTE: This should be excluded from JWT authentication
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() event: any, @Headers('stripe-signature') signature: string) {
    const result = await this.stripePaymentService.handleWebhook(event, signature);
    return result;
  }

  @Post('create-payment-intent')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async createPaymentIntent(@Body() data: any) {
    return {
      success: true,
      data: {
        clientSecret: `pi_${Date.now()}_secret_`,
        paymentIntentId: `pi_${Date.now()}`,
        amount: data.amount,
      },
    };
  }

  @Post('create-subscription')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async createSubscriptionAlias(@Body() dto: CreateSubscriptionDto) {
    const result = await this.stripePaymentService.createSubscription(dto);
    return {
      message: 'Subscription created successfully',
      data: result,
    };
  }
}
