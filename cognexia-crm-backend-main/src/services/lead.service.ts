import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { SequenceEnrollment } from '../entities/sequence-enrollment.entity';
import { CreateLeadDto } from '../dto/lead.dto';
import { UpdateLeadDto } from '../dto/lead.dto';
import { PaginationDto } from '../dto';
import { LeadStatus } from '../entities/lead.entity';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(SequenceEnrollment)
    private readonly enrollmentRepository: Repository<SequenceEnrollment>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      this.logger.log(`Creating lead: ${(createLeadDto as any).contact?.email || 'N/A'}`);
      
      const lead = this.leadRepository.create(createLeadDto);
      const savedLead = await this.leadRepository.save(lead);
      
      this.logger.log(`Lead created successfully: ${savedLead.id}`);
      return savedLead;
    } catch (error) {
      this.logger.error('Error creating lead:', error);
      throw new Error(`Failed to create lead: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findAll(paginationDto: PaginationDto & {
    status?: string;
    source?: string;
    assignedTo?: string;
    minScore?: number;
    search?: string;
    organizationId?: string;
  }): Promise<{
    data: Lead[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page = 1, limit = 10, status, source, assignedTo, minScore, search, organizationId } = paginationDto;
      const qb = this.leadRepository.createQueryBuilder('lead');

      if (organizationId) qb.andWhere('lead.organizationId = :organizationId', { organizationId });
      if (status) qb.andWhere('lead.status = :status', { status });
      if (source) qb.andWhere('lead.source = :source', { source });
      if (assignedTo) qb.andWhere('lead.assignedTo = :assignedTo', { assignedTo });
      const minScoreNumber = Number(minScore);
      if (Number.isFinite(minScoreNumber)) {
        qb.andWhere('lead.score >= :minScore', { minScore: minScoreNumber });
      }
      if (search) {
        qb.andWhere(
          `(lead.contact->>'firstName' ILIKE :q OR lead.contact->>'lastName' ILIKE :q OR lead.contact->>'email' ILIKE :q OR lead.contact->>'company' ILIKE :q OR lead.company ILIKE :q)`,
          { q: `%${search}%` },
        );
      }

      qb.orderBy('lead.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [leads, total] = await qb.getManyAndCount();

      return {
        data: leads,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Error fetching leads:', error);
      throw new Error(`Failed to fetch leads: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findOne(id: string): Promise<Lead> {
    try {
      this.logger.log(`Retrieving lead: ${id}`);
      
      const lead = await this.leadRepository.findOne({
        where: { id },
        relations: ['customer'],
      });

      if (!lead) {
        throw new NotFoundException('Lead not found');
      }

      return lead;
    } catch (error) {
      this.logger.error(`Error fetching lead ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch lead: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    try {
      this.logger.log(`Updating lead: ${id}`);
      
      const lead = await this.findOne(id);
      Object.assign(lead, updateLeadDto);
      
      const updatedLead = await this.leadRepository.save(lead);
      
      this.logger.log(`Lead updated successfully: ${id}`);
      return updatedLead;
    } catch (error) {
      this.logger.error(`Error updating lead ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update lead: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting lead: ${id}`);
      
      const lead = await this.findOne(id);
      // Remove dependent sequence enrollments to satisfy FK constraints
      await this.enrollmentRepository.delete({ leadId: id } as any);
      await this.leadRepository.remove(lead);
      
      this.logger.log(`Lead deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting lead ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete lead: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findByEmail(email: string): Promise<Lead | null> {
    try {
      return await this.leadRepository.findOne({
        where: { contact: { path: ['email'], equals: email } } as any,
        relations: ['customer'],
      });
    } catch (error) {
      this.logger.error(`Error finding lead by email ${email}:`, error);
      throw new Error(`Failed to find lead by email: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findByStatus(status: string): Promise<Lead[]> {
    try {
      return await this.leadRepository.find({
        where: { status: status as any },
        relations: ['customer'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error finding leads by status ${status}:`, error);
      throw new Error(`Failed to find leads by status: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async updateScore(id: string, score: number): Promise<Lead> {
    try {
      const lead = await this.findOne(id);
      lead.score = score;
      
      const updatedLead = await this.leadRepository.save(lead);
      this.logger.log(`Lead score updated: ${id} - Score: ${score}`);
      
      return updatedLead;
    } catch (error) {
      this.logger.error(`Error updating lead score ${id}:`, error);
      throw new Error(`Failed to update lead score: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async convertToOpportunity(id: string): Promise<Lead> {
    try {
      const lead = await this.findOne(id);
      lead.status = LeadStatus.CONVERTED;
      (lead as any).convertedAt = new Date();
      
      const convertedLead = await this.leadRepository.save(lead);
      this.logger.log(`Lead converted to opportunity: ${id}`);
      
      return convertedLead;
    } catch (error) {
      this.logger.error(`Error converting lead ${id}:`, error);
      throw new Error(`Failed to convert lead: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async getLeadsBySource(source: string): Promise<Lead[]> {
    try {
      return await this.leadRepository
        .createQueryBuilder('lead')
        .leftJoinAndSelect('lead.source', 'source')
        .where('source.name = :source', { source })
        .orderBy('lead.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error fetching leads by source ${source}:`, error);
      throw new Error(`Failed to fetch leads by source: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async getHighValueLeads(minScore: number = 80): Promise<Lead[]> {
    try {
      return await this.leadRepository.find({
        where: [
          { score: minScore },
        ],
        relations: ['assignedTo'],
        order: { score: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Error fetching high value leads:', error);
      throw new Error(`Failed to fetch high value leads: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async getStats() {
    try {
      const total = await this.leadRepository.count();
      const open = await this.leadRepository.count({ where: { status: LeadStatus.NEW as any } });
      const qualified = await this.leadRepository.count({ where: { status: LeadStatus.QUALIFIED as any } });
      const converted = await this.leadRepository.count({ where: { status: LeadStatus.CONVERTED as any } });

      const last30 = new Date();
      last30.setDate(last30.getDate() - 30);
      const createdLast30 = await this.leadRepository.count({
        where: { createdAt: Between(last30, new Date()) } as any,
      });

      const avgScoreRow = await this.leadRepository
        .createQueryBuilder('lead')
        .select('AVG(lead.score)', 'avg')
        .getRawOne();

      return {
        total,
        open,
        qualified,
        converted,
        createdLast30,
        avgScore: Number(avgScoreRow?.avg || 0),
      };
    } catch (error) {
      this.logger.error('Error fetching lead stats:', error);
      throw error;
    }
  }
}
