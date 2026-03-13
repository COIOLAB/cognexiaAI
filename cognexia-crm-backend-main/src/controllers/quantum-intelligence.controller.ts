import { Controller, Post, Get, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { QuantumIntelligenceService } from '../services/quantum-intelligence.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('quantum')
@UseGuards(JwtAuthGuard)
export class QuantumIntelligenceController {
  constructor(private readonly service: QuantumIntelligenceService) {}

  private getOrganizationId(req: any) {
    const organizationId =
      req.user?.organizationId ||
      req.user?.tenantId ||
      req.body?.organizationId ||
      req.query?.organizationId;
    if (!organizationId) {
      throw new HttpException('Organization context missing', HttpStatus.BAD_REQUEST);
    }
    return organizationId;
  }

  @Post('personality-profile')
  async generatePersonalityProfile(@Body('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.generatePersonalityProfile(customerId, organizationId);
  }

  @Get('entanglement/:customerId')
  async analyzeEntanglement(@Param('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.analyzeEntanglement(customerId, organizationId);
  }

  @Post('consciousness-simulation')
  async simulateConsciousness(@Body('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.simulateConsciousness(customerId, organizationId);
  }

  @Get('behavioral-predictions/:customerId')
  async predictQuantumBehavior(@Param('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.predictQuantumBehavior(customerId, organizationId);
  }

  @Get('emotional-resonance/:customerId')
  async analyzeEmotionalResonance(@Param('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.analyzeEmotionalResonance(customerId, organizationId);
  }
}
