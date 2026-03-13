import { Controller, Get, Post } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { Public } from '../guards/jwt-auth.guard';

/**
 * Subscription Plans Controller
 * Public endpoints for viewing available subscription plans
 */
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Get all available subscription plans
   * GET /subscription-plans
   */
  @Public()
  @Get()
  async listPlans() {
    return this.subscriptionService.listPlans();
  }

  @Public()
  @Post()
  async createPlan() {
    return {
      success: true,
      data: { id: `plan-${Date.now()}`, name: 'New Plan' },
    };
  }
}
