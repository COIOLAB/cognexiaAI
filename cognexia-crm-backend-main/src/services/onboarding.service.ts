import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationStatus, SubscriptionStatus } from '../entities/organization.entity';
import { User, UserType } from '../entities/user.entity';
import { OrganizationService } from './organization.service';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private organizationService: OrganizationService,
  ) {}

  async getOnboardingProgress() {
    const [organizations, total] = await this.organizationRepository.findAndCount({
      where: { isActive: true },
    });
    const activeCount = organizations.filter(o => o.status === OrganizationStatus.ACTIVE).length;
    const trialCount = organizations.filter(o => o.status === OrganizationStatus.TRIAL).length;
    
    return {
      totalOrganizations: total,
      completed: activeCount,
      inProgress: trialCount,
      notStarted: Math.max(0, total - activeCount - trialCount),
      avgTimeToComplete: 7.5,
    };
  }

  async getOrganizationsExport() {
    const organizations = await this.organizationRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    // Fetch admin users for each org in one query
    const orgIds = organizations.map(o => o.id);
    let adminUsers: any[] = [];
    if (orgIds.length > 0) {
      adminUsers = await this.userRepository
        .createQueryBuilder('u')
        .select(['u.organizationId', 'u.firstName', 'u.lastName'])
        .where('u.organizationId IN (:...ids)', { ids: orgIds })
        .andWhere('u.userType = :type', { type: UserType.ORG_ADMIN })
        .getMany();
    }

    const adminMap = new Map<string, { firstName: string; lastName: string }>();
    for (const u of adminUsers) {
      if (!adminMap.has(u.organizationId)) {
        adminMap.set(u.organizationId, { firstName: u.firstName, lastName: u.lastName });
      }
    }

    return organizations.map(org => {
      const admin = adminMap.get(org.id);
      return {
        name: org.name || '',
        email: org.email || '',
        adminFirstName: admin?.firstName || '',
        adminLastName: admin?.lastName || '',
        phone: org.phone || '',
        address: org.address || '',
        website: org.website || '',
      };
    });
  }

  async bulkImportOrganizations(data: any[]) {
    if (!Array.isArray(data) || data.length === 0) {
      return { success: true, imported: 0, failed: 0, errors: [] };
    }

    const errors: { row: number; error: string }[] = [];
    let imported = 0;

    const crypto = require('crypto');
    const systemUser = {
      id: 'system-onboarding',
      email: 'onboarding@system',
      userType: 'super_admin',
      firstName: 'System',
      lastName: 'Onboarding',
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const name = row.name || row.organizationName || row.company;
        const email = (row.email || row.adminEmail || row.contactEmail || '').toString().trim();
        if (!name || !email) {
          errors.push({ row: i + 1, error: 'Name and email required' });
          continue;
        }

        const existing = await this.organizationRepository.findOne({
          where: { email: email.toLowerCase() },
        });
        if (existing) {
          errors.push({ row: i + 1, error: 'Organization with this email already exists' });
          continue;
        }

        // Generate temp password - admin must reset on first login
        const tempPassword = row.adminPassword || crypto.randomBytes(8).toString('hex');

        await this.organizationService.create(
          {
            name: name.toString().trim(),
            email: email.toLowerCase(),
            adminEmail: email.toLowerCase(),
            adminFirstName: (row.adminFirstName || row.firstName || 'Admin').toString(),
            adminLastName: (row.adminLastName || row.lastName || 'User').toString(),
            adminPassword: tempPassword,
            contactPersonName: row.contactPersonName || name,
            contactPersonEmail: email.toLowerCase(),
            phone: row.phone,
            address: row.address,
            website: row.website,
          },
          systemUser as any
        );
        imported++;
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message || 'Import failed' });
      }
    }

    return {
      success: true,
      imported,
      failed: errors.length,
      errors,
    };
  }

  async migrateFromPlatform(platform: string, credentials: any) {
    return {
      platform,
      status: 'pending',
      message: 'Migration requires platform-specific integration. Connect Salesforce, HubSpot, or Zoho via Data Migration (/migration) for full migration.',
      startedAt: new Date(),
    };
  }
}
