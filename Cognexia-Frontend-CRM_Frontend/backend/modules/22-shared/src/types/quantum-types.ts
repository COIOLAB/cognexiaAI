// ===========================================
// QUANTUM COMPUTING TYPES FOR MAINTENANCE
// Industry 5.0 ERP Backend System
// ===========================================

export interface QuantumCircuit {
  circuitId: string;
  qubits: number;
  gates: QuantumGate[];
  depth: number;
  complexity: string;
}

export interface QuantumGate {
  gateType: string;
  qubits: number[];
  parameters: number[];
  matrix: number[][];
}

export interface QuantumState {
  stateId: string;
  amplitudes: Complex[];
  entanglement: number;
  superposition: boolean;
}

export interface Complex {
  real: number;
  imaginary: number;
}

export interface QuantumOptimizationResult {
  resultId: string;
  optimizationProblem: string;
  solution: any;
  objectiveValue: number;
  quantumAdvantage: number;
  executionTime: number;
}

export interface QuantumAlgorithm {
  algorithmName: string;
  description: string;
  complexity: string;
  inputSize: number;
  expectedSpeedup: number;
}
