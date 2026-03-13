import { Logger } from '@nestjs/common';

/**
 * Custom logger instance for CRM module
 */
export const logger = new Logger('CRM');

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * Log message with context
 */
export function log(message: string, context?: string): void {
  logger.log(message, context || 'CRM');
}

/**
 * Log error
 */
export function logError(message: string, trace?: string, context?: string): void {
  logger.error(message, trace, context || 'CRM');
}

/**
 * Log warning
 */
export function logWarn(message: string, context?: string): void {
  logger.warn(message, context || 'CRM');
}

/**
 * Log debug message
 */
export function logDebug(message: string, context?: string): void {
  logger.debug(message, context || 'CRM');
}

/**
 * Log verbose message
 */
export function logVerbose(message: string, context?: string): void {
  logger.verbose(message, context || 'CRM');
}

/**
 * Log request
 */
export function logRequest(method: string, url: string, userId?: string): void {
  const message = `[${method}] ${url}${userId ? ` - User: ${userId}` : ''}`;
  logger.log(message, 'HTTP');
}

/**
 * Log response
 */
export function logResponse(method: string, url: string, statusCode: number, duration: number): void {
  const message = `[${method}] ${url} - ${statusCode} (${duration}ms)`;
  logger.log(message, 'HTTP');
}

/**
 * Log database query
 */
export function logQuery(query: string, duration?: number): void {
  const message = duration ? `Query executed in ${duration}ms` : 'Query executed';
  logger.debug(`${message}: ${query}`, 'Database');
}

/**
 * Log security event
 */
export function logSecurityEvent(event: string, details: Record<string, any>): void {
  logger.warn(`Security Event: ${event} - ${JSON.stringify(details)}`, 'Security');
}

/**
 * Log business event
 */
export function logBusinessEvent(event: string, details: Record<string, any>): void {
  logger.log(`Business Event: ${event} - ${JSON.stringify(details)}`, 'Business');
}

/**
 * Create logger for specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
