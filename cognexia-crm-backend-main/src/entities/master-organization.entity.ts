import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('master_organizations')
export class MasterOrganization {
  @ApiProperty({ description: 'Master Organization UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Master organization name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Email' })
  @Column({ nullable: true })
  email?: string;

  @ApiProperty({ description: 'Contact email' })
  @Column({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ description: 'Phone' })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Address' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ description: 'Website' })
  @Column({ nullable: true })
  website?: string;

  @ApiProperty({ description: 'Logo URL' })
  @Column({ nullable: true })
  logoUrl?: string;

  @ApiProperty({ description: 'Branding' })
  @Column({ type: 'json', nullable: true })
  branding?: Record<string, any>;

  @ApiProperty({ description: 'Settings' })
  @Column({ type: 'json', nullable: true })
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
