import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { User } from '../entities/user.entity';
import type { Organization } from '../entities/organization.entity';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailRecipient {
  name: string;
  email: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface TicketEmailData {
  ticketNumber: string;
  subject: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  url: string;
}

@Injectable()
export class EmailNotificationService implements OnModuleInit {
  private readonly logger = new Logger(EmailNotificationService.name);
  private transporter: Transporter | null = null;

  async onModuleInit() {
    // Initialize SMTP transporter if credentials are provided
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // Verify SMTP connection
        await this.transporter.verify();
        this.logger.log(`[EMAIL] SMTP transporter initialized successfully (${smtpHost}:${smtpPort})`);
      } catch (error: any) {
        this.logger.warn(`[EMAIL] SMTP initialization failed: ${error.message}. Emails will be logged to console only.`);
        this.transporter = null;
      }
    } else {
      this.logger.warn('[EMAIL] SMTP not configured. Emails will be logged to console only.');
    }
  }

  private resolveEmail(recipient: User | string): string {
    return typeof recipient === 'string' ? recipient : recipient?.email || '';
  }

  private resolveName(source: User | Organization | string | undefined): string {
    if (!source) return '';
    if (typeof source === 'string') return source;
    if ('name' in source && source.name) return source.name;
    if ('firstName' in source && 'lastName' in source) {
      const first = (source as any).firstName || '';
      const last = (source as any).lastName || '';
      return `${first} ${last}`.trim();
    }
    return '';
  }

  /**
   * Send email when a new ticket is created
   */
  async sendTicketCreatedEmail(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] Ticket Created - ${ticketData.ticketNumber} to ${recipient.email}`,
    );

    // In production, integrate with SendGrid, AWS SES, or similar
    const emailContent = this.generateTicketCreatedHTML(recipient, ticketData);

    // TODO: Replace with actual email service
    console.log('\n=== EMAIL: TICKET CREATED ===');
    console.log(`To: ${recipient.email}`);
    console.log(`Subject: Ticket ${ticketData.ticketNumber} Created`);
    console.log(`Content:\n${emailContent}\n`);
  }

  /**
   * Send email when a ticket is assigned to a staff member
   */
  async sendTicketAssignedEmail(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] Ticket Assigned - ${ticketData.ticketNumber} to ${recipient.email}`,
    );

    const emailContent = this.generateTicketAssignedHTML(recipient, ticketData);

    console.log('\n=== EMAIL: TICKET ASSIGNED ===');
    console.log(`To: ${recipient.email}`);
    console.log(`Subject: You've been assigned to Ticket ${ticketData.ticketNumber}`);
    console.log(`Content:\n${emailContent}\n`);
  }

  /**
   * Send email when a new message is added to a ticket
   */
  async sendNewMessageEmail(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
    message: string,
    senderName: string,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] New Message - ${ticketData.ticketNumber} to ${recipient.email}`,
    );

    const emailContent = this.generateNewMessageHTML(
      recipient,
      ticketData,
      message,
      senderName,
    );

    console.log('\n=== EMAIL: NEW MESSAGE ===');
    console.log(`To: ${recipient.email}`);
    console.log(`Subject: New message on Ticket ${ticketData.ticketNumber}`);
    console.log(`Content:\n${emailContent}\n`);
  }

  /**
   * Send email when ticket status changes
   */
  async sendStatusChangeEmail(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] Status Changed - ${ticketData.ticketNumber} to ${recipient.email}`,
    );

    const emailContent = this.generateStatusChangeHTML(
      recipient,
      ticketData,
      oldStatus,
      newStatus,
    );

    console.log('\n=== EMAIL: STATUS CHANGED ===');
    console.log(`To: ${recipient.email}`);
    console.log(
      `Subject: Ticket ${ticketData.ticketNumber} - Status Updated to ${newStatus}`,
    );
    console.log(`Content:\n${emailContent}\n`);
  }

  /**
   * Send email when a ticket is resolved
   */
  async sendTicketResolvedEmail(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] Ticket Resolved - ${ticketData.ticketNumber} to ${recipient.email}`,
    );

    const emailContent = this.generateTicketResolvedHTML(recipient, ticketData);

    console.log('\n=== EMAIL: TICKET RESOLVED ===');
    console.log(`To: ${recipient.email}`);
    console.log(
      `Subject: Your ticket ${ticketData.ticketNumber} has been resolved`,
    );
    console.log(`Content:\n${emailContent}\n`);
  }

  // HTML Email Templates

  private generateTicketCreatedHTML(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Support Ticket Created</h2>
            <p>Hi ${recipient.name},</p>
            <p>Your support ticket has been created successfully.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket Number:</strong> ${ticketData.ticketNumber}</p>
              <p><strong>Subject:</strong> ${ticketData.subject}</p>
              <p><strong>Priority:</strong> ${ticketData.priority || 'Medium'}</p>
              <p><strong>Status:</strong> Open</p>
            </div>
            
            <p>Our support team will review your request and respond as soon as possible.</p>
            
            <a href="${ticketData.url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View Ticket
            </a>
            
            <p style="color: #6b7280; font-size: 14px;">
              You will receive email notifications when there are updates to your ticket.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              CognexiaAI Support Team<br>
              support@cognexiaai.com
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateTicketAssignedHTML(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">New Ticket Assignment</h2>
            <p>Hi ${recipient.name},</p>
            <p>You have been assigned to a support ticket.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket Number:</strong> ${ticketData.ticketNumber}</p>
              <p><strong>Subject:</strong> ${ticketData.subject}</p>
              <p><strong>Priority:</strong> ${ticketData.priority || 'Medium'}</p>
              <p><strong>Category:</strong> ${ticketData.category || 'General'}</p>
            </div>
            
            <a href="${ticketData.url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View & Respond
            </a>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              CognexiaAI Support Team
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateNewMessageHTML(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
    message: string,
    senderName: string,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">New Message on Your Ticket</h2>
            <p>Hi ${recipient.name},</p>
            <p><strong>${senderName}</strong> has added a new message to your ticket.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket:</strong> ${ticketData.ticketNumber} - ${ticketData.subject}</p>
              <hr style="border: none; border-top: 1px solid #d1d5db; margin: 10px 0;">
              <p style="margin: 10px 0;">${message}</p>
            </div>
            
            <a href="${ticketData.url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View & Reply
            </a>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              CognexiaAI Support Team<br>
              support@cognexiaai.com
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateStatusChangeHTML(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
    oldStatus: string,
    newStatus: string,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Ticket Status Updated</h2>
            <p>Hi ${recipient.name},</p>
            <p>The status of your support ticket has been updated.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket:</strong> ${ticketData.ticketNumber}</p>
              <p><strong>Subject:</strong> ${ticketData.subject}</p>
              <p><strong>Previous Status:</strong> <span style="color: #6b7280;">${oldStatus}</span></p>
              <p><strong>New Status:</strong> <span style="color: #10b981;">${newStatus}</span></p>
            </div>
            
            <a href="${ticketData.url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View Ticket
            </a>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              CognexiaAI Support Team<br>
              support@cognexiaai.com
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateTicketResolvedHTML(
    recipient: EmailRecipient,
    ticketData: TicketEmailData,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Your Ticket Has Been Resolved!</h2>
            <p>Hi ${recipient.name},</p>
            <p>Great news! Your support ticket has been resolved.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket Number:</strong> ${ticketData.ticketNumber}</p>
              <p><strong>Subject:</strong> ${ticketData.subject}</p>
              <p><strong>Status:</strong> <span style="color: #10b981;">Resolved</span></p>
            </div>
            
            <p>We hope we were able to help! Please take a moment to rate your experience:</p>
            
            <a href="${ticketData.url}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Rate Your Experience
            </a>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you have any other questions, feel free to create a new ticket or reply to this one.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              CognexiaAI Support Team<br>
              support@cognexiaai.com
            </p>
          </div>
        </body>
      </html>
    `;
  }

  // Additional methods called from auth.service.ts and notification.controller.ts
  async sendEmailVerification(userOrEmail: User | string, verificationUrl: string): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const firstName = typeof userOrEmail === 'object' ? userOrEmail.firstName : 'User';
    
    this.logger.log(`[EMAIL] Email Verification sent to ${email}`);
    
    // Console log for development (the user can see this in terminal)
    console.log(`\n=== EMAIL: VERIFICATION ===`);
    console.log(`To: ${email}`);
    console.log(`Verification URL: ${verificationUrl}\n`);

    const html = `
      <h2>Email Verification</h2>
      <p>Hello ${firstName},</p>
      <p>Welcome to CognexiaAI CRM! Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.sendEmail(
      email,
      'Verify Your Email - CognexiaAI CRM',
      html,
    ).catch(err => this.logger.error(`Failed to send verification email: ${err.message}`));
  }

  /**
   * Send Team Member Invitation Email
   */
  async sendInvitationEmail(userOrEmail: User | string, invitationUrl: string): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const firstName = typeof userOrEmail === 'object' ? userOrEmail.firstName : 'Team Member';
    
    this.logger.log(`[EMAIL] Invitation sent to ${email}`);
    
    // Console log for development (the user can see this in terminal)
    console.log(`\n=== EMAIL: TEAM INVITATION ===`);
    console.log(`To: ${email}`);
    console.log(`Invitation URL: ${invitationUrl}\n`);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #1E40AF;">You've Been Invited!</h2>
        <p>Hello ${firstName},</p>
        <p>You have been invited to join your team on <strong>CognexiaAI CRM</strong>.</p>
        <p>Click the button below to accept the invitation and set up your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" style="background-color: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
        <p>This invitation link will be used to set your password and complete your profile.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you were not expecting this invitation, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(
      email,
      'Invitation to join CognexiaAI CRM',
      html,
    ).catch(err => this.logger.error(`Failed to send invitation email: ${err.message}`));
  }

  async sendWelcomeEmail(userOrEmail: User | string, orgOrName: Organization | string): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const name = this.resolveName(orgOrName) || this.resolveName(userOrEmail as User);
    this.logger.log(`[EMAIL] Welcome Email sent to ${email}`);
    console.log(`\n=== EMAIL: WELCOME ===`);
    console.log(`To: ${email}`);
    console.log(`Name: ${name}\n`);
  }

  async sendPasswordResetEmail(userOrEmail: User | string, resetUrl: string): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    this.logger.log(`[EMAIL] Password Reset sent to ${email}`);
    console.log(`\n=== EMAIL: PASSWORD RESET ===`);
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}\n`);
  }

  async notifyOrganizationAdmins(
    organizationId: string,
    subject: string,
    messageOrTemplate: string | EmailTemplate,
    context?: Record<string, any>,
  ): Promise<void> {
    const message =
      typeof messageOrTemplate === 'string'
        ? messageOrTemplate
        : messageOrTemplate.text || messageOrTemplate.html || '';
    this.logger.log(`[EMAIL] Organization Admins Notification for org ${organizationId}`);
    console.log(`\n=== EMAIL: ADMIN NOTIFICATION ===`);
    console.log(`Organization ID: ${organizationId}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}\n`);
    if (context) {
      console.log(`Context: ${JSON.stringify(context)}\n`);
    }
  }

  async sendBulkEmail(
    recipients: Array<string | { email: string }>,
    subject: string,
    message: string,
  ): Promise<void> {
    const recipientEmails = recipients.map((recipient) =>
      typeof recipient === 'string' ? recipient : recipient.email,
    );
    this.logger.log(`[EMAIL] Bulk Email sent to ${recipientEmails.length} recipients`);
    console.log(`\n=== EMAIL: BULK ===`);
    console.log(`Recipients: ${recipientEmails.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}\n`);
  }


  /**
   * Generic send email method - REAL EMAIL SENDING
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const from = `${process.env.SMTP_FROM_NAME || 'CognexiaAI'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;

    // If transporter is configured, send real email
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });

        this.logger.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
        console.log(`[EMAIL SUCCESS] Message ID: ${info.messageId}`);
        return;
      } catch (error: any) {
        this.logger.error(`[EMAIL] Failed to send to ${to}: ${error.message}`);
        // Fall through to console logging
      }
    }

    // Fallback: Console logging if SMTP not configured or failed
    this.logger.log(`[EMAIL] Email to ${to} (console only - SMTP not configured)`);
    console.log(`\n=== EMAIL: GENERIC (CONSOLE ONLY) ===`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html}\n`);
  }

  /**
   * Get organization admins
   */
  async getOrganizationAdmins(organizationId: string): Promise<any[]> {
    // Mock implementation - would query User table
    return [];
  }

  /**
   * Send trial ending email
   */
  async sendTrialEndingEmail(
    userOrEmail: User | string,
    orgOrName: Organization | string,
    daysLeft: number,
  ): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const orgName = this.resolveName(orgOrName);
    this.logger.log(`[EMAIL] Trial ending email to ${email}`);
    console.log(`\n=== EMAIL: TRIAL ENDING ===`);
    console.log(`To: ${email}`);
    console.log(`Organization: ${orgName}`);
    console.log(`Days left: ${daysLeft}\n`);
  }

  /**
   * Send payment method expiring email
   */
  async sendPaymentMethodExpiring(
    userOrEmail: User | string,
    orgOrName: Organization | string,
    last4?: string,
    expiryDate?: Date,
  ): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const orgName = this.resolveName(orgOrName);
    this.logger.log(`[EMAIL] Payment method expiring to ${email}`);
    console.log(`Organization: ${orgName}`);
    if (last4) console.log(`Card: ****${last4}`);
    if (expiryDate) console.log(`Expiry: ${expiryDate.toISOString()}`);
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(
    userOrEmail: User | string,
    orgOrName: Organization | string,
    amount?: number,
    reason?: string,
  ): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const orgName = this.resolveName(orgOrName);
    this.logger.log(`[EMAIL] Payment failed to ${email}`);
    console.log(`Organization: ${orgName}`);
    if (amount !== undefined) console.log(`Amount: ${amount}`);
    if (reason) console.log(`Reason: ${reason}`);
  }

  /**
   * Send seat limit reached email
   */
  async sendSeatLimitReached(
    userOrEmail: User | string,
    orgOrName: Organization | string,
  ): Promise<void> {
    const email = this.resolveEmail(userOrEmail);
    const orgName = this.resolveName(orgOrName);
    this.logger.log(`[EMAIL] Seat limit reached to ${email}`);
    console.log(`Organization: ${orgName}`);
  }
}
