import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailCampaign, CampaignStatus } from '../entities/email-campaign.entity';
import { EmailSenderService } from './email-sender.service';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { CreateEmailCampaignDto, UpdateEmailCampaignDto, EmailCampaignStatsDto } from '../dto/email.dto';
import { throwNotFound } from '../utils/error-handler.util';
import { log } from '../utils/logger.util';

@Injectable()
export class EmailCampaignService {
  constructor(
    @InjectRepository(EmailCampaign)
    private campaignRepo: Repository<EmailCampaign>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    private emailSenderService: EmailSenderService,
  ) {}

  /**
   * Create email campaign
   */
  async createCampaign(
    organizationId: string,
    userId: string,
    dto: CreateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const campaign = this.campaignRepo.create({
      organization_id: organizationId,
      created_by: userId,
      name: dto.name,
      subject: dto.subject,
      template: dto.template,
      preview_text: dto.previewText,
      recipients: dto.recipients,
      filters: dto.filters,
      scheduled_at: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      status: dto.scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT,
    });

    // Calculate total recipients
    campaign.total_recipients = await this.calculateRecipientCount(
      organizationId,
      dto.recipients,
      dto.filters,
    );

    return this.campaignRepo.save(campaign);
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    dto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throwNotFound('Campaign');

    Object.assign(campaign, dto);
    
    if (dto.recipients || dto.filters) {
      campaign.total_recipients = await this.calculateRecipientCount(
        campaign.organization_id,
        dto.recipients || campaign.recipients,
        dto.filters || campaign.filters,
      );
    }

    return this.campaignRepo.save(campaign);
  }

  /**
   * Send campaign
   */
  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throwNotFound('Campaign');

    if (campaign.status === CampaignStatus.SENT) {
      throw new Error('Campaign already sent');
    }

    // Update status
    campaign.status = CampaignStatus.SENDING;
    await this.campaignRepo.save(campaign);

    try {
      // Get recipients
      const recipients = await this.getRecipients(
        campaign.organization_id,
        campaign.recipients,
        campaign.filters,
      );

      // Send emails
      const result = await this.emailSenderService.sendBulkEmails(
        campaign.organization_id,
        recipients,
        campaign.subject,
        campaign.template,
        {
          campaignId: campaign.id,
          batchSize: 100,
          delayMs: 1000,
        },
      );

      // Update campaign
      campaign.sent_count = result.sent;
      campaign.status = CampaignStatus.SENT;
      campaign.sent_at = new Date();
      await this.campaignRepo.save(campaign);

      log(`Campaign ${campaign.id} sent to ${result.sent} recipients`, 'EmailCampaignService');
    } catch (error) {
      campaign.status = CampaignStatus.FAILED;
      await this.campaignRepo.save(campaign);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<EmailCampaignStatsDto> {
    try {
      const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
      if (!campaign) {
        return {
          campaignId,
          name: '',
          status: CampaignStatus.DRAFT,
          totalRecipients: 0,
          sentCount: 0,
          deliveredCount: 0,
          openedCount: 0,
          clickedCount: 0,
          bouncedCount: 0,
          unsubscribedCount: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
        };
      }

      const openRate = campaign.sent_count > 0
        ? (campaign.opened_count / campaign.sent_count) * 100
        : 0;

      const clickRate = campaign.opened_count > 0
        ? (campaign.clicked_count / campaign.opened_count) * 100
        : 0;

      const bounceRate = campaign.sent_count > 0
        ? (campaign.bounced_count / campaign.sent_count) * 100
        : 0;

      return {
        campaignId: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalRecipients: campaign.total_recipients,
        sentCount: campaign.sent_count,
        deliveredCount: campaign.delivered_count,
        openedCount: campaign.opened_count,
        clickedCount: campaign.clicked_count,
        bouncedCount: campaign.bounced_count,
        unsubscribedCount: campaign.unsubscribed_count,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        bounceRate: Math.round(bounceRate * 100) / 100,
      };
    } catch (error) {
      return {
        campaignId,
        name: '',
        status: CampaignStatus.DRAFT,
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        unsubscribedCount: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
      };
    }
  }

  /**
   * List campaigns
   */
  async listCampaigns(organizationId: string): Promise<EmailCampaign[]> {
    try {
      const campaigns = await this.campaignRepo.find({
        where: { organization_id: organizationId },
        order: { created_at: 'DESC' },
      });
      return campaigns || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throwNotFound('Campaign');

    await this.campaignRepo.remove(campaign);
  }

  /**
   * Calculate recipient count
   */
  private async calculateRecipientCount(
    organizationId: string,
    recipients: string[],
    filters?: Record<string, any>,
  ): Promise<number> {
    // If recipients are email addresses
    if (recipients.length > 0 && recipients[0].includes('@')) {
      return recipients.length;
    }

    // If recipients are segment IDs, calculate from filters
    let count = 0;

    if (filters?.includeCustomers) {
      count += await this.customerRepo.count({
        where: { organization_id: organizationId, ...filters.customerFilters },
      });
    }

    if (filters?.includeLeads) {
      count += await this.leadRepo.count({
        where: { organization_id: organizationId, ...filters.leadFilters },
      });
    }

    return count;
  }

  /**
   * Get recipients
   */
  private async getRecipients(
    organizationId: string,
    recipients: string[],
    filters?: Record<string, any>,
  ): Promise<Array<{ email: string; name?: string; variables?: Record<string, any> }>> {
    const result = [];

    // If recipients are email addresses
    if (recipients.length > 0 && recipients[0].includes('@')) {
      return recipients.map(email => ({ email }));
    }

    // Get from database with filters
    if (filters?.includeCustomers) {
      const customers = await this.customerRepo.find({
        where: { organization_id: organizationId, ...filters.customerFilters },
        select: ['id', 'companyName', 'primaryContact'],
      });

      customers.forEach(customer => {
        result.push({
          email: customer.primaryContact?.email || '',
          name: customer.companyName || customer.primaryContact?.firstName || '',
          variables: { firstName: customer.primaryContact?.firstName, lastName: customer.primaryContact?.lastName },
        });
      });
    }

    if (filters?.includeLeads) {
      const leads = await this.leadRepo.find({
        where: { organization_id: organizationId, ...filters.leadFilters },
        select: ['id', 'contact'],
      });

      leads.forEach(lead => {
        result.push({
          email: lead.contact?.email || '',
          name: `${lead.contact?.firstName || ''} ${lead.contact?.lastName || ''}`,
          variables: { firstName: lead.contact?.firstName, lastName: lead.contact?.lastName },
        });
      });
    }

    return result;
  }
}
