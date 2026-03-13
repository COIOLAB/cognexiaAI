import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Contract, ContractStatus, RenewalType } from '../entities/contract.entity';
import { ContractRenewal } from '../entities/contract-renewal.entity';
import { ContractAmendment } from '../entities/contract-amendment.entity';
import { ContractApproval } from '../entities/contract-approval.entity';
import { ContractTemplate } from '../entities/contract-template.entity';
import { CreateContractDto, UpdateContractDto, RenewContractDto } from '../dto/document.dto';
import { EmailSenderService } from './email-sender.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(ContractRenewal)
    private contractRenewalRepository: Repository<ContractRenewal>,
    @InjectRepository(ContractAmendment)
    private contractAmendmentRepository: Repository<ContractAmendment>,
    @InjectRepository(ContractApproval)
    private contractApprovalRepository: Repository<ContractApproval>,
    @InjectRepository(ContractTemplate)
    private contractTemplateRepository: Repository<ContractTemplate>,
    private emailSenderService: EmailSenderService,
  ) {}

  async createContract(
    tenantId: string,
    userId: string,
    dto: CreateContractDto,
  ): Promise<Contract> {
    const contractNumber = await this.generateContractNumber(tenantId);

    const contract = this.contractRepository.create({
      ...dto,
      tenantId,
      ownerId: userId,
      contractNumber,
    });

    return this.contractRepository.save(contract);
  }

  private async generateContractNumber(tenantId: string): Promise<string> {
    const count = await this.contractRepository.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    return `CTR-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }

  async findAll(tenantId: string): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { tenantId },
      relations: ['customer', 'document', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTemplates(tenantId: string): Promise<ContractTemplate[]> {
    return this.contractTemplateRepository.find({
      where: { organizationId: tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id, tenantId },
      relations: ['customer', 'document', 'owner', 'approvedBy'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async updateContract(
    id: string,
    tenantId: string,
    dto: UpdateContractDto,
  ): Promise<Contract> {
    try {
      const contract = await this.findOne(id, tenantId);
      if (!contract) {
        return null;
      }
      Object.assign(contract, dto);
      return this.contractRepository.save(contract);
    } catch (error) {
      console.error('Error updating contract:', error.message);
      return null;
    }
  }

  async deleteContract(id: string, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    await this.contractRenewalRepository.delete({ contractId: id });
    await this.contractAmendmentRepository.delete({ contractId: id });
    await this.contractApprovalRepository.delete({ contractId: id });
    await this.contractRepository.remove(contract);
  }

  async approveContract(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<Contract> {
    try {
      const contract = await this.findOne(id, tenantId);
      if (!contract) {
        return null;
      }

      contract.status = ContractStatus.APPROVED;
      contract.approvedById = userId;
      contract.approvedAt = new Date();

      return this.contractRepository.save(contract);
    } catch (error) {
      console.error('Error approving contract:', error.message);
      return null;
    }
  }

  async activateContract(id: string, tenantId: string): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    contract.status = ContractStatus.ACTIVE;
    contract.activationDate = new Date();

    return this.contractRepository.save(contract);
  }

  async terminateContract(
    id: string,
    tenantId: string,
    reason?: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    contract.status = ContractStatus.TERMINATED;
    contract.terminationDate = new Date();

    if (reason) {
      contract.notes = `${contract.notes || ''}\n\nTermination Reason: ${reason}`;
    }

    return this.contractRepository.save(contract);
  }

  async renewContract(
    id: string,
    tenantId: string,
    userId: string,
    dto: RenewContractDto,
  ): Promise<Contract> {
    try {
      const oldContract = await this.findOne(id, tenantId);
      if (!oldContract) {
        return null;
      }

    // Mark old contract as renewed
    oldContract.status = ContractStatus.RENEWED;
    await this.contractRepository.save(oldContract);

    // Create new contract
    const newStartDate = dto.newStartDate
      ? new Date(dto.newStartDate)
      : new Date(oldContract.endDate);
    newStartDate.setDate(newStartDate.getDate() + 1);

    const termMonths = oldContract.renewalTermMonths || 12;
    const newEndDate = dto.newEndDate
      ? new Date(dto.newEndDate)
      : new Date(newStartDate);
    if (!dto.newEndDate) {
      newEndDate.setMonth(newEndDate.getMonth() + termMonths);
    }

    const newContract = this.contractRepository.create({
      name: oldContract.name,
      contractType: oldContract.contractType,
      tenantId,
      ownerId: userId,
      customerId: oldContract.customerId,
      value: dto.newValue || oldContract.value,
      currency: oldContract.currency,
      billingFrequency: oldContract.billingFrequency,
      recurringAmount: dto.newRecurringAmount || oldContract.recurringAmount,
      startDate: newStartDate,
      endDate: newEndDate,
      renewalType: oldContract.renewalType,
      renewalNoticeDays: oldContract.renewalNoticeDays,
      renewalTermMonths: oldContract.renewalTermMonths,
      terms: oldContract.terms,
      notes: `Renewed from contract ${oldContract.contractNumber}\n${dto.notes || ''}`,
      metadata: {
        ...oldContract.metadata,
        previousContractId: oldContract.id,
      },
      contractNumber: await this.generateContractNumber(tenantId),
    });

      return this.contractRepository.save(newContract);
    } catch (error) {
      console.error('Error renewing contract:', error.message);
      return null;
    }
  }

  async getExpiringContracts(
    tenantId: string,
    daysAhead: number = 30,
  ): Promise<Contract[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.tenantId = :tenantId', { tenantId })
      .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.endDate BETWEEN :today AND :futureDate', {
        today,
        futureDate,
      })
      .orderBy('contract.endDate', 'ASC')
      .getMany();
  }

  async getContractsByCustomer(
    customerId: string,
    tenantId: string,
  ): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { customerId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getContractMetrics(tenantId: string): Promise<any> {
    const total = await this.contractRepository.count({ where: { tenantId } });
    const active = await this.contractRepository.count({
      where: { tenantId, status: ContractStatus.ACTIVE },
    });

    const valueResult = await this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.tenantId = :tenantId', { tenantId })
      .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
      .select('SUM(contract.value)', 'total')
      .addSelect('SUM(contract.recurringAmount)', 'recurring')
      .getRawOne();

    const expiringSoon = await this.getExpiringContracts(tenantId, 30);

    return {
      totalContracts: total,
      activeContracts: active,
      totalValue: parseFloat(valueResult?.total || '0'),
      totalRecurringRevenue: parseFloat(valueResult?.recurring || '0'),
      expiringIn30Days: expiringSoon.length,
    };
  }

  // Cron job to check expiring contracts and send renewal reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringContracts(): Promise<void> {
    const contracts = await this.contractRepository.find({
      where: {
        status: ContractStatus.ACTIVE,
        renewalReminderSent: false,
      },
      relations: ['owner', 'customer'],
    });

    for (const contract of contracts) {
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (contract.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= contract.renewalNoticeDays) {
        await this.sendRenewalReminder(contract);
        await this.contractRepository.update(contract.id, {
          renewalReminderSent: true,
        });
      }
    }
  }

  private async sendRenewalReminder(contract: Contract): Promise<void> {
    if (!contract.owner) return;

    await this.emailSenderService.sendEmail(
      contract.tenantId,
      contract.owner.email,
      `Contract Renewal Reminder: ${contract.name}`,
      `
        <h2>Contract Renewal Reminder</h2>
        <p>The following contract is approaching its end date:</p>
        <ul>
          <li><strong>Contract:</strong> ${contract.name}</li>
          <li><strong>Contract Number:</strong> ${contract.contractNumber}</li>
          <li><strong>End Date:</strong> ${contract.endDate.toLocaleDateString()}</li>
          <li><strong>Value:</strong> ${contract.currency} ${contract.value}</li>
        </ul>
        <p>Please review and take action as needed.</p>
      `,
    );
  }

  // Cron job to automatically expire contracts
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireContracts(): Promise<void> {
    const today = new Date();
    await this.contractRepository
      .createQueryBuilder()
      .update(Contract)
      .set({ status: ContractStatus.EXPIRED })
      .where('endDate < :today', { today })
      .andWhere('status = :status', { status: ContractStatus.ACTIVE })
      .execute();
  }
}
