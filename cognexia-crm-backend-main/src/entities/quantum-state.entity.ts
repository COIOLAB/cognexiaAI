import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { Organization } from './organization.entity';

export enum QuantumPhase {
  SUPERPOSITION = 'SUPERPOSITION',
  COLLAPSED = 'COLLAPSED',
  ENTANGLED = 'ENTANGLED',
  COHERENT = 'COHERENT',
  DECOHERENT = 'DECOHERENT',
}

/**
 * Quantum State Entity
 * Tracks real-time quantum state of customers
 */
@Entity('quantum_states')
@Index(['customerId', 'organizationId'])
@Index(['phase'])
@Index(['lastMeasurement'])
export class QuantumState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'customer_id', unique: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Quantum Phase
  @Column({
    type: 'simple-enum',
    enum: QuantumPhase,
    default: QuantumPhase.SUPERPOSITION,
  })
  phase: QuantumPhase;

  // Wave Function
  @Column({ type: 'text', nullable: true })
  waveFunction: string; // Mathematical representation of customer state

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  waveFunctionAmplitude: number; // Strength of wave function

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  waveFunctionFrequency: number; // Oscillation frequency

  // Superposition States
  @Column({ type: 'simple-json', nullable: true })
  superpositionStates: {
    state: string;
    probability: number;
    amplitude: number;
  }[];

  @Column({ type: 'int', default: 0 })
  activeStatesCount: number; // Number of simultaneous states

  // Coherence
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  coherence: number; // 0-100: How well the quantum state is maintained

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  decoherenceRate: number; // Rate of coherence loss per unit time

  @Column({ type: 'timestamp', nullable: true })
  coherenceThreshold: Date; // When coherence drops below acceptable level

  // Measurement History
  @Column({ type: 'timestamp' })
  lastMeasurement: Date;

  @Column({ type: 'simple-json', nullable: true })
  measurementHistory: {
    timestamp: string;
    phase: string;
    collapsedState: string;
    probability: number;
  }[];

  @Column({ type: 'int', default: 0 })
  measurementCount: number;

  // Collapsed State (after measurement)
  @Column({ type: 'text', nullable: true })
  collapsedState: string; // Current definite state after measurement

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  collapseConfidence: number; // Confidence in collapsed state

  @Column({ type: 'timestamp', nullable: true })
  lastCollapseAt: Date;

  // Entanglement Information
  @Column({ type: 'int', default: 0 })
  entanglementCount: number; // Number of entangled customers

  @Column({ type: 'simple-json', nullable: true })
  entangledWith: string[]; // Customer IDs of entangled customers

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  maxEntanglementStrength: number; // Strongest entanglement

  // Quantum Observables
  @Column({ type: 'simple-json', nullable: true })
  observables: {
    position: number; // Customer journey position
    momentum: number; // Rate of progress through journey
    energy: number; // Engagement energy
    spin: number; // Orientation towards brand
  };

  // Uncertainty Principles
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  positionUncertainty: number; // Uncertainty in customer position

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  momentumUncertainty: number; // Uncertainty in momentum

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  heisenbergProduct: number; // Position × Momentum uncertainty

  // Quantum Tunneling
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tunnelingProbability: number; // Probability of unexpected state transitions

  @Column({ type: 'simple-json', nullable: true })
  tunnelingEvents: {
    timestamp: string;
    fromState: string;
    toState: string;
    barrierHeight: number;
  }[];

  // Quantum Interference
  @Column({ type: 'simple-json', nullable: true })
  interferencePattern: {
    constructive: number; // Reinforcing behaviors
    destructive: number; // Canceling behaviors
    nodes: string[]; // Points of zero amplitude
  };

  // State Evolution
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  evolutionSpeed: number; // How fast the state is changing

  @Column({ type: 'text', nullable: true })
  hamiltonianOperator: string; // Operator governing state evolution

  @Column({ type: 'timestamp', nullable: true })
  nextPredictedTransition: Date;

  // Quantum Noise
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  environmentalNoise: number; // External factors affecting state

  @Column({ type: 'simple-json', nullable: true })
  noiseSources: {
    source: string;
    impact: number;
  }[];

  // Fidelity
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  stateFidelity: number; // 0-100: Accuracy of state representation

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  measurementError: number; // Error in measurements

  // Metadata
  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
