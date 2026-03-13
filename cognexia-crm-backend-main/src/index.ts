/**
 * CRM Module Index
 * Provides clean exports for CRM entities, services, controllers, and types
 */

// Export CRM entities (selective exports to avoid conflicts)
export { Customer, CustomerType, CustomerStatus, CustomerSize, CustomerTier, RiskLevel, GrowthPotential } from './entities/customer.entity';
export { Lead, LeadStatus, LeadSource, LeadGrade } from './entities/lead.entity';
export { Opportunity } from './entities/opportunity.entity';
export { CustomerInteraction } from './entities/customer-interaction.entity';
export { MarketingCampaign } from './entities/marketing-campaign.entity';
export { CustomerSegment } from './entities/customer-segment.entity';

// Export CRM controllers
// Export all controllers
export * from './controllers/crm.controller';
export * from './controllers/customer.controller';
export * from './controllers/marketing.controller';
export * from './controllers/sales.controller';
export * from './controllers/crm-ai-integration.controller';

// Export CRM services
// Export all services
// TODO: Re-enable exports when services are verified to exist
// export * from './services/customer.service';
// export * from './services/lead.service';
// export * from './services/opportunity.service';
// export * from './services/marketing-campaign.service';
// export * from './services/AICustomerIntelligenceService';
// export * from './services/AdvancedPredictiveAnalyticsService';
// export * from './services/AutonomousJourneyOrchestratorService';

// Export CRM DTOs
export * from './dto';

// Export CRM module
export { CRMModule } from './crm.module';
