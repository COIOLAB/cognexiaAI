import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { LLMConversation } from './llm-conversation.entity';
import { Organization } from './organization.entity';

@Entity('llm_messages')
@Index(['conversationId', 'organizationId'])
export class LLMMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => LLMConversation, { nullable: false })
  @JoinColumn({ name: 'conversation_id' })
  conversation: LLMConversation;

  @Column({ type: 'varchar', length: 50 })
  role: string; // user, assistant, system

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  tokens: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}