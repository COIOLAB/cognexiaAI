import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('white_label_configs')
export class WhiteLabelConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ nullable: true })
  customDomain: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ type: 'json', nullable: true })
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };

  @Column({ nullable: true })
  companyName: string;

  @Column({ type: 'json', nullable: true })
  emailTemplates: Record<string, any>;

  @Column({ default: false })
  ssoEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  ssoConfig: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
