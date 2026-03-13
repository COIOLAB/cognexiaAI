// ===========================================
// BLOCKCHAIN TYPES FOR MAINTENANCE TRACEABILITY
// Industry 5.0 ERP Backend System
// ===========================================

export interface BlockchainTransaction {
  transactionId: string;
  blockHeight: number;
  timestamp: Date;
  from: string;
  to: string;
  data: Record<string, any>;
  hash: string;
  signature: string;
}

export interface MaintenanceRecord {
  recordId: string;
  equipmentId: string;
  maintenanceType: string;
  performedBy: string;
  timestamp: Date;
  details: Record<string, any>;
  verification: string[];
  hash: string;
}

export interface SmartContract {
  contractAddress: string;
  contractName: string;
  version: string;
  deployedAt: Date;
  functions: string[];
  state: Record<string, any>;
}

export interface BlockchainNetwork {
  networkId: string;
  networkName: string;
  consensus: string;
  nodes: number;
  blockTime: number;
  transactionThroughput: number;
}

export interface DigitalSignature {
  signatureId: string;
  signedBy: string;
  timestamp: Date;
  algorithm: string;
  publicKey: string;
  signature: string;
}
