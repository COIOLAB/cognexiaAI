import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface EmailData {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  path?: string;
}

export interface EmailRecord {
  id: string;
  to: string | string[];
  from: string;
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
  attachments?: EmailAttachment[];
  sentAt: Date;
  status: 'sent' | 'failed';
  error?: string;
}

@Injectable()
export class LocalEmailService {
  private readonly logger = new Logger(LocalEmailService.name);
  private readonly emailPath: string;
  private readonly templatePath: string;
  private readonly fromAddress: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    this.emailPath = this.configService.get<string>('EMAIL_SIMULATION_PATH', './storage/emails');
    this.templatePath = this.configService.get<string>('EMAIL_TEMPLATE_PATH', './templates/emails');
    this.fromAddress = this.configService.get<string>('EMAIL_FROM_ADDRESS', 'noreply@industry5erp.local');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Industry 5.0 ERP System');
    
    this.initializeDirectories();
  }

  private async initializeDirectories(): Promise<void> {
    const directories = [this.emailPath, this.templatePath];
    
    for (const dir of directories) {
      const fullPath = path.resolve(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.logger.log(`Created directory: ${fullPath}`);
      }
    }

    // Create default email templates
    await this.createDefaultTemplates();
  }

  /**
   * Send an email (simulate by saving to file)
   */
  async sendEmail(emailData: EmailData): Promise<EmailRecord> {
    const id = uuidv4();
    const sentAt = new Date();
    
    try {
      // Process template if specified
      let processedHtml = emailData.html;
      let processedText = emailData.text;

      if (emailData.template) {
        const templateResult = await this.processTemplate(emailData.template, emailData.templateData || {});
        processedHtml = templateResult.html;
        processedText = templateResult.text;
      }

      const emailRecord: EmailRecord = {
        id,
        to: emailData.to,
        from: emailData.from || `${this.fromName} <${this.fromAddress}>`,
        subject: emailData.subject,
        body: {
          text: processedText,
          html: processedHtml,
        },
        attachments: emailData.attachments,
        sentAt,
        status: 'sent',
      };

      // Save email to file system
      await this.saveEmailRecord(emailRecord);
      
      // Create human-readable email file
      await this.createEmailFile(emailRecord);

      this.logger.log(`Email simulated successfully - ID: ${id}, To: ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to}`);
      
      return emailRecord;
    } catch (error) {
      const errorRecord: EmailRecord = {
        id,
        to: emailData.to,
        from: emailData.from || `${this.fromName} <${this.fromAddress}>`,
        subject: emailData.subject,
        body: {
          text: emailData.text,
          html: emailData.html,
        },
        sentAt,
        status: 'failed',
        error: error.message,
      };

      await this.saveEmailRecord(errorRecord);
      this.logger.error(`Failed to send email - ID: ${id}`, error);
      
      return errorRecord;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userData: { name: string; email: string }): Promise<EmailRecord> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Industry 5.0 ERP System',
      template: 'welcome',
      templateData: userData,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetData: { name: string; resetLink: string }): Promise<EmailRecord> {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request - Industry 5.0 ERP',
      template: 'password-reset',
      templateData: resetData,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(to: string | string[], notificationData: {
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high';
    actionUrl?: string;
    actionText?: string;
  }): Promise<EmailRecord> {
    return this.sendEmail({
      to,
      subject: `Notification: ${notificationData.title}`,
      template: 'notification',
      templateData: notificationData,
    });
  }

  /**
   * Send system alert email
   */
  async sendSystemAlertEmail(to: string | string[], alertData: {
    system: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    details?: Record<string, any>;
  }): Promise<EmailRecord> {
    return this.sendEmail({
      to,
      subject: `System Alert: ${alertData.system} - ${alertData.severity.toUpperCase()}`,
      template: 'system-alert',
      templateData: alertData,
    });
  }

  /**
   * Send report email with attachment
   */
  async sendReportEmail(to: string | string[], reportData: {
    reportName: string;
    period: string;
    summary: string;
    filePath?: string;
  }): Promise<EmailRecord> {
    const emailData: EmailData = {
      to,
      subject: `Report: ${reportData.reportName} - ${reportData.period}`,
      template: 'report',
      templateData: reportData,
    };

    // Add attachment if file path is provided
    if (reportData.filePath && fs.existsSync(reportData.filePath)) {
      const fileName = path.basename(reportData.filePath);
      const content = fs.readFileSync(reportData.filePath);
      
      emailData.attachments = [{
        filename: fileName,
        content,
        contentType: this.getContentType(fileName),
      }];
    }

    return this.sendEmail(emailData);
  }

  /**
   * Process email template
   */
  private async processTemplate(templateName: string, data: Record<string, any>): Promise<{ html: string; text: string }> {
    const htmlTemplatePath = path.join(process.cwd(), this.templatePath, `${templateName}.html`);
    const textTemplatePath = path.join(process.cwd(), this.templatePath, `${templateName}.txt`);

    let html = '';
    let text = '';

    // Process HTML template
    if (fs.existsSync(htmlTemplatePath)) {
      const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');
      html = this.replaceTemplateVariables(htmlTemplate, data);
    }

    // Process text template
    if (fs.existsSync(textTemplatePath)) {
      const textTemplate = fs.readFileSync(textTemplatePath, 'utf8');
      text = this.replaceTemplateVariables(textTemplate, data);
    }

    return { html, text };
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Save email record as JSON
   */
  private async saveEmailRecord(record: EmailRecord): Promise<void> {
    const fileName = `${record.id}.json`;
    const filePath = path.join(process.cwd(), this.emailPath, fileName);
    
    await fs.promises.writeFile(filePath, JSON.stringify(record, null, 2), 'utf8');
  }

  /**
   * Create human-readable email file
   */
  private async createEmailFile(record: EmailRecord): Promise<void> {
    const fileName = `${record.id}.eml`;
    const filePath = path.join(process.cwd(), this.emailPath, fileName);
    
    const emailContent = this.generateEmailContent(record);
    await fs.promises.writeFile(filePath, emailContent, 'utf8');
  }

  /**
   * Generate EML format email content
   */
  private generateEmailContent(record: EmailRecord): string {
    const recipients = Array.isArray(record.to) ? record.to.join(', ') : record.to;
    
    let content = `From: ${record.from}\n`;
    content += `To: ${recipients}\n`;
    content += `Subject: ${record.subject}\n`;
    content += `Date: ${record.sentAt.toUTCString()}\n`;
    content += `Message-ID: <${record.id}@industry5erp.local>\n`;
    content += `MIME-Version: 1.0\n`;
    
    if (record.body.html && record.body.text) {
      content += `Content-Type: multipart/alternative; boundary="boundary-${record.id}"\n\n`;
      
      content += `--boundary-${record.id}\n`;
      content += `Content-Type: text/plain; charset=UTF-8\n\n`;
      content += `${record.body.text}\n\n`;
      
      content += `--boundary-${record.id}\n`;
      content += `Content-Type: text/html; charset=UTF-8\n\n`;
      content += `${record.body.html}\n\n`;
      
      content += `--boundary-${record.id}--\n`;
    } else if (record.body.html) {
      content += `Content-Type: text/html; charset=UTF-8\n\n`;
      content += record.body.html;
    } else {
      content += `Content-Type: text/plain; charset=UTF-8\n\n`;
      content += record.body.text || '';
    }
    
    return content;
  }

  /**
   * Get email history
   */
  async getEmailHistory(limit = 50): Promise<EmailRecord[]> {
    const emailDir = path.join(process.cwd(), this.emailPath);
    
    try {
      const files = await fs.promises.readdir(emailDir);
      const jsonFiles = files.filter(file => file.endsWith('.json')).slice(0, limit);
      
      const records: EmailRecord[] = [];
      
      for (const file of jsonFiles) {
        const filePath = path.join(emailDir, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        records.push(JSON.parse(content));
      }
      
      return records.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(): Promise<{ total: number; sent: number; failed: number }> {
    const history = await this.getEmailHistory(1000);
    
    return {
      total: history.length,
      sent: history.filter(record => record.status === 'sent').length,
      failed: history.filter(record => record.status === 'failed').length,
    };
  }

  /**
   * Create default email templates
   */
  private async createDefaultTemplates(): Promise<void> {
    const templates = [
      {
        name: 'welcome',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Industry 5.0 ERP</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c5aa0;">Welcome to Industry 5.0 ERP System</h2>
    <p>Dear {{name}},</p>
    <p>Welcome to our advanced Industry 5.0 ERP system! Your account has been successfully created.</p>
    <p><strong>Your account details:</strong></p>
    <ul>
        <li>Email: {{email}}</li>
        <li>Account created: {{createdAt}}</li>
    </ul>
    <p>You can now access all the features of our comprehensive ERP system.</p>
    <p>Best regards,<br>Industry 5.0 ERP Team</p>
</body>
</html>`,
        text: `Welcome to Industry 5.0 ERP System

Dear {{name}},

Welcome to our advanced Industry 5.0 ERP system! Your account has been successfully created.

Your account details:
- Email: {{email}}
- Account created: {{createdAt}}

You can now access all the features of our comprehensive ERP system.

Best regards,
Industry 5.0 ERP Team`
      },
      {
        name: 'password-reset',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d63384;">Password Reset Request</h2>
    <p>Dear {{name}},</p>
    <p>You have requested to reset your password for your Industry 5.0 ERP account.</p>
    <p><a href="{{resetLink}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>If you didn't request this reset, please ignore this email.</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Industry 5.0 ERP Team</p>
</body>
</html>`,
        text: `Password Reset Request

Dear {{name}},

You have requested to reset your password for your Industry 5.0 ERP account.

Reset your password by clicking this link: {{resetLink}}

If you didn't request this reset, please ignore this email.
This link will expire in 1 hour for security reasons.

Best regards,
Industry 5.0 ERP Team`
      },
      {
        name: 'notification',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #28a745;">{{title}}</h2>
    <p>{{message}}</p>
    {{#if actionUrl}}
    <p><a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">{{actionText}}</a></p>
    {{/if}}
    <p>Best regards,<br>Industry 5.0 ERP Team</p>
</body>
</html>`,
        text: `{{title}}

{{message}}

{{#if actionUrl}}
{{actionText}}: {{actionUrl}}
{{/if}}

Best regards,
Industry 5.0 ERP Team`
      }
    ];

    for (const template of templates) {
      const htmlPath = path.join(process.cwd(), this.templatePath, `${template.name}.html`);
      const textPath = path.join(process.cwd(), this.templatePath, `${template.name}.txt`);
      
      if (!fs.existsSync(htmlPath)) {
        await fs.promises.writeFile(htmlPath, template.html.trim(), 'utf8');
      }
      
      if (!fs.existsSync(textPath)) {
        await fs.promises.writeFile(textPath, template.text.trim(), 'utf8');
      }
    }

    this.logger.log('Default email templates created');
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.csv': 'text/csv',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }
}
