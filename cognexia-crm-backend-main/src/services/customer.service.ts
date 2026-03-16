import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { Contact } from '../entities/contact.entity';
import { CustomerInteraction, InteractionType } from '../entities/customer-interaction.entity';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(CustomerInteraction)
    private interactionRepository: Repository<CustomerInteraction>,
  ) {}

  async findAllContacts(customerId: string) {
    try {
      return await this.contactRepository.find({
        where: { customerId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error finding contacts for customer ${customerId}:`, error);
      throw error;
    }
  }

  async createContact(contactData: any, createdBy: string) {
    try {
      let organizationId = contactData.organizationId;
      let customerId = contactData.customerId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (customerId && !uuidRegex.test(customerId)) {
        const customerByCode = await this.customerRepository.findOne({ where: { customerCode: customerId } });
        if (customerByCode) {
          customerId = customerByCode.id;
          if (!organizationId) organizationId = customerByCode.organizationId;
        }
      }
      if (!organizationId && customerId) {
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        organizationId = customer?.organizationId;
      }
      const contactEntity = this.contactRepository.create({
        ...contactData,
        customerId,
        organizationId,
        createdBy: createdBy,
        updatedBy: createdBy,
      }) as unknown as Contact;

      // Update full name
      contactEntity.updateFullName();

      const savedContact = await this.contactRepository.save(contactEntity) as unknown as Contact;
      this.logger.log(`Contact created: ${savedContact.id}`);
      
      return savedContact;
    } catch (error) {
      this.logger.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(id: string, updateData: any, updatedBy: string) {
    try {
      const contact = await this.contactRepository.findOne({ where: { id } });
      
      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      Object.assign(contact, updateData, { updatedBy });
      contact.updateFullName();
      contact.updateEngagementScore();

      return await this.contactRepository.save(contact);
    } catch (error) {
      this.logger.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  }

  async createInteraction(interactionData: any, createdBy: string) {
    try {
      const interactionEntity = this.interactionRepository.create({
        ...interactionData,
        createdBy: createdBy,
        updatedBy: createdBy,
      });
      
      if (Array.isArray(interactionEntity)) {
        throw new Error('Failed to create interaction entity');
      }
      const savedInteraction = await this.interactionRepository.save(interactionEntity) as unknown as CustomerInteraction;
      
      // Update customer interaction metrics
      await this.updateCustomerInteractionMetrics(savedInteraction.customerId);
      
      // Update contact metrics if contact is specified
      if (savedInteraction.contactId) {
        await this.updateContactInteractionMetrics(savedInteraction.contactId);
      }

      this.logger.log(`Customer interaction created: ${savedInteraction.id}`);
      return savedInteraction;
    } catch (error) {
      this.logger.error('Error creating customer interaction:', error);
      throw error;
    }
  }

  async getCustomerHealth(customerId: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: customerId },
        relations: ['interactions', 'contacts', 'opportunities'],
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }

      const healthScore = customer.getHealthScore();
      const churnRisk = customer.getChurnRisk();
      const daysSinceLastInteraction = customer.getDaysSinceLastInteraction();

      return {
        customerId,
        healthScore,
        churnRisk,
        daysSinceLastInteraction,
        isHighValue: customer.isHighValue(),
        lifetimeValue: customer.calculateLifetimeValue(),
        recommendations: this.getCustomerRecommendations(customer),
        alerts: this.getCustomerAlerts(customer),
      };
    } catch (error) {
      this.logger.error(`Error getting customer health ${customerId}:`, error);
      throw error;
    }
  }

  async segmentCustomers(criteria: any) {
    try {
      const queryBuilder = this.customerRepository.createQueryBuilder('customer');

      // Apply segmentation criteria
      if (criteria.industry) {
        queryBuilder.andWhere('customer.industry = :industry', { industry: criteria.industry });
      }

      if (criteria.customerType) {
        queryBuilder.andWhere('customer.customerType = :customerType', { customerType: criteria.customerType });
      }

      if (criteria.minRevenue) {
        queryBuilder.andWhere("CAST(customer.salesMetrics->>'totalRevenue' AS DECIMAL) >= :minRevenue", { 
          minRevenue: criteria.minRevenue 
        });
      }

      if (criteria.region) {
        queryBuilder.andWhere("customer.address->>'region' = :region", { region: criteria.region });
      }

      const customers = await queryBuilder.getMany();
      
      return {
        criteria,
        customerCount: customers.length,
        customers: customers.slice(0, 100), // Limit for performance
        segmentValue: customers.reduce((sum, c) => sum + c.calculateLifetimeValue(), 0),
      };
    } catch (error) {
      this.logger.error('Error segmenting customers:', error);
      throw error;
    }
  }

  async getCustomerTimeline(customerId: string) {
    try {
      const interactions = await this.interactionRepository.find({
        where: { customerId },
        order: { date: 'DESC' },
        take: 100,
        relations: ['contact'],
      });

      const timeline = interactions.map(interaction => ({
        id: interaction.id,
        type: interaction.type,
        date: interaction.date,
        subject: interaction.subject,
        description: interaction.description,
        outcome: interaction.outcome,
        contact: interaction.contact ? {
          name: interaction.contact.fullName,
          title: interaction.contact.title,
        } : null,
        createdBy: interaction.createdBy,
      }));

      return {
        customerId,
        timeline,
        totalEvents: interactions.length,
      };
    } catch (error) {
      this.logger.error(`Error getting customer timeline ${customerId}:`, error);
      throw error;
    }
  }

  private async updateCustomerInteractionMetrics(customerId: string) {
    try {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      const interactions = await this.interactionRepository.find({ where: { customerId } });

      if (customer && interactions.length > 0) {
        const lastInteraction = interactions.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        
        customer.relationshipMetrics.lastInteractionDate = lastInteraction.date.toISOString();
        
        await this.customerRepository.save(customer);
      }
    } catch (error) {
      this.logger.error(`Error updating customer interaction metrics ${customerId}:`, error);
    }
  }

  private async updateContactInteractionMetrics(contactId: string) {
    try {
      const contact = await this.contactRepository.findOne({ where: { id: contactId } });
      const interactions = await this.interactionRepository.find({ where: { contactId } });

      if (contact && interactions.length > 0) {
        const lastInteraction = interactions.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        
        contact.lastInteractionDate = lastInteraction.date;
        contact.totalInteractions = interactions.length;
        contact.updateEngagementScore();
        
        await this.contactRepository.save(contact);
      }
    } catch (error) {
      this.logger.error(`Error updating contact interaction metrics ${contactId}:`, error);
    }
  }

  private getCustomerRecommendations(customer: Customer): string[] {
    const recommendations: string[] = [];

    if (customer.getDaysSinceLastInteraction() > 30) {
      recommendations.push('Schedule regular check-in');
    }

    if (customer.isHighValue() && customer.getChurnRisk() !== 'low') {
      recommendations.push('Assign dedicated account manager');
    }

    if (customer.segmentation.upsellProbability && customer.segmentation.upsellProbability > 70) {
      recommendations.push('Present upselling opportunities');
    }

    if (customer.relationshipMetrics.satisfactionScore < 7) {
      recommendations.push('Conduct satisfaction survey');
    }

    return recommendations;
  }

  private getCustomerAlerts(customer: Customer): string[] {
    const alerts: string[] = [];

    if (customer.getChurnRisk() === 'high' || customer.getChurnRisk() === 'critical') {
      alerts.push('High churn risk detected');
    }

    if (customer.salesMetrics.outstandingBalance && customer.salesMetrics.creditLimit &&
        customer.salesMetrics.outstandingBalance > customer.salesMetrics.creditLimit * 0.8) {
      alerts.push('Approaching credit limit');
    }

    if (customer.getDaysSinceLastInteraction() > 90) {
      alerts.push('No recent interactions');
    }

    return alerts;
  }

  async createCustomer(createCustomerDto: any, createdBy: string) {
    try {
      const customerCode = createCustomerDto.customerCode || await this.generateCustomerCode();
      const nowIso = new Date().toISOString();
      const preferences = createCustomerDto.preferences ?? {
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        communicationChannels: ['email'],
        marketingOptIn: true,
        newsletterOptIn: false,
        eventInvitations: false,
        privacySettings: {
          dataSharing: false,
          analytics: true,
          marketing: true,
        },
      };
      const salesMetrics = createCustomerDto.salesMetrics ?? {
        totalRevenue: 0,
        averageOrderValue: 0,
        paymentTerms: 'NET30',
        outstandingBalance: 0,
      };
      const relationshipMetrics = createCustomerDto.relationshipMetrics ?? {
        customerSince: nowIso,
        loyaltyScore: 5,
        satisfactionScore: 5,
        npsScore: 0,
        interactionFrequency: 'weekly',
      };
      const segmentation = createCustomerDto.segmentation ?? {
        segment: 'prospect',
        tier: 'bronze',
        riskLevel: 'medium',
        growthPotential: 'medium',
      };
      const demographics = createCustomerDto.demographics ?? {};
      const tags = Array.isArray(createCustomerDto.tags) ? createCustomerDto.tags : [];

      const customer = this.customerRepository.create({
        ...createCustomerDto,
        customerCode,
        demographics,
        preferences,
        salesMetrics,
        relationshipMetrics,
        segmentation,
        tags,
        status: CustomerStatus.ACTIVE,
        createdBy,
        updatedBy: createdBy
      });
      return await this.customerRepository.save(customer);
    } catch (error) {
      this.logger.error('Error creating customer:', error);
      throw error;
    }
  }

  private async generateCustomerCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.customerRepository.count();
    return `C-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async findAll(params: { page?: number; limit?: number; search?: string; organizationId?: string }) {
    try {
      const { page = 1, limit = 10, search, organizationId } = params;
      const query = this.customerRepository.createQueryBuilder('customer');

      if (organizationId) {
        query.andWhere('customer.organizationId = :organizationId', { organizationId });
      }
      
      if (search) {
        query.andWhere('customer.companyName ILIKE :search OR customer.customerCode ILIKE :search', {
          search: `%${search}%`
        });
      }
      
      const [data, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      
      return { data: data || [], total: total || 0, page, limit };
    } catch (error) {
      this.logger.error('Error finding customers:', error);
      const { page = 1, limit = 10 } = params;
      return { data: [], total: 0, page, limit };
    }
  }

  async findById(customerId: string) {
    try {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) {
        return null;
      }
      return customer;
    } catch (error) {
      this.logger.error(`Error finding customer ${customerId}:`, error);
      return null;
    }
  }

  async updateCustomer(customerId: string, updateCustomerDto: any, updatedBy: string) {
    try {
      const customer = await this.findById(customerId);
      Object.assign(customer, updateCustomerDto, { updatedBy });
      return await this.customerRepository.save(customer);
    } catch (error) {
      this.logger.error(`Error updating customer ${customerId}:`, error);
      throw error;
    }
  }

  async deleteCustomer(customerId: string, deletedBy: string) {
    try {
      const customer = await this.findById(customerId);
      customer.status = CustomerStatus.INACTIVE;
      customer.updatedBy = deletedBy;
      await this.customerRepository.save(customer);
      return { success: true, message: 'Customer deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting customer ${customerId}:`, error);
      throw error;
    }
  }

  async bulkCreateCustomers(customers: any[], createdBy: string) {
    try {
      const customerEntities = customers.map(dto => ({
        ...dto,
        status: CustomerStatus.ACTIVE,
        createdBy,
        updatedBy: createdBy
      }));
      const saved = await this.customerRepository.save(customerEntities);
      return {
        success: true,
        data: saved,
        count: saved.length,
        message: `${saved.length} customers created successfully`
      };
    } catch (error) {
      this.logger.error('Error bulk creating customers:', error);
      throw error;
    }
  }

  async searchCustomers(searchCriteria: any) {
    try {
      const query = this.customerRepository.createQueryBuilder('customer');
      
      if (searchCriteria.name) {
        query.andWhere('customer.name ILIKE :name', { name: `%${searchCriteria.name}%` });
      }
      if (searchCriteria.email) {
        query.andWhere('customer.email ILIKE :email', { email: `%${searchCriteria.email}%` });
      }
      if (searchCriteria.status) {
        query.andWhere('customer.status = :status', { status: searchCriteria.status });
      }
      
      const results = await query.getMany();
      return { success: true, data: results || [], count: (results || []).length };
    } catch (error) {
      this.logger.error('Error searching customers:', error);
      return { success: true, data: [], count: 0 };
    }
  }

  async getCustomerActivities(customerId: string) {
    try {
      const interactions = await this.interactionRepository.find({
        where: { customerId },
        order: { date: 'DESC' },
        take: 50
      });
      return {
        success: true,
        data: interactions || [],
        count: (interactions || []).length
      };
    } catch (error) {
      this.logger.error(`Error getting customer activities ${customerId}:`, error);
      return {
        success: true,
        data: [],
        count: 0
      };
    }
  }
}
