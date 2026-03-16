import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { Organization } from './organization.entity';

export enum ResonanceType {
  COLLABORATIVE = 'COLLABORATIVE',
  COMPETITIVE = 'COMPETITIVE',
  COMPLEMENTARY = 'COMPLEMENTARY',
  NEUTRAL = 'NEUTRAL',
  ANTAGONISTIC = 'ANTAGONISTIC',
}

export enum EntanglementStrength {
  WEAK = 'WEAK',
  MODERATE = 'MODERATE',
  STRONG = 'STRONG',
  QUANTUM_LOCKED = 'QUANTUM_LOCKED',
}

/**
 * Entanglement Analysis Entity
 * Stores quantum relationship patterns and entanglement between customers
 */
@Entity('entanglement_analyses')
@Index(['sourceCustomerId', 'organizationId'])
@Index(['targetCustomerId', 'organizationId'])
@Index(['entanglementStrength'])
export class EntanglementAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'source_customer_id' })
  sourceCustomerId: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'source_customer_id' })
  sourceCustomer: Customer;

  @Column({ name: 'target_customer_id' })
  targetCustomerId: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'target_customer_id' })
  targetCustomer: Customer;

  // Quantum Entanglement Metrics
  @Column({
    type: 'simple-enum',
    enum: EntanglementStrength,
    default: EntanglementStrength.WEAK,
  })
  entanglementStrength: EntanglementStrength;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  quantumCorrelation: number; // 0-100: How strongly their behaviors correlate

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  coherenceScore: number; // 0-100: How synchronized their states are

  // Relationship Dynamics
  @Column({
    type: 'simple-enum',
    enum: ResonanceType,
    default: ResonanceType.NEUTRAL,
  })
  resonanceType: ResonanceType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  harmonicAlignment: number; // 0-100: Value/goal alignment

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  influenceScore: number; // 0-100: How much source influences target

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  mutualInfluence: number; // 0-100: Bidirectional influence

  // Quantum Linkage
  @Column({ type: 'simple-json', nullable: true })
  quantumLinkage: {
    linkType: string; // shared_interests, common_network, similar_behavior, industry_peers
    linkStrength: number;
    discoveredAt: string; // ISO date
    confidence: number;
  };

  // Behavioral Patterns
  @Column({ type: 'simple-json', nullable: true })
  sharedPatterns: {
    purchaseBehavior: boolean;
    communicationStyle: boolean;
    decisionMaking: boolean;
    engagementTiming: boolean;
    channelPreference: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  behavioralCorrelations: {
    purchaseCorrelation: number;
    engagementCorrelation: number;
    lifetimeValueCorrelation: number;
    churnRiskCorrelation: number;
  };

  // Network Effects
  @Column({ type: 'int', default: 0 })
  sharedConnections: number; // Mutual connections in network

  @Column({ type: 'int', default: 0 })
  networkDistance: number; // Degrees of separation

  @Column({ type: 'simple-json', nullable: true })
  networkPath: string[]; // Path between customers in network

  // Quantum State Overlap
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  stateOverlap: number; // 0-100: How similar their quantum states are

  @Column({ type: 'simple-json', nullable: true })
  sharedSuperpositions: string[]; // Common superposition states

  // Temporal Dynamics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  temporalCorrelation: number; // 0-100: Time-synchronized behaviors

  @Column({ type: 'simple-json', nullable: true })
  synchronizedEvents: {
    eventType: string;
    timestamp: string;
    correlation: number;
  }[];

  // Predictive Insights
  @Column({ type: 'simple-json', nullable: true })
  predictiveInsights: {
    coChurnRisk: number; // Likelihood of churning together
    crossSellOpportunity: number; // Opportunity for cross-referrals
    mutualGrowthPotential: number;
    synergyCoefficient: number;
  };

  // Relationship Evolution
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  evolutionRate: number; // How fast the relationship is changing

  @Column({ type: 'simple-enum', enum: ['STRENGTHENING', 'WEAKENING', 'STABLE', 'FLUCTUATING'], default: 'STABLE' })
  evolutionTrend: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMeasuredAt: Date;

  // Analysis Metadata
  @Column({ type: 'int', default: 0 })
  analysisCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  analysisConfidence: number; // Confidence in analysis accuracy

  @Column({ type: 'int', default: 0 })
  dataPoints: number; // Number of data points analyzed

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
