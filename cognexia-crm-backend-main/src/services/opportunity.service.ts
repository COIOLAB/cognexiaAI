import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../entities/opportunity.entity';
import { CreateOpportunityDto } from '../dto/opportunity.dto';
import { UpdateOpportunityDto } from '../dto/opportunity.dto';
import { PaginationDto } from '../dto';

@Injectable()
export class OpportunityService {
  private readonly logger = new Logger(OpportunityService.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
  ) {}

  async create(createOpportunityDto: CreateOpportunityDto): Promise<Opportunity> {
    try {
      this.logger.log(`Creating opportunity: ${createOpportunityDto.name}`);
      
      const opportunity = this.opportunityRepository.create(createOpportunityDto as any);
      const savedOpportunity = await this.opportunityRepository.save(opportunity) as unknown as Opportunity;
      this.logger.log(`Opportunity created successfully: ${savedOpportunity.id}`);
      return savedOpportunity;
    } catch (error) {
      this.logger.error('Error creating opportunity:', error);
      throw new Error(`Failed to create opportunity: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Opportunity[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [opportunities, total] = await this.opportunityRepository.findAndCount({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: ['customer', 'assignedTo', 'activities', 'products'],
      });

      return {
        data: opportunities,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Error fetching opportunities:', error);
      throw new Error(`Failed to fetch opportunities: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findOne(id: string): Promise<Opportunity> {
    try {
      this.logger.log(`Retrieving opportunity: ${id}`);
      
      const opportunity = await this.opportunityRepository.findOne({
        where: { id },
        relations: [
          'customer', 
          'assignedTo', 
          'activities', 
          'products', 
          'quotes',
          'lead'
        ],
      });

      if (!opportunity) {
        throw new NotFoundException('Opportunity not found');
      }

      return opportunity;
    } catch (error) {
      this.logger.error(`Error fetching opportunity ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch opportunity: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async update(id: string, updateOpportunityDto: UpdateOpportunityDto): Promise<Opportunity> {
    try {
      this.logger.log(`Updating opportunity: ${id}`);
      
      const opportunity = await this.findOne(id);
      Object.assign(opportunity, updateOpportunityDto);
      
      const updatedOpportunity = await this.opportunityRepository.save(opportunity);
      
      this.logger.log(`Opportunity updated successfully: ${id}`);
      return updatedOpportunity;
    } catch (error) {
      this.logger.error(`Error updating opportunity ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update opportunity: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting opportunity: ${id}`);
      
      const opportunity = await this.findOne(id);
      await this.opportunityRepository.remove(opportunity);
      
      this.logger.log(`Opportunity deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting opportunity ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete opportunity: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findByStage(stage: string): Promise<Opportunity[]> {
    try {
      return await this.opportunityRepository.find({
        where: { stage: stage as any },
        relations: ['customer', 'assignedTo'],
        order: { expectedCloseDate: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error finding opportunities by stage ${stage}:`, error);
      throw new Error(`Failed to find opportunities by stage: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async findByCustomer(customerId: string): Promise<Opportunity[]> {
    try {
      return await this.opportunityRepository.find({
        where: { customer: { id: customerId } },
        relations: ['assignedTo', 'products'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error finding opportunities by customer ${customerId}:`, error);
      throw new Error(`Failed to find opportunities by customer: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async updateStage(id: string, stage: string): Promise<Opportunity> {
    try {
      const opportunity = await this.findOne(id);
      opportunity.stage = stage as any;
      
      // Update probability based on stage
      const stageProbabilities = {
        'QUALIFICATION': 10,
        'NEEDS_ANALYSIS': 25,
        'PROPOSAL': 50,
        'NEGOTIATION': 75,
        'CLOSED_WON': 100,
        'CLOSED_LOST': 0,
      };
      
      opportunity.probability = stageProbabilities[stage] || opportunity.probability;
      
      if (stage === 'CLOSED_WON') {
        opportunity.actualCloseDate = new Date();
        (opportunity as any).status = 'WON';
      } else if (stage === 'CLOSED_LOST') {
        opportunity.actualCloseDate = new Date();
        (opportunity as any).status = 'LOST';
      }
      
      const updatedOpportunity = await this.opportunityRepository.save(opportunity);
      this.logger.log(`Opportunity stage updated: ${id} - Stage: ${stage}`);
      
      return updatedOpportunity;
    } catch (error) {
      this.logger.error(`Error updating opportunity stage ${id}:`, error);
      throw new Error(`Failed to update opportunity stage: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async updateValue(id: string, value: number): Promise<Opportunity> {
    try {
      const opportunity = await this.findOne(id);
      opportunity.value = value;
      
      const updatedOpportunity = await this.opportunityRepository.save(opportunity);
      this.logger.log(`Opportunity value updated: ${id} - Value: ${value}`);
      
      return updatedOpportunity;
    } catch (error) {
      this.logger.error(`Error updating opportunity value ${id}:`, error);
      throw new Error(`Failed to update opportunity value: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async getOpportunitiesByValue(minValue: number): Promise<Opportunity[]> {
    try {
      return await this.opportunityRepository
        .createQueryBuilder('opportunity')
        .where('opportunity.value >= :minValue', { minValue })
        .leftJoinAndSelect('opportunity.customer', 'customer')
        .leftJoinAndSelect('opportunity.assignedTo', 'assignedTo')
        .orderBy('opportunity.value', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error('Error fetching high value opportunities:', error);
      throw new Error(`Failed to fetch high value opportunities: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async getForecast(startDate: Date, endDate: Date): Promise<{
    totalValue: number;
    weightedValue: number;
    count: number;
    byStage: Record<string, { count: number; value: number }>;
  }> {
    try {
      const opportunities = await this.opportunityRepository
        .createQueryBuilder('opportunity')
        .where('opportunity.expectedCloseDate >= :startDate', { startDate })
        .andWhere('opportunity.expectedCloseDate <= :endDate', { endDate })
        .andWhere('opportunity.status NOT IN (:...closedStatuses)', { 
          closedStatuses: ['WON', 'LOST'] 
        })
        .getMany();

      const forecast = opportunities.reduce(
        (acc, opp) => {
          acc.totalValue += opp.value;
          acc.weightedValue += opp.value * (opp.probability / 100);
          acc.count += 1;
          
          if (!acc.byStage[opp.stage]) {
            acc.byStage[opp.stage] = { count: 0, value: 0 };
          }
          acc.byStage[opp.stage].count += 1;
          acc.byStage[opp.stage].value += opp.value;
          
          return acc;
        },
        {
          totalValue: 0,
          weightedValue: 0,
          count: 0,
          byStage: {},
        }
      );

      return forecast;
    } catch (error) {
      this.logger.error('Error generating forecast:', error);
      throw new Error(`Failed to generate forecast: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  async getWinLossAnalysis(period: { start: Date; end: Date }): Promise<{
    totalOpportunities: number;
    won: { count: number; value: number };
    lost: { count: number; value: number };
    winRate: number;
  }> {
    try {
      const opportunities = await this.opportunityRepository
        .createQueryBuilder('opportunity')
        .where('opportunity.actualCloseDate >= :startDate', { startDate: period.start })
        .andWhere('opportunity.actualCloseDate <= :endDate', { endDate: period.end })
        .andWhere('opportunity.status IN (:...statuses)', { statuses: ['WON', 'LOST'] })
        .getMany();

      const analysis = opportunities.reduce(
        (acc, opp) => {
          acc.totalOpportunities += 1;
          
          if ((opp as any).status === 'WON') {
            acc.won.count += 1;
            acc.won.value += opp.value;
          } else if ((opp as any).status === 'LOST') {
            acc.lost.count += 1;
            acc.lost.value += opp.value;
          }
          
          return acc;
        },
        {
          totalOpportunities: 0,
          won: { count: 0, value: 0 },
          lost: { count: 0, value: 0 },
          winRate: 0,
        }
      );

      analysis.winRate = analysis.totalOpportunities > 0 
        ? (analysis.won.count / analysis.totalOpportunities) * 100 
        : 0;

      return analysis;
    } catch (error) {
      this.logger.error('Error generating win/loss analysis:', error);
      throw new Error(`Failed to generate win/loss analysis: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }
}
