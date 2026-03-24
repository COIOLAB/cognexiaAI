import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IsEmail, IsOptional } from 'class-validator';
import { CustomerInteraction } from './customer-interaction.entity';
import { Organization } from './organization.entity';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  ORG_USER = 'org_user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'simple-enum', enum: UserType, default: UserType.ORG_USER })
  userType: UserType;

  @Column({ nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ nullable: true })
  @IsOptional()
  phoneNumber?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  profile?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  preferences?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  permissions?: string[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  roles?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @IsOptional()
  lastLoginAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  avatarUrl?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  @IsOptional()
  ssoProvider?: string;

  @Column({ nullable: true })
  @IsOptional()
  ssoProviderId?: string;

  @Column({ default: false })
  isInvited: boolean;

  @Column({ nullable: true })
  invitationToken?: string;

  @Column({ nullable: true })
  invitedAt?: Date;

  @Column({ nullable: true })
  invitationAcceptedAt?: Date;

  @OneToMany(() => CustomerInteraction, interaction => interaction.assignedUser)
  interactions: CustomerInteraction[];

<<<<<<< Updated upstream
=======
  @Column({ nullable: true })
  @IsOptional()
  managerId?: string;

  @ManyToOne(() => User, user => user.subordinates, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: User;

  @OneToMany(() => User, user => user.manager)
  subordinates: User[];

  @DeleteDateColumn()
  deletedAt: Date;

>>>>>>> Stashed changes
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
