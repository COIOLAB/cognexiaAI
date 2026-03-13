import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('organization_health_scores')
export class OrganizationHealthScore {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ApiProperty({ description: 'Overall health score (0-100)' })
  @Column({ type: 'int', default: 50 })
  healthScore: number;

  @ApiProperty({ enum: RiskLevel })
  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  riskLevel: RiskLevel;

  @ApiProperty({ description: 'Days since last login' })
  @Column({ type: 'int', default: 0 })
  daysSinceLastLogin: number;

  @ApiProperty({ description: 'Support ticket volume (last 30 days)' })
  @Column({ type: 'int', default: 0 })
  ticketVolume: number;

  @ApiProperty({ description: 'User engagement score (0-100)' })
  @Column({ type: 'int', default: 50 })
  userEngagement: number;

  @ApiProperty({ description: 'Feature adoption percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  featureAdoption: number;

  @ApiProperty({ description: 'Payment health - failed payments count' })
  @Column({ type: 'int', default: 0 })
  failedPayments: number;

  @ApiProperty({ description: 'Number of active users' })
  @Column({ type: 'int', default: 0 })
  activeUsers: number;

  @ApiProperty({ description: 'API error rate percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  apiErrorRate: number;

  @ApiProperty({ type: 'json', description: 'Health indicators breakdown' })
  @Column({ type: 'json', nullable: true })
  indicators: {
    loginActivity: number;
    supportLoad: number;
    engagement: number;
    adoption: number;
    payment: number;
  };

  @ApiProperty({ type: 'json', description: 'Recommendations to improve health' })
  @Column({ type: 'json', nullable: true })
  recommendations: string[];

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  lastCalculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
