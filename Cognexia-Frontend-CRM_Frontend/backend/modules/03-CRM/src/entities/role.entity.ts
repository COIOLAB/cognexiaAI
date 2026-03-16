import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { IsOptional } from 'class-validator';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  hierarchy?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  inheritance?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  templates?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  securityValidation?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  constraints?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @IsOptional()
  expiresAt?: Date;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
