import { Injectable, Logger } from '@nestjs/common';

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  format?: 'short' | 'medium' | 'long' | 'full' | 'custom';
  customFormat?: string;
}

@Injectable()
export class FormattingHelper {
  private static readonly logger = new Logger(FormattingHelper.name);

  // Default settings
  private static readonly DEFAULT_CURRENCY = 'USD';
  private static readonly DEFAULT_LOCALE = 'en-US';
  private static readonly DEFAULT_TIMEZONE = 'UTC';

  /**
   * Format currency value
   */
  static formatCurrency(
    value: number,
    options: CurrencyFormatOptions = {}
  ): string {
    try {
      const {
        currency = this.DEFAULT_CURRENCY,
        locale = this.DEFAULT_LOCALE,
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
      } = options;

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(value);
    } catch (error) {
      this.logger.error(`Error formatting currency: ${error.message}`);
      return `${options.currency || this.DEFAULT_CURRENCY} ${value.toFixed(2)}`;
    }
  }

  /**
   * Format number
   */
  static formatNumber(
    value: number,
    options: NumberFormatOptions = {}
  ): string {
    try {
      const {
        locale = this.DEFAULT_LOCALE,
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        useGrouping = true,
      } = options;

      return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping,
      }).format(value);
    } catch (error) {
      this.logger.error(`Error formatting number: ${error.message}`);
      return value.toString();
    }
  }

  /**
   * Format percentage
   */
  static formatPercentage(
    value: number,
    minimumFractionDigits: number = 1,
    maximumFractionDigits: number = 2,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(value / 100);
    } catch (error) {
      this.logger.error(`Error formatting percentage: ${error.message}`);
      return `${value.toFixed(maximumFractionDigits)}%`;
    }
  }

  /**
   * Format date
   */
  static formatDate(
    date: Date | string,
    options: DateFormatOptions = {}
  ): string {
    try {
      const {
        locale = this.DEFAULT_LOCALE,
        timeZone = this.DEFAULT_TIMEZONE,
        format = 'medium',
      } = options;

      const dateObj = typeof date === 'string' ? new Date(date) : date;

      if (format === 'custom' && options.customFormat) {
        return this.formatDateCustom(dateObj, options.customFormat);
      }

      const formatOptions: Intl.DateTimeFormatOptions = { timeZone };

      switch (format) {
        case 'short':
          formatOptions.dateStyle = 'short';
          break;
        case 'medium':
          formatOptions.dateStyle = 'medium';
          break;
        case 'long':
          formatOptions.dateStyle = 'long';
          break;
        case 'full':
          formatOptions.dateStyle = 'full';
          break;
        default:
          formatOptions.dateStyle = 'medium';
      }

      return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
    } catch (error) {
      this.logger.error(`Error formatting date: ${error.message}`);
      return date.toString();
    }
  }

  /**
   * Format date and time
   */
  static formatDateTime(
    date: Date | string,
    options: DateFormatOptions = {}
  ): string {
    try {
      const {
        locale = this.DEFAULT_LOCALE,
        timeZone = this.DEFAULT_TIMEZONE,
        format = 'medium',
      } = options;

      const dateObj = typeof date === 'string' ? new Date(date) : date;

      const formatOptions: Intl.DateTimeFormatOptions = { timeZone };

      switch (format) {
        case 'short':
          formatOptions.dateStyle = 'short';
          formatOptions.timeStyle = 'short';
          break;
        case 'medium':
          formatOptions.dateStyle = 'medium';
          formatOptions.timeStyle = 'medium';
          break;
        case 'long':
          formatOptions.dateStyle = 'long';
          formatOptions.timeStyle = 'long';
          break;
        case 'full':
          formatOptions.dateStyle = 'full';
          formatOptions.timeStyle = 'full';
          break;
        default:
          formatOptions.dateStyle = 'medium';
          formatOptions.timeStyle = 'short';
      }

      return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
    } catch (error) {
      this.logger.error(`Error formatting datetime: ${error.message}`);
      return date.toString();
    }
  }

  /**
   * Format duration (in milliseconds) to human readable format
   */
  static formatDuration(
    milliseconds: number,
    includeMilliseconds: boolean = false
  ): string {
    try {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const parts: string[] = [];

      if (days > 0) parts.push(`${days}d`);
      if (hours % 24 > 0) parts.push(`${hours % 24}h`);
      if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
      if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);
      
      if (includeMilliseconds && milliseconds % 1000 > 0) {
        parts.push(`${milliseconds % 1000}ms`);
      }

      if (parts.length === 0) {
        return includeMilliseconds ? '0ms' : '0s';
      }

      return parts.join(' ');
    } catch (error) {
      this.logger.error(`Error formatting duration: ${error.message}`);
      return `${milliseconds}ms`;
    }
  }

  /**
   * Format file size in bytes to human readable format
   */
  static formatFileSize(bytes: number): string {
    try {
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
    } catch (error) {
      this.logger.error(`Error formatting file size: ${error.message}`);
      return `${bytes} B`;
    }
  }

  /**
   * Format production quantity with unit
   */
  static formatQuantity(
    quantity: number,
    unit: string,
    showUnit: boolean = true
  ): string {
    try {
      const formattedQuantity = this.formatNumber(quantity, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      });

      return showUnit ? `${formattedQuantity} ${unit}` : formattedQuantity;
    } catch (error) {
      this.logger.error(`Error formatting quantity: ${error.message}`);
      return `${quantity} ${unit}`;
    }
  }

  /**
   * Format efficiency score
   */
  static formatEfficiency(score: number): string {
    try {
      return this.formatPercentage(score, 1, 1);
    } catch (error) {
      this.logger.error(`Error formatting efficiency: ${error.message}`);
      return `${score.toFixed(1)}%`;
    }
  }

  /**
   * Format OEE score with color coding
   */
  static formatOEE(
    score: number,
    includeLevel: boolean = false
  ): { formatted: string; level: string; color: string } {
    try {
      const formatted = this.formatPercentage(score, 1, 1);
      
      let level: string;
      let color: string;

      if (score >= 85) {
        level = 'World Class';
        color = '#22c55e'; // green
      } else if (score >= 75) {
        level = 'Good';
        color = '#84cc16'; // lime
      } else if (score >= 65) {
        level = 'Acceptable';
        color = '#eab308'; // yellow
      } else if (score >= 50) {
        level = 'Poor';
        color = '#f97316'; // orange
      } else {
        level = 'Unacceptable';
        color = '#ef4444'; // red
      }

      return {
        formatted: includeLevel ? `${formatted} (${level})` : formatted,
        level,
        color,
      };
    } catch (error) {
      this.logger.error(`Error formatting OEE: ${error.message}`);
      return {
        formatted: `${score.toFixed(1)}%`,
        level: 'Unknown',
        color: '#6b7280', // gray
      };
    }
  }

  /**
   * Format work order status with styling
   */
  static formatStatus(status: string): { 
    formatted: string; 
    color: string; 
    backgroundColor: string;
  } {
    try {
      const statusMap: Record<string, { color: string; bg: string }> = {
        pending: { color: '#f59e0b', bg: '#fef3c7' },
        in_progress: { color: '#3b82f6', bg: '#dbeafe' },
        completed: { color: '#10b981', bg: '#d1fae5' },
        cancelled: { color: '#ef4444', bg: '#fee2e2' },
        on_hold: { color: '#8b5cf6', bg: '#ede9fe' },
        delayed: { color: '#f97316', bg: '#fed7aa' },
      };

      const config = statusMap[status.toLowerCase()] || { 
        color: '#6b7280', 
        bg: '#f3f4f6' 
      };

      return {
        formatted: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: config.color,
        backgroundColor: config.bg,
      };
    } catch (error) {
      this.logger.error(`Error formatting status: ${error.message}`);
      return {
        formatted: status,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
      };
    }
  }

  /**
   * Format priority level
   */
  static formatPriority(priority: string): {
    formatted: string;
    color: string;
    weight: number;
  } {
    try {
      const priorityMap: Record<string, { color: string; weight: number }> = {
        critical: { color: '#dc2626', weight: 5 },
        high: { color: '#ea580c', weight: 4 },
        medium: { color: '#ca8a04', weight: 3 },
        low: { color: '#16a34a', weight: 2 },
        minimal: { color: '#6b7280', weight: 1 },
      };

      const config = priorityMap[priority.toLowerCase()] || { 
        color: '#6b7280', 
        weight: 3 
      };

      return {
        formatted: priority.charAt(0).toUpperCase() + priority.slice(1),
        color: config.color,
        weight: config.weight,
      };
    } catch (error) {
      this.logger.error(`Error formatting priority: ${error.message}`);
      return {
        formatted: priority,
        color: '#6b7280',
        weight: 3,
      };
    }
  }

  /**
   * Format address for display
   */
  static formatAddress(address: any): string {
    try {
      if (!address) return '';

      const parts = [
        address.street,
        address.city,
        address.state,
        address.postalCode,
        address.country,
      ].filter(Boolean);

      return parts.join(', ');
    } catch (error) {
      this.logger.error(`Error formatting address: ${error.message}`);
      return '';
    }
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(
    phoneNumber: string,
    countryCode: string = 'US'
  ): string {
    try {
      // Remove all non-digits
      const digits = phoneNumber.replace(/\D/g, '');

      if (countryCode === 'US' && digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }

      if (countryCode === 'US' && digits.length === 11 && digits[0] === '1') {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      }

      // For international numbers, just add + prefix if not present
      return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    } catch (error) {
      this.logger.error(`Error formatting phone number: ${error.message}`);
      return phoneNumber;
    }
  }

  /**
   * Truncate text with ellipsis
   */
  static truncateText(
    text: string,
    maxLength: number,
    ellipsis: string = '...'
  ): string {
    try {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength - ellipsis.length) + ellipsis;
    } catch (error) {
      this.logger.error(`Error truncating text: ${error.message}`);
      return text;
    }
  }

  /**
   * Format custom date with specific pattern
   */
  private static formatDateCustom(date: Date, pattern: string): string {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      return pattern
        .replace('YYYY', year.toString())
        .replace('YY', year.toString().slice(-2))
        .replace('MM', month.toString().padStart(2, '0'))
        .replace('M', month.toString())
        .replace('DD', day.toString().padStart(2, '0'))
        .replace('D', day.toString())
        .replace('HH', hours.toString().padStart(2, '0'))
        .replace('H', hours.toString())
        .replace('mm', minutes.toString().padStart(2, '0'))
        .replace('m', minutes.toString())
        .replace('ss', seconds.toString().padStart(2, '0'))
        .replace('s', seconds.toString());
    } catch (error) {
      this.logger.error(`Error formatting custom date: ${error.message}`);
      return date.toISOString();
    }
  }

  /**
   * Format machine/device ID for display
   */
  static formatDeviceId(deviceId: string): string {
    try {
      // Convert to uppercase and add dashes for readability
      const clean = deviceId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      
      if (clean.length <= 4) return clean;
      if (clean.length <= 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
      if (clean.length <= 12) {
        return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
      }
      
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12)}`;
    } catch (error) {
      this.logger.error(`Error formatting device ID: ${error.message}`);
      return deviceId;
    }
  }

  /**
   * Format version number
   */
  static formatVersion(version: string | number): string {
    try {
      if (typeof version === 'number') {
        return `v${version.toFixed(1)}`;
      }
      
      if (!version.startsWith('v') && !version.startsWith('V')) {
        return `v${version}`;
      }
      
      return version;
    } catch (error) {
      this.logger.error(`Error formatting version: ${error.message}`);
      return version.toString();
    }
  }

  /**
   * Format measurement with unit and precision
   */
  static formatMeasurement(
    value: number,
    unit: string,
    precision: number = 2
  ): string {
    try {
      const formattedValue = this.formatNumber(value, {
        minimumFractionDigits: 0,
        maximumFractionDigits: precision,
      });

      return `${formattedValue} ${unit}`;
    } catch (error) {
      this.logger.error(`Error formatting measurement: ${error.message}`);
      return `${value} ${unit}`;
    }
  }
}
