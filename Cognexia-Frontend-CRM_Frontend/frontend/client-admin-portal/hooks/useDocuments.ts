import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, contractApi, signatureApi } from '@/services/document.api';
import type {
  Document,
  CreateDocumentDto,
  UpdateDocumentDto,
  ShareDocumentDto,
  Contract,
  CreateContractDto,
  UpdateContractDto,
  CreateSignatureRequestDto,
  SignDocumentDto,
} from '@/types/api.types';

const DOCUMENT_KEY = 'documents';
const CONTRACT_KEY = 'contracts';
const SIGNATURE_KEY = 'signatures';

// Document Hooks
export const useGetDocuments = () => {
  return useQuery<Document[]>({
    queryKey: [DOCUMENT_KEY],
    queryFn: () => documentApi.getDocuments(),
  });
};

export const useGetDocument = (id: string) => {
  return useQuery<Document>({
    queryKey: [DOCUMENT_KEY, id],
    queryFn: () => documentApi.getDocumentById(id),
    enabled: !!id,
  });
};

export const useGetDocumentVersions = (id: string) => {
  return useQuery({
    queryKey: [DOCUMENT_KEY, id, 'versions'],
    queryFn: () => documentApi.getDocumentVersions(id),
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentDto) => documentApi.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentApi.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY, variables.id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY] });
    },
  });
};

export const useShareDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShareDocumentDto }) =>
      documentApi.shareDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY, variables.id] });
    },
  });
};

export const useSearchDocuments = (query: string) => {
  return useQuery<Document[]>({
    queryKey: [DOCUMENT_KEY, 'search', query],
    queryFn: () => documentApi.searchDocuments(query),
    enabled: !!query && query.length > 2,
  });
};

// Contract Hooks
export const useGetContracts = () => {
  return useQuery<Contract[]>({
    queryKey: [CONTRACT_KEY],
    queryFn: () => contractApi.getContracts(),
  });
};

export const useGetContract = (id: string) => {
  return useQuery<Contract>({
    queryKey: [CONTRACT_KEY, id],
    queryFn: () => contractApi.getContractById(id),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractDto) => contractApi.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractDto }) =>
      contractApi.updateContract(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY, variables.id] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractApi.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
    },
  });
};

export const useGetContractTemplates = () => {
  return useQuery({
    queryKey: [CONTRACT_KEY, 'templates'],
    queryFn: () => contractApi.getContractTemplates(),
  });
};

// Signature Hooks
export const useCreateSignatureRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSignatureRequestDto) => signatureApi.createSignatureRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SIGNATURE_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY] });
    },
  });
};

export const useGetSignatureStatus = (documentId: string) => {
  return useQuery({
    queryKey: [SIGNATURE_KEY, documentId],
    queryFn: () => signatureApi.getSignatureStatus(documentId),
    enabled: !!documentId,
  });
};

export const useSignDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ signatureId, data }: { signatureId: string; data: SignDocumentDto }) =>
      signatureApi.signDocument(signatureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SIGNATURE_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY] });
    },
  });
};

export const useGetSignatureAuditTrail = (documentId: string) => {
  return useQuery({
    queryKey: [SIGNATURE_KEY, documentId, 'audit-trail'],
    queryFn: () => signatureApi.getSignatureAuditTrail(documentId),
    enabled: !!documentId,
  });
};

export const useCancelSignatureRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signatureId: string) => signatureApi.cancelSignatureRequest(signatureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SIGNATURE_KEY] });
    },
  });
};

export const useSendReminder = () => {
  return useMutation({
    mutationFn: (signatureId: string) => signatureApi.sendReminder(signatureId),
  });
};
