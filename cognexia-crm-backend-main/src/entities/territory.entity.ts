import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

export enum AssignmentStrategy {
  ROUND_ROBIN = 'round_robin',
  LOAD_BALANCED = 'load_balanced',
  FIRST_AVAILABLE = 'first_available',
  PRIORITY_BASED = 'priority_based',
}

export interface AssignmentRule {
  id: string;
  field: string; // lead field to evaluate (e.g., 'state', 'industry', 'company_size')
  operator: 'equals' | 'contains' | 'in' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  priority: number; // Higher priority rules are evaluated first
}

export interface TerritoryBoundary {
  type: 'country' | 'state' | 'city' | 'zipcode' | 'custom';
  values: string[]; // List of country codes, state codes, cities, or zip codes
}

@Entity('territories')
export class Territory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;

  // Geographic boundaries
  @Column({ type: 'json', nullable: true })
  boundaries: TerritoryBoundary[];

  // Assignment rules
  @Column({ type: 'json', default: [] })
  assignmentRules: AssignmentRule[];

  @Column({
    type: 'simple-enum',
    enum: AssignmentStrategy,
    default: AssignmentStrategy.ROUND_ROBIN,
  })
  assignmentStrategy: AssignmentStrategy;

  // Assignment tracking for round-robin
  @Column({ default: 0 })
  lastAssignedIndex: number;

  // Priority and capacity
  @Column({ default: 1 })
  priority: number;

  @Column({ default: false })
  hasCapacityLimit: boolean;

  @Column({ nullable: true })
  maxLeadsPerUser: number;

  // Users assigned to this territory
  @ManyToMany(() => User)
  @JoinTable({
    name: 'territory_users',
    joinColumn: { name: 'territoryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: User[];

  // Statistics
  @Column({ default: 0 })
  totalLeadsAssigned: number;

  @Column({ default: 0 })
  activeLeads: number;

  @Column({ default: 0 })
  convertedLeads: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  // Working hours (for assignment timing)
  @Column({ type: 'json', nullable: true })
  workingHours: {
    timezone: string;
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };

  // Overflow handling
  @Column({ nullable: true })
  overflowTerritoryId: string;

  @Column({ default: false })
  sendNotificationOnAssignment: boolean;

  @Column({ type: 'simple-array', nullable: true })
  notificationEmails: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
