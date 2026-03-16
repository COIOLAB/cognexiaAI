import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { IsOptional } from 'class-validator';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  conditions?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  attributes?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @IsOptional()
  category?: string;

  @Column({ default: 0 })
  priority: number;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
