import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { Organization } from './organization.entity';

export enum ConsciousnessLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  TRANSCENDENT = 'TRANSCENDENT',
}

export enum PersonalityArchetype {
  INNOVATOR = 'INNOVATOR',
  PRAGMATIST = 'PRAGMATIST',
  VISIONARY = 'VISIONARY',
  ANALYST = 'ANALYST',
  COLLABORATOR = 'COLLABORATOR',
  MAVERICK = 'MAVERICK',
}

/**
 * Quantum Profile Entity
 * Stores quantum intelligence personality profiling and consciousness simulation data
 */
@Entity('quantum_profiles')
@Index(['customerId', 'organizationId'])
@Index(['consciousnessLevel'])
export class QuantumProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Quantum Personality Profiling
  @Column({
    type: 'simple-enum',
    enum: PersonalityArchetype,
    nullable: true,
  })
  primaryArchetype: PersonalityArchetype;

  @Column({
    type: 'simple-enum',
    enum: PersonalityArchetype,
    nullable: true,
  })
  secondaryArchetype: PersonalityArchetype;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  archetypeConfidence: number; // 0-100

  // Consciousness Simulation
  @Column({
    type: 'simple-enum',
    enum: ConsciousnessLevel,
    default: ConsciousnessLevel.BASIC,
  })
  consciousnessLevel: ConsciousnessLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  awarenessScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  empathyIndex: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  cognitiveComplexity: number; // 0-100

  // Emotional Intelligence
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  emotionalQuotient: number; // 0-100

  @Column({ type: 'simple-json', nullable: true })
  emotionalProfile: {
    dominant: string; // joy, trust, fear, surprise, sadness, disgust, anger, anticipation
    secondary: string;
    intensity: number;
    stability: number;
  };

  // Neural Patterns
  @Column({ type: 'simple-json', nullable: true })
  neuralSignature: {
    decisionMakingStyle: string; // analytical, intuitive, hybrid
    informationProcessing: string; // visual, auditory, kinesthetic
    cognitiveSpeed: number;
    patternRecognition: number;
  };

  // Quantum State
  @Column({ type: 'simple-json', nullable: true })
  quantumState: {
    coherence: number; // 0-1
    entanglementStrength: number;
    waveFunction: string;
    superpositionStates: string[];
    lastCollapse: string; // ISO date
  };

  // Behavioral Predictions
  @Column({ type: 'simple-json', nullable: true })
  behavioralPredictions: {
    purchaseProbability: number;
    churnRisk: number;
    engagementScore: number;
    responsiveness: number;
    innovationAdoption: number;
  };

  // Personality Dimensions (Big Five + Industry 5.0)
  @Column({ type: 'simple-json', nullable: true })
  personalityDimensions: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    digitalFluency: number;
    adaptability: number;
    visionaryThinking: number;
  };

  // Consciousness Attributes
  @Column({ type: 'simple-json', nullable: true })
  consciousnessAttributes: {
    selfAwareness: number;
    metacognition: number;
    intentionality: number;
    phenomenalExperience: number;
    subjectivity: number;
  };

  // Quantum Resonance
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  quantumResonanceScore: number; // Harmony with brand/organization

  @Column({ type: 'simple-json', nullable: true })
  resonanceFactors: {
    valueAlignment: number;
    culturalFit: number;
    visionSync: number;
    energyHarmony: number;
  };

  // Analysis Metadata
  @Column({ type: 'int', default: 0 })
  analysisCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAnalyzedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  profileAccuracy: number; // Confidence in profile accuracy

  @Column({ type: 'int', default: 0 })
  dataPoints: number; // Number of interactions analyzed

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
