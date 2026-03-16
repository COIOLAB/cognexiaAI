import { ConfigService } from '@nestjs/config';
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
export declare class LocalEmailService {
    private readonly configService;
    private readonly logger;
    private readonly emailPath;
    private readonly templatePath;
    private readonly fromAddress;
    private readonly fromName;
    constructor(configService: ConfigService);
    private initializeDirectories;
    /**
     * Send an email (simulate by saving to file)
     */
    sendEmail(emailData: EmailData): Promise<EmailRecord>;
    /**
     * Send welcome email
     */
    sendWelcomeEmail(to: string, userData: {
        name: string;
        email: string;
    }): Promise<EmailRecord>;
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(to: string, resetData: {
        name: string;
        resetLink: string;
    }): Promise<EmailRecord>;
    /**
     * Send notification email
     */
    sendNotificationEmail(to: string | string[], notificationData: {
        title: string;
        message: string;
        priority?: 'low' | 'normal' | 'high';
        actionUrl?: string;
        actionText?: string;
    }): Promise<EmailRecord>;
    /**
     * Send system alert email
     */
    sendSystemAlertEmail(to: string | string[], alertData: {
        system: string;
        severity: 'info' | 'warning' | 'error' | 'critical';
        message: string;
        details?: Record<string, any>;
    }): Promise<EmailRecord>;
    /**
     * Send report email with attachment
     */
    sendReportEmail(to: string | string[], reportData: {
        reportName: string;
        period: string;
        summary: string;
        filePath?: string;
    }): Promise<EmailRecord>;
    /**
     * Process email template
     */
    private processTemplate;
    /**
     * Replace template variables with actual values
     */
    private replaceTemplateVariables;
    /**
     * Save email record as JSON
     */
    private saveEmailRecord;
    /**
     * Create human-readable email file
     */
    private createEmailFile;
    /**
     * Generate EML format email content
     */
    private generateEmailContent;
    /**
     * Get email history
     */
    getEmailHistory(limit?: number): Promise<EmailRecord[]>;
    /**
     * Get email statistics
     */
    getEmailStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
    }>;
    /**
     * Create default email templates
     */
    private createDefaultTemplates;
    /**
     * Get content type based on file extension
     */
    private getContentType;
}
//# sourceMappingURL=local-email.service.d.ts.map