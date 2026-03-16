import { Controller, Post, Req, Headers, HttpCode, HttpStatus, RawBodyRequest, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { StripePaymentService } from '../services/stripe-payment.service';
import { Request } from 'express';

/**
 * Stripe Webhook Controller
 * Handles Stripe webhook events for payment processing
 */
@ApiTags('Stripe Webhooks')
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripePaymentService: StripePaymentService) {}

  /**
   * Handle Stripe Webhook Events
   * POST /webhooks/stripe
   * 
   * IMPORTANT: This endpoint must receive the raw request body
   * Configure your NestJS app to preserve raw body for this route
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Stripe webhook endpoint',
    description: 'Receives and processes webhook events from Stripe'
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or payload' })
  @ApiExcludeEndpoint() // Hide from public API docs for security
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    try {
      // Get raw body (needed for signature verification)
      const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body));

      this.logger.log('Received Stripe webhook event');

      // Process webhook with signature verification
      const result = await this.stripePaymentService.handleWebhook(rawBody, signature);

      this.logger.log('Stripe webhook processed successfully');

      return result;
    } catch (error) {
      this.logger.error(`Stripe webhook error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
