import { Injectable } from '@nestjs/common';

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  technician: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cost?: number;
  notes?: string;
}

export interface EquipmentStatus {
  equipmentId: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN' | 'IDLE';
  lastMaintenance: Date;
  nextMaintenance: Date;
  efficiency: number;
  uptime: number;
}

@Injectable()
export class EquipmentMaintenanceService {
  /**
   * Schedule maintenance for equipment
   */
  async scheduleMaintenance(
    equipmentId: string,
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY',
    description: string,
    scheduledDate: Date,
    technician: string
  ): Promise<MaintenanceRecord> {
    return {
      id: `MAINT-${Date.now()}`,
      equipmentId,
      type,
      description,
      scheduledDate,
      technician,
      status: 'SCHEDULED',
      notes: 'Maintenance scheduled successfully'
    };
  }

  /**
   * Get equipment status
   */
  async getEquipmentStatus(equipmentId: string): Promise<EquipmentStatus> {
    const now = new Date();
    const lastMaintenance = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const nextMaintenance = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

    return {
      equipmentId,
      status: 'OPERATIONAL',
      lastMaintenance,
      nextMaintenance,
      efficiency: 85.5,
      uptime: 92.3
    };
  }

  /**
   * Complete maintenance task
   */
  async completeMaintenance(
    maintenanceId: string,
    cost?: number,
    notes?: string
  ): Promise<MaintenanceRecord> {
    return {
      id: maintenanceId,
      equipmentId: 'EQ-001',
      type: 'PREVENTIVE',
      description: 'Routine maintenance completed',
      scheduledDate: new Date(),
      completedDate: new Date(),
      technician: 'Tech-001',
      status: 'COMPLETED',
      cost,
      notes
    };
  }

  /**
   * Get maintenance history
   */
  async getMaintenanceHistory(
    equipmentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MaintenanceRecord[]> {
    // Simulate maintenance history
    return [
      {
        id: 'MAINT-001',
        equipmentId,
        type: 'PREVENTIVE',
        description: 'Oil change and filter replacement',
        scheduledDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-15'),
        technician: 'Tech-001',
        status: 'COMPLETED',
        cost: 250.00,
        notes: 'All systems functioning normally'
      }
    ];
  }

  /**
   * Get upcoming maintenance schedule
   */
  async getUpcomingMaintenance(days: number = 30): Promise<MaintenanceRecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return [
      {
        id: 'MAINT-002',
        equipmentId: 'EQ-001',
        type: 'PREVENTIVE',
        description: 'Quarterly inspection',
        scheduledDate: futureDate,
        technician: 'Tech-002',
        status: 'SCHEDULED'
      }
    ];
  }

  /**
   * Calculate equipment downtime
   */
  async calculateDowntime(
    equipmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalDowntime: number; // in hours
    plannedDowntime: number;
    unplannedDowntime: number;
    availability: number; // percentage
  }> {
    return {
      totalDowntime: 24,
      plannedDowntime: 16,
      unplannedDowntime: 8,
      availability: 95.5
    };
  }
}