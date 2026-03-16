import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { EmailLog, EmailStatus } from '../entities/email-log.entity';
import { EmailTracking, TrackingEvent } from '../entities/email-tracking.entity';
import { logError, log } from '../utils/logger.util';
import { generateToken } from '../utils/encryption.util';

@Injectable()
export class EmailSenderService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(EmailLog)
    private emailLogRepo: Repository<EmailLog>,
    @InjectRepository(EmailTracking)
    private trackingRepo: Repository<EmailTracking>,
  ) {
    this.initializeTransporter();
  }

  /**
   * Initialize SMTP transporter
   */
  private initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      log('Email sender running in mock mode (missing SMTP config)', 'EmailSenderService');
      this.transporter = null as any;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(
    organizationId: string,
    toEmail: string,
    subject: string,
    bodyHtml: string,
    options?: {
      toName?: string;
      campaignId?: string;
      sequenceId?: string;
      variables?: Record<string, any>;
      trackOpens?: boolean;
      trackClicks?: boolean;
    },
  ): Promise<EmailLog> {
    try {
      // Compile template with variables
      const template = Handlebars.compile(bodyHtml);
      let compiledHtml = template(options?.variables || {});

      // Generate tracking token
      const trackingToken = generateToken(32);

      // Add tracking pixel if enabled
      if (options?.trackOpens !== false) {
        compiledHtml += this.getTrackingPixel(trackingToken);
      }

      // Add click tracking if enabled
      if (options?.trackClicks !== false) {
        compiledHtml = this.addClickTracking(compiledHtml, trackingToken);
      }

      // Create email log
      const emailLog = this.emailLogRepo.create({
        organization_id: organizationId,
        campaign_id: options?.campaignId,
        sequence_id: options?.sequenceId,
        from_email: process.env.SMTP_FROM_EMAIL,
        from_name: process.env.SMTP_FROM_NAME,
        to_email: toEmail,
        to_name: options?.toName,
        subject,
        body_html: compiledHtml,
        body_text: this.htmlToText(bodyHtml),
        status: EmailStatus.QUEUED,
      });

      await this.emailLogRepo.save(emailLog);

      let messageId = `mock_${Date.now()}`;
      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
          to: options?.toName ? `${options.toName} <${toEmail}>` : toEmail,
          subject,
          html: compiledHtml,
          text: emailLog.body_text,
          headers: {
            'X-Tracking-Token': trackingToken,
          },
        });
        messageId = info.messageId;
      } else {
        log(`[MOCK] Email would be sent to ${toEmail}`, 'EmailSenderService');
      }

      // Update email log
      emailLog.status = EmailStatus.SENT;
      emailLog.message_id = messageId;
      await this.emailLogRepo.save(emailLog);

      // Track sent event
      await this.trackEvent(emailLog.id, TrackingEvent.SENT);

      log(`Email sent successfully to ${toEmail}`, 'EmailSenderService');
      return emailLog;

    } catch (error) {
      logError(`Failed to send email to ${toEmail}`, error.stack, 'EmailSenderService');
      
      // Update email log with error
      const emailLog = this.emailLogRepo.create({
        organization_id: organizationId,
        to_email: toEmail,
        subject,
        body_html: bodyHtml,
        status: EmailStatus.FAILED,
        error_message: error.message,
      });
      
      await this.emailLogRepo.save(emailLog);
      throw error;
    }
  }

  /**
   * Track email event
   */
  async trackEvent(
    emailLogId: string,
    eventType: TrackingEvent,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      clickedUrl?: string;
    },
  ): Promise<void> {
    try {
      const emailLog = await this.emailLogRepo.findOne({ where: { id: emailLogId } });
      if (!emailLog) {
        return;
      }

      const tracking = this.trackingRepo.create({
        email_log_id: emailLogId,
        event_type: eventType,
        ip_address: metadata?.ipAddress,
        user_agent: metadata?.userAgent,
        clicked_url: metadata?.clickedUrl,
      });

      await this.trackingRepo.save(tracking);

      // Update email log
      if (emailLog) {
        if (eventType === TrackingEvent.OPENED) {
          emailLog.is_opened = true;
          emailLog.open_count += 1;
          if (!emailLog.first_opened_at) {
            emailLog.first_opened_at = new Date();
          }
          emailLog.last_opened_at = new Date();
        } else if (eventType === TrackingEvent.CLICKED) {
          emailLog.is_clicked = true;
          emailLog.click_count += 1;
          if (!emailLog.first_clicked_at) {
            emailLog.first_clicked_at = new Date();
          }
        }
        await this.emailLogRepo.save(emailLog);
      }
    } catch (error) {
      logError('Failed to track email event', error.stack, 'EmailSenderService');
    }
  }

  /**
   * Get tracking pixel HTML
   */
  private getTrackingPixel(token: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `<img src="${baseUrl}/api/v1/crm/email/track/open/${token}" width="1" height="1" style="display:none" />`;
  }

  /**
   * Add click tracking to all links
   */
  private addClickTracking(html: string, token: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return html.replace(
      /href="([^"]+)"/g,
      (match, url) => {
        if (url.startsWith('http')) {
          const trackUrl = `${baseUrl}/api/v1/crm/email/track/click/${token}?url=${encodeURIComponent(url)}`;
          return `href="${trackUrl}"`;
        }
        return match;
      },
    );
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send bulk emails (for campaigns)
   */
  async sendBulkEmails(
    organizationId: string,
    recipients: Array<{ email: string; name?: string; variables?: Record<string, any> }>,
    subject: string,
    template: string,
    options?: {
      campaignId?: string;
      batchSize?: number;
      delayMs?: number;
    },
  ): Promise<{ sent: number; failed: number }> {
    const batchSize = options?.batchSize || 100;
    const delayMs = options?.delayMs || 1000;
    
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const promises = batch.map(recipient =>
        this.sendEmail(
          organizationId,
          recipient.email,
          subject,
          template,
          {
            toName: recipient.name,
            variables: recipient.variables,
            campaignId: options?.campaignId,
          },
        )
          .then(() => { sent++; })
          .catch(() => { failed++; })
      );

      await Promise.all(promises);

      // Delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return { sent, failed };
  }
}
