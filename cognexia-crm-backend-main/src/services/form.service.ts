import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form, FormStatus } from '../entities/form.entity';
import { FormSubmission, SubmissionStatus } from '../entities/form-submission.entity';
import { ActivityType } from '../entities/activity.entity';
import { Lead, LeadSource, QualificationStatus } from '../entities/lead.entity';
import { CreateFormDto, UpdateFormDto, SubmitFormDto } from '../dto/form.dto';
import { EmailSenderService } from './email-sender.service';
import { ActivityLoggerService } from './activity-logger.service';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
    @InjectRepository(FormSubmission)
    private submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private emailSenderService: EmailSenderService,
    private activityLogger: ActivityLoggerService,
  ) {}

  async createForm(tenantId: string, userId: string, dto: CreateFormDto): Promise<Form> {
    const formEntity = this.formRepository.create({
      name: dto.name,
      description: dto.description,
      fields: dto.fields as any,
      routing: dto.routing as any,
      design: dto.design as any,
      enableRecaptcha: dto.enableRecaptcha,
      enableHoneypot: dto.enableHoneypot,
      allowedDomains: dto.allowedDomains,
      tenantId,
      createdById: userId,
      status: FormStatus.DRAFT,
    } as any) as unknown as Form;

    const savedForm = await this.formRepository.save(formEntity) as unknown as Form;

    // Generate embed code
    await this.generateEmbedCode(savedForm);

    return savedForm;
  }

  private async generateEmbedCode(form: Form): Promise<void> {
    const embedUrl = `${process.env.APP_URL}/forms/${form.id}/embed`;
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;

    await this.formRepository.update(form.id, { embedCode });
  }

  async findAll(tenantId: string): Promise<Form[]> {
    try {
      const forms = await this.formRepository.find({
        where: { tenantId },
        order: { createdAt: 'DESC' },
      });
      return forms || [];
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, tenantId: string): Promise<Form> {
    try {
      const form = await this.formRepository.findOne({
        where: { id, tenantId },
        relations: ['submissions'],
      });

      return form || null;
    } catch (error) {
      return null;
    }
  }

  async findPublicById(id: string): Promise<Form> {
    try {
      const form = await this.formRepository.findOne({
        where: { id },
        relations: ['submissions'],
      });

      return form || null;
    } catch (error) {
      return null;
    }
  }

  async updateForm(id: string, tenantId: string, dto: UpdateFormDto): Promise<Form> {
    const form = await this.findOne(id, tenantId);
    Object.assign(form, dto);

    // Regenerate embed code if needed
    if (dto.allowedDomains) {
      await this.generateEmbedCode(form);
    }

    return this.formRepository.save(form) as unknown as Form;
  }

  async deleteForm(id: string, tenantId: string): Promise<void> {
    const form = await this.findOne(id, tenantId);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    await this.formRepository.remove(form);
  }

  async publishForm(id: string, tenantId: string): Promise<Form> {
    const form = await this.findOne(id, tenantId);
    form.status = FormStatus.ACTIVE;
    return this.formRepository.save(form) as unknown as Form;
  }

  async pauseForm(id: string, tenantId: string): Promise<Form> {
    const form = await this.findOne(id, tenantId);
    form.status = FormStatus.PAUSED;
    return this.formRepository.save(form) as unknown as Form;
  }

  async trackFormView(formId: string): Promise<void> {
    await this.formRepository.increment({ id: formId }, 'viewCount', 1);
    await this.updateConversionRate(formId);
  }

  async submitForm(
    formId: string,
    dto: SubmitFormDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ submission: FormSubmission; lead?: Lead }> {
    const form = await this.formRepository.findOne({ where: { id: formId } });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== FormStatus.ACTIVE) {
      throw new BadRequestException('Form is not active');
    }

    // Spam detection
    const spamScore = await this.detectSpam(form, dto, ipAddress);
    const isSpam = spamScore > 0.7;

    if (isSpam) {
      // Still save but mark as spam
      const spamSubmission = await this.saveSubmission(
        form,
        dto,
        ipAddress,
        userAgent,
        spamScore,
        true,
      );
      return { submission: spamSubmission };
    }

    // Check IP rate limiting
    if (form.limitSubmissionsPerIp) {
      const recentSubmissions = await this.submissionRepository.count({
        where: {
          formId,
          ipAddress,
          isSpam: false,
        },
      });

      if (recentSubmissions >= form.maxSubmissionsPerIp) {
        throw new BadRequestException('Too many submissions from this IP address');
      }
    }

    // Save submission
    const submission = await this.saveSubmission(
      form,
      dto,
      ipAddress,
      userAgent,
      spamScore,
      false,
    );

    // Convert to lead
    const lead = await this.convertToLead(form, submission);

    // Update form statistics
    await this.formRepository.increment({ id: formId }, 'submissionCount', 1);
    await this.updateConversionRate(formId);

    // Send notifications
    await this.sendNotifications(form, submission, lead);

    return { submission, lead };
  }

  private async saveSubmission(
    form: Form,
    dto: SubmitFormDto,
    ipAddress: string,
    userAgent: string,
    spamScore: number,
    isSpam: boolean,
  ): Promise<FormSubmission> {
    const submissionEntity = this.submissionRepository.create({
      formId: form.id,
      tenantId: form.tenantId,
      data: dto.data,
      ipAddress,
      userAgent,
      referrer: dto.referrer,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      utmContent: dto.utmContent,
      utmTerm: dto.utmTerm,
      spamScore,
      isSpam,
      status: isSpam ? SubmissionStatus.SPAM : SubmissionStatus.PENDING,
    });
    
    if (Array.isArray(submissionEntity)) {
      throw new Error('Failed to create submission entity');
    }

    return this.submissionRepository.save(submissionEntity) as unknown as FormSubmission;
  }

  private async detectSpam(
    form: Form,
    dto: SubmitFormDto,
    ipAddress: string,
  ): Promise<number> {
    let spamScore = 0;

    // Check honeypot (if enabled)
    if (form.enableHoneypot && dto.data['_honeypot']) {
      spamScore += 0.9; // High spam indicator
    }

    // Check for suspicious patterns
    const dataString = JSON.stringify(dto.data).toLowerCase();

    // Too many links
    const linkCount = (dataString.match(/http/g) || []).length;
    if (linkCount > 3) {
      spamScore += 0.3;
    }

    // Suspicious keywords
    const spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'click here', 'buy now'];
    const foundKeywords = spamKeywords.filter(keyword => dataString.includes(keyword));
    if (foundKeywords.length > 0) {
      spamScore += 0.4 * foundKeywords.length;
    }

    // Very short submission time (bot indicator)
    // This would require tracking form load time - simplified here

    // Duplicate recent submission from same IP
    const recentDuplicate = await this.submissionRepository.findOne({
      where: {
        formId: form.id,
        ipAddress,
      },
      order: { createdAt: 'DESC' },
    });

    if (recentDuplicate) {
      const timeDiff = Date.now() - recentDuplicate.createdAt.getTime();
      if (timeDiff < 60000) { // Less than 1 minute
        spamScore += 0.5;
      }
    }

    return Math.min(spamScore, 1.0);
  }

  private async convertToLead(form: Form, submission: FormSubmission): Promise<Lead> {
    // Map form data to lead fields
    const leadData: any = {
      tenantId: form.tenantId,
      source: LeadSource.WEBSITE_FORM,
      status: 'new',
    };

    // Map fields based on form configuration
    form.fields.forEach(field => {
      if (field.mapping && submission.data[field.id]) {
        leadData[field.mapping] = submission.data[field.id];
      }
    });

    const fallbackEmail = submission.data?.email || `lead.${Date.now()}@example.com`;
    const fallbackFirstName = submission.data?.firstName || 'Web';
    const fallbackLastName = submission.data?.lastName || 'Lead';

    leadData.leadNumber = leadData.leadNumber || `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    leadData.contact = leadData.contact || {
      firstName: fallbackFirstName,
      lastName: fallbackLastName,
      email: fallbackEmail,
      phone: submission.data?.phone,
      company: submission.data?.company || 'Unknown',
    };
    leadData.demographics = leadData.demographics || {
      industry: submission.data?.industry || 'unknown',
      companySize: submission.data?.companySize || 'unknown',
      location: submission.data?.location,
    };
    leadData.behaviorData = leadData.behaviorData || {
      websiteVisits: 1,
      pageViews: 1,
      emailOpens: 0,
      emailClicks: 0,
      formSubmissions: 1,
      contentDownloads: 0,
      demoRequests: 0,
    };
    leadData.leadScoring = leadData.leadScoring || {
      demographicScore: 0,
      behaviorScore: 0,
      engagementScore: 0,
      totalScore: 0,
      lastUpdated: new Date().toISOString(),
    };
    leadData.qualification = leadData.qualification || {
      budget: QualificationStatus.UNKNOWN,
      authority: QualificationStatus.UNKNOWN,
      need: QualificationStatus.UNKNOWN,
      timeline: QualificationStatus.UNKNOWN,
      bantScore: 0,
    };
    leadData.createdBy = leadData.createdBy || 'system';
    leadData.updatedBy = leadData.updatedBy || 'system';

    // Add UTM data
    if (submission.utmSource) {
      leadData.utmSource = submission.utmSource;
      leadData.utmMedium = submission.utmMedium;
      leadData.utmCampaign = submission.utmCampaign;
    }

    // Determine assignee based on routing rules
    const assigneeId = await this.determineAssignee(form, submission.data);
    if (assigneeId) {
      leadData.assignedTo = assigneeId;
    }

    const leadEntity = this.leadRepository.create(leadData);
    
    if (Array.isArray(leadEntity)) {
      throw new Error('Failed to create lead entity');
    }
    
    const savedLead = await this.leadRepository.save(leadEntity) as unknown as Lead;

    // Update submission with lead ID
    await this.submissionRepository.update(submission.id, {
      leadId: savedLead.id,
      status: SubmissionStatus.CONVERTED,
    });

    const activityUserId = form.createdById;
    if (activityUserId) {
      await this.activityLogger.logActivity(
        form.tenantId,
        activityUserId,
        'System',
        {
          activityType: ActivityType.NOTE,
          title: 'Lead created from form',
          description: `Lead created from form submission: ${form.name}`,
          relatedToId: savedLead.id,
          relatedToType: 'lead',
          metadata: { formId: form.id, submissionId: submission.id },
        },
      );
    }

    return savedLead;
  }

  private async determineAssignee(form: Form, submissionData: any): Promise<string | null> {
    if (!form.routing) {
      return null;
    }

    // Check assignment rules
    if (form.routing.assignmentRules) {
      for (const rule of form.routing.assignmentRules) {
        const fieldValue = submissionData[rule.condition];
        let match = false;

        switch (rule.operator) {
          case 'equals':
            match = fieldValue === rule.value;
            break;
          case 'contains':
            match = String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
            break;
          case 'greaterThan':
            match = Number(fieldValue) > Number(rule.value);
            break;
          case 'lessThan':
            match = Number(fieldValue) < Number(rule.value);
            break;
        }

        if (match) {
          return rule.assignToUserId;
        }
      }
    }

    // Default assignee
    return form.routing.assignToUserId || form.routing.defaultAssignee || null;
  }

  private async sendNotifications(
    form: Form,
    submission: FormSubmission,
    lead?: Lead,
  ): Promise<void> {
    if (!form.routing?.notifyOnSubmission?.length) {
      return;
    }

    // Get user emails (simplified - you'd fetch from User repository)
    const recipientEmails = form.routing.notifyOnSubmission;

    // Send notification emails to recipients
    const htmlContent = `
      <h2>New Form Submission</h2>
      <p>A new submission has been received for form: <strong>${form.name}</strong></p>
      
      <h3>Submission Details:</h3>
      <ul>
        ${Object.entries(submission.data)
          .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          .join('')}
      </ul>
      
      ${lead ? `<p><strong>Lead Created:</strong> ${lead.id}</p>` : ''}
      
      <p><strong>Source:</strong> ${submission.utmSource || 'Direct'}</p>
      <p><strong>Campaign:</strong> ${submission.utmCampaign || 'N/A'}</p>
      
      <p><a href="${process.env.APP_URL}/crm/leads/${lead?.id}">View Lead</a></p>
    `;
    
    // Send to each recipient
    for (const email of recipientEmails) {
      await this.emailSenderService.sendEmail(
        form.tenantId,
        email,
        `New Form Submission: ${form.name}`,
        htmlContent,
      );
    }
  }

  private async updateConversionRate(formId: string): Promise<void> {
    const form = await this.formRepository.findOne({ where: { id: formId } });
    if (!form) return;

    const conversionRate =
      form.viewCount > 0 ? (form.submissionCount / form.viewCount) * 100 : 0;

    await this.formRepository.update(formId, {
      conversionRate: Math.round(conversionRate * 100) / 100,
    });
  }

  async getFormSubmissions(formId: string, tenantId: string): Promise<FormSubmission[]> {
    const form = await this.findOne(formId, tenantId);
    return this.submissionRepository.find({
      where: { formId: form.id },
      relations: ['lead'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFormAnalytics(formId: string, tenantId: string): Promise<any> {
    const form = await this.findOne(formId, tenantId);

    const totalSubmissions = await this.submissionRepository.count({
      where: { formId: form.id, isSpam: false },
    });

    const spamSubmissions = await this.submissionRepository.count({
      where: { formId: form.id, isSpam: true },
    });

    const convertedLeads = await this.submissionRepository.count({
      where: { formId: form.id, status: SubmissionStatus.CONVERTED },
    });

    const conversionRate = form.viewCount > 0 ? (totalSubmissions / form.viewCount) * 100 : 0;
    const leadConversionRate = totalSubmissions > 0 ? (convertedLeads / totalSubmissions) * 100 : 0;

    // Get submission sources
    const submissions = await this.submissionRepository.find({
      where: { formId: form.id, isSpam: false },
    });

    const sourceBreakdown = submissions.reduce((acc, sub) => {
      const source = sub.utmSource || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      formId: form.id,
      formName: form.name,
      status: form.status,
      views: form.viewCount,
      submissions: totalSubmissions,
      spamSubmissions,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      leadConversionRate: Math.round(leadConversionRate * 100) / 100,
      sourceBreakdown,
      averageFieldCompletionTime: null, // Would require tracking
      mostAbandonedFields: [], // Would require tracking
    };
  }

  async duplicateForm(formId: string, tenantId: string, userId: string): Promise<Form> {
    const originalForm = await this.findOne(formId, tenantId);

    const duplicatedForm = this.formRepository.create({
      ...originalForm,
      id: undefined, // Let database generate new ID
      name: `${originalForm.name} (Copy)`,
      status: FormStatus.DRAFT,
      createdById: userId,
      viewCount: 0,
      submissionCount: 0,
      conversionRate: 0,
      embedCode: null,
    });

    const savedForm = await this.formRepository.save(duplicatedForm);
    await this.generateEmbedCode(savedForm);

    return savedForm;
  }
}
