import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
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

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Lead[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [leads, total] = await this.leadRepository.findAndCount({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: ['source', 'assignedTo', 'activities'],
      });

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
        relations: ['source', 'assignedTo', 'activities', 'opportunities'],
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
        relations: ['source', 'assignedTo'],
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
        relations: ['source', 'assignedTo'],
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
}
