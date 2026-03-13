import apiClient from '../lib/api-client';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'file';
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: any;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED';
  fields: FormField[];
  design?: any;
  embedCode?: string;
  enableRecaptcha?: boolean;
  enableHoneypot?: boolean;
  successMessage?: string;
  redirectUrl?: string;
  notificationEmail?: string;
  viewCount?: number;
  submissionCount?: number;
  conversionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  leadId?: string;
  submittedAt: string;
}

export const formApi = {
  // Create Form
  createForm: async (data: Partial<Form>) => {
    const response = await apiClient.post('/forms', data);
    return response.data;
  },

  // Get All Forms
  getForms: async (): Promise<Form[]> => {
    const response = await apiClient.get('/forms');
    return response.data;
  },

  // Get Form by ID
  getForm: async (id: string): Promise<Form> => {
    const response = await apiClient.get(`/forms/${id}`);
    return response.data;
  },

  // Update Form
  updateForm: async (id: string, data: Partial<Form>) => {
    const response = await apiClient.put(`/forms/${id}`, data);
    return response.data;
  },

  // Delete Form
  deleteForm: async (id: string) => {
    const response = await apiClient.delete(`/forms/${id}`);
    return response.data;
  },

  // Publish Form
  publishForm: async (id: string) => {
    const response = await apiClient.post(`/forms/${id}/publish`);
    return response.data;
  },

  // Pause Form
  pauseForm: async (id: string) => {
    const response = await apiClient.post(`/forms/${id}/pause`);
    return response.data;
  },

  // Duplicate Form
  duplicateForm: async (id: string) => {
    const response = await apiClient.post(`/forms/${id}/duplicate`);
    return response.data;
  },

  // Get Form Submissions
  getFormSubmissions: async (id: string): Promise<FormSubmission[]> => {
    const response = await apiClient.get(`/forms/${id}/submissions`);
    return response.data;
  },

  // Get Form Analytics
  getFormAnalytics: async (id: string) => {
    const response = await apiClient.get(`/forms/${id}/analytics`);
    return response.data;
  },

  // Get Embed Code
  getEmbedCode: async (id: string) => {
    const response = await apiClient.get(`/forms/${id}/embed-code`);
    return response.data;
  },
};
