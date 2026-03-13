import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KPIGoal, GoalPeriod } from '../entities/kpi-goal.entity';

@Injectable()
export class KPITrackingService {
  constructor(
    @InjectRepository(KPIGoal)
    private goalRepository: Repository<KPIGoal>,
  ) {}

  async getAllGoals() {
    return this.goalRepository.find({ where: { isActive: true }, order: { startDate: 'DESC' } });
  }

  async createGoal(data: {
    name: string;
    description?: string;
    targetValue: number;
    period: GoalPeriod;
    unit: string;
    startDate: Date;
    endDate: Date;
  }) {
    const goal = this.goalRepository.create(data as any);
    return this.goalRepository.save(goal);
  }

  async updateGoalProgress(id: string, currentValue: number) {
    await this.goalRepository.update({ id }, { currentValue });
    return this.goalRepository.findOne({ where: { id } });
  }

  async getGoalProgress() {
    const goals = await this.goalRepository.find({ where: { isActive: true } });
    
    return goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      progress: (Number(goal.currentValue) / Number(goal.targetValue)) * 100,
      current: Number(goal.currentValue),
      target: Number(goal.targetValue),
      unit: goal.unit,
      status: Number(goal.currentValue) >= Number(goal.targetValue) ? 'achieved' : 'in-progress',
    }));
  }
}
