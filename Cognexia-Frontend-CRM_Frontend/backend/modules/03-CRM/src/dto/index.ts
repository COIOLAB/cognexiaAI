// Customer DTOs
export * from './customer.dto';

// Lead DTOs
export * from './lead.dto';

// Contact DTOs
export * from './contact.dto';

// Interaction DTOs
export * from './interaction.dto';

// Opportunity DTOs
export * from './opportunity.dto';

// Sales Quote DTOs
export * from './sales-quote.dto';

// Support Ticket DTOs
export * from './support-ticket.dto';

// Workflow DTOs
export * from './workflow.dto';

// Dashboard DTOs
export * from './dashboard.dto';

// Common Query DTOs
export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface DateRangeDto {
  fromDate?: string;
  toDate?: string;
}

export interface SearchDto {
  search?: string;
}

// Response DTOs
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    filters?: Record<string, any>;
    sorting?: Record<string, string>;
  };
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: Array<{
    field: string;
    value: any;
    constraints: Record<string, string>;
  }>;
}
