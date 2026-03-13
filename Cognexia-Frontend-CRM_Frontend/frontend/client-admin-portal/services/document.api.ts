import apiClient from '@/lib/api-client';
import type {
  Document,
  CreateDocumentDto,
  UpdateDocumentDto,
  ShareDocumentDto,
  DocumentVersion,
  Contract,
  CreateContractDto,
  UpdateContractDto,
  DocumentSignature,
  CreateSignatureRequestDto,
  SignDocumentDto,
  SignatureAuditTrail,
} from '@/types/api.types';

const DOCUMENT_URL = '/documents';
const CONTRACT_URL = '/documents/contracts';
const SIGNATURE_URL = '/documents/signatures';

// Document API
export const documentApi = {
  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get(DOCUMENT_URL);
    return response.data;
  },

  async getDocumentById(id: string): Promise<Document> {
    const response = await apiClient.get(`${DOCUMENT_URL}/${id}`);
    return response.data;
  },

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    const response = await apiClient.get(`${DOCUMENT_URL}/${id}/versions`);
    return response.data;
  },

  async uploadDocument(data: CreateDocumentDto): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('documentType', data.documentType);
    if (data.entityType) formData.append('entityType', data.entityType);
    if (data.entityId) formData.append('entityId', data.entityId);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
    if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));

    const response = await apiClient.post(DOCUMENT_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateDocument(id: string, data: UpdateDocumentDto): Promise<Document> {
    const response = await apiClient.put(`${DOCUMENT_URL}/${id}`, data);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`${DOCUMENT_URL}/${id}`);
  },

  async shareDocument(id: string, data: ShareDocumentDto): Promise<void> {
    await apiClient.post(`${DOCUMENT_URL}/${id}/share`, data);
  },

  async searchDocuments(query: string): Promise<Document[]> {
    const response = await apiClient.get(`${DOCUMENT_URL}/search`, {
      params: { q: query },
    });
    return response.data;
  },
};

// Contract API
export const contractApi = {
  async getContracts(): Promise<Contract[]> {
    const response = await apiClient.get(CONTRACT_URL);
    return response.data;
  },

  async getContractById(id: string): Promise<Contract> {
    const response = await apiClient.get(`${CONTRACT_URL}/${id}`);
    return response.data;
  },

  async createContract(data: CreateContractDto): Promise<Contract> {
    const response = await apiClient.post(CONTRACT_URL, data);
    return response.data;
  },

  async updateContract(id: string, data: UpdateContractDto): Promise<Contract> {
    const response = await apiClient.put(`${CONTRACT_URL}/${id}`, data);
    return response.data;
  },

  async deleteContract(id: string): Promise<void> {
    await apiClient.delete(`${CONTRACT_URL}/${id}`);
  },

  async getContractTemplates(): Promise<any[]> {
    const response = await apiClient.get(`${CONTRACT_URL}/templates`);
    return response.data;
  },
};

// Signature API
export const signatureApi = {
  async createSignatureRequest(data: CreateSignatureRequestDto): Promise<DocumentSignature[]> {
    const response = await apiClient.post(`${SIGNATURE_URL}/request`, data);
    return response.data;
  },

  async getSignatureStatus(documentId: string): Promise<DocumentSignature[]> {
    const response = await apiClient.get(`${SIGNATURE_URL}/${documentId}`);
    return response.data;
  },

  async signDocument(signatureId: string, data: SignDocumentDto): Promise<DocumentSignature> {
    const response = await apiClient.post(`${SIGNATURE_URL}/${signatureId}/sign`, data);
    return response.data;
  },

  async getSignatureAuditTrail(documentId: string): Promise<SignatureAuditTrail> {
    const response = await apiClient.get(`${SIGNATURE_URL}/${documentId}/audit`);
    return response.data;
  },

  async cancelSignatureRequest(signatureId: string): Promise<void> {
    await apiClient.post(`${SIGNATURE_URL}/${signatureId}/decline`, {
      reason: 'Cancelled by requester',
    });
  },

  async sendReminder(signatureId: string): Promise<void> {
    await apiClient.post(`${SIGNATURE_URL}/${signatureId}/remind`);
  },
};
