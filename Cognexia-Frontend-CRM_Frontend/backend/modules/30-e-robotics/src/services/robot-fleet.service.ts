import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotFleet } from '../entities/robot-fleet.entity';
import { RobotTask } from '../entities/robot-task.entity';

@Injectable()
export class RobotFleetService {
  private readonly logger = new Logger(RobotFleetService.name);

  constructor(
    @InjectRepository(RobotFleet)
    private readonly fleetRepository: Repository<RobotFleet>,
    @InjectRepository(RobotTask)
    private readonly taskRepository: Repository<RobotTask>,
  ) {}

  async findAll(filters: {
    facilityId?: string;
    fleetType?: string;
    status?: string;
  }) {
    const query = this.fleetRepository.createQueryBuilder('fleet')
      .leftJoinAndSelect('fleet.robots', 'robots')
      .leftJoinAndSelect('fleet.tasks', 'tasks');

    if (filters.facilityId) {
      query.andWhere('fleet.facilityId = :facilityId', { facilityId: filters.facilityId });
    }

    if (filters.fleetType) {
      query.andWhere('fleet.fleetType = :fleetType', { fleetType: filters.fleetType });
    }

    if (filters.status) {
      query.andWhere('fleet.status = :status', { status: filters.status });
    }

    const [fleets, total] = await query.getManyAndCount();

    return {
      fleets,
      total,
      active: fleets.filter(f => f.status === 'ACTIVE').length,
      inactive: fleets.filter(f => f.status === 'INACTIVE').length,
      maintenance: fleets.filter(f => f.status === 'MAINTENANCE').length,
    };
  }

  async findById(id: string) {
    const fleet = await this.fleetRepository.findOne({
      where: { id },
      relations: ['robots', 'tasks', 'maintenanceHistory'],
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet with ID ${id} not found`);
    }

    return fleet;
  }

  async create(createFleetDto: any) {
    const fleet = this.fleetRepository.create(createFleetDto);
    return await this.fleetRepository.save(fleet);
  }

  async update(id: string, updateFleetDto: any) {
    const fleet = await this.findById(id);
    const updatedFleet = Object.assign(fleet, updateFleetDto);
    return await this.fleetRepository.save(updatedFleet);
  }

  async delete(id: string) {
    const fleet = await this.findById(id);
    await this.fleetRepository.softRemove(fleet);
  }

  async getFleetStatus(id: string) {
    const fleet = await this.findById(id);
    
    // Calculate fleet status metrics
    const totalRobots = fleet.robots.length;
    const activeRobots = fleet.robots.filter(r => r.status === 'ACTIVE').length;
    const chargingRobots = fleet.robots.filter(r => r.status === 'CHARGING').length;
    const maintenanceRobots = fleet.robots.filter(r => r.status === 'MAINTENANCE').length;

    const activeTasks = fleet.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completedTasks = fleet.tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = fleet.tasks.filter(t => t.status === 'PENDING').length;

    return {
      fleetId: fleet.id,
      fleetName: fleet.name,
      status: fleet.status,
      lastUpdate: new Date(),
      metrics: {
        totalRobots,
        activeRobots,
        chargingRobots,
        maintenanceRobots,
        robotUtilization: totalRobots > 0 ? (activeRobots / totalRobots) * 100 : 0,
        activeTasks,
        completedTasks,
        pendingTasks,
      },
      robotStatuses: fleet.robots.map(robot => ({
        robotId: robot.id,
        status: robot.status,
        battery: robot.batteryLevel,
        currentTask: robot.currentTaskId,
        location: robot.location,
        healthScore: robot.healthScore,
      })),
      activeTaskDetails: fleet.tasks
        .filter(t => t.status === 'IN_PROGRESS')
        .map(task => ({
          taskId: task.id,
          type: task.type,
          progress: task.progress,
          assignedRobot: task.assignedRobotId,
          estimatedCompletion: task.estimatedCompletionTime,
        })),
    };
  }

  async assignTask(id: string, taskDto: any) {
    const fleet = await this.findById(id);
    
    // Create new task
    const task = this.taskRepository.create({
      ...taskDto,
      fleetId: fleet.id,
      status: 'PENDING',
      createdAt: new Date(),
    });

    const savedTask = await this.taskRepository.save(task);

    // Update fleet tasks
    fleet.tasks = [...fleet.tasks, savedTask];
    await this.fleetRepository.save(fleet);

    return savedTask;
  }

  async getPerformanceMetrics(id: string, period?: string) {
    const fleet = await this.findById(id);
    const now = new Date();
    let startDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24); // Default to 24h
    }

    // Get completed tasks in the period
    const completedTasks = fleet.tasks.filter(
      t => t.status === 'COMPLETED' && t.completedAt >= startDate && t.completedAt <= now
    );

    // Calculate metrics
    const totalTasks = completedTasks.length;
    const totalTime = completedTasks.reduce(
      (sum, task) => sum + (task.completedAt.getTime() - task.startedAt.getTime()),
      0
    );
    const avgTaskTime = totalTasks > 0 ? totalTime / totalTasks : 0;

    const successfulTasks = completedTasks.filter(t => t.result === 'SUCCESS').length;
    const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0;

    return {
      period: {
        start: startDate,
        end: now,
      },
      metrics: {
        tasksCompleted: totalTasks,
        averageTaskTime: avgTaskTime,
        successRate,
        fleetUtilization: fleet.utilization,
        energyEfficiency: fleet.energyEfficiency,
        collisionIncidents: fleet.collisionIncidents,
        safetyScore: fleet.safetyScore,
      },
      robotPerformance: fleet.robots.map(robot => ({
        robotId: robot.id,
        tasksCompleted: robot.completedTasks,
        uptime: robot.uptime,
        efficiency: robot.efficiency,
        accuracy: robot.accuracy,
      })),
      trends: {
        taskCompletionTrend: this.calculateTrend(completedTasks, 'completion'),
        utilizationTrend: this.calculateTrend(fleet.utilizationHistory, 'utilization'),
        efficiencyTrend: this.calculateTrend(fleet.efficiencyHistory, 'efficiency'),
      },
    };
  }

  private calculateTrend(data: any[], metric: string): string {
    // Implement trend calculation logic
    return 'STABLE';
  }
}
