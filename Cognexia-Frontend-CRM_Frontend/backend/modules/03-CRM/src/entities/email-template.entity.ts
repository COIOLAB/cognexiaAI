import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('email_templates')
@Index(['category', 'isActive'])
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ length: 500 })
  subject: string;

  @Column('text')
  bodyHtml: string;

  @Column('text', { nullable: true })
  bodyText?: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('json', { nullable: true })
  variables?: {
    name: string;
    type: string;
    defaultValue?: any;
    description?: string;
  }[];

  @Column('json', { nullable: true })
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    previewText?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  usageCount: number;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @Column({ length: 255, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
