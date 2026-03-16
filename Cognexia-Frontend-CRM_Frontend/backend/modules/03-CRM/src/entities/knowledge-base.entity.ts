import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ArticleVisibility {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
}

export enum ArticleType {
  HOW_TO = 'HOW_TO',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  FAQ = 'FAQ',
  BEST_PRACTICE = 'BEST_PRACTICE',
  POLICY = 'POLICY',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  TUTORIAL = 'TUTORIAL',
}

@Entity('knowledge_base_articles')
export class KnowledgeBaseArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  article_number: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  summary: string;

  @Column({
    type: 'simple-enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({
    type: 'simple-enum',
    enum: ArticleVisibility,
    default: ArticleVisibility.INTERNAL,
  })
  visibility: ArticleVisibility;

  @Column({
    type: 'simple-enum',
    enum: ArticleType,
    default: ArticleType.HOW_TO,
  })
  type: ArticleType;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  keywords: string[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  author_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ nullable: true })
  reviewer_id: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  helpful_count: number;

  @Column({ default: 0 })
  not_helpful_count: number;

  @Column({ type: 'float', default: 0 })
  average_rating: number;

  @Column({ default: 0 })
  rating_count: number;

  @Column({ default: 0 })
  search_rank: number;

  @Column('json', { nullable: true })
  related_articles: string[];

  @Column('json', { nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];

  @Column('json', { nullable: true })
  video_links: {
    title: string;
    url: string;
    thumbnail: string;
  }[];

  @Column({ nullable: true })
  parent_article_id: string;

  @Column({ default: 1 })
  version: number;

  @Column('text', { nullable: true })
  version_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_reviewed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_review_date: Date;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: false })
  requires_authentication: boolean;

  @Column('simple-array', { nullable: true })
  allowed_roles: string[];

  @Column({ nullable: true })
  locale: string;

  @Column('json', { nullable: true })
  translations: {
    [locale: string]: {
      title: string;
      content: string;
      summary: string;
    };
  };

  @Column({ nullable: true })
  seo_title: string;

  @Column('text', { nullable: true })
  seo_description: string;

  @Column('simple-array', { nullable: true })
  seo_keywords: string[];

  @Column({ nullable: true })
  canonical_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
