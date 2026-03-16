import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

export enum ComplianceStandard {
  GDPR = 'GDPR',
  SOC2 = 'SOC2',
  HIPAA = 'HIPAA',
  PCI_DSS = 'PCI_DSS',
  ISO_27001 = 'ISO_27001',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  UNKNOWN = 'unknown',
}

@Entity('compliance_checks')
export class ComplianceCheck {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ApiProperty({ enum: ComplianceStandard })
  @Column({ type: 'enum', enum: ComplianceStandard })
  standard: ComplianceStandard;

  @ApiProperty({ enum: ComplianceStatus })
  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.PENDING })
  status: ComplianceStatus;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  checkDate: Date;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  results: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
    details: Array<{
      requirement: string;
      status: string;
      notes: string;
    }>;
  };

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  nextCheckDate: Date;

  @ApiProperty()
  @Column({ default: false })
  autoCheck: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
