import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Robotics } from '../entities/Robotics';

@Injectable()
export class RoboticsService {
  private readonly logger = new Logger(RoboticsService.name);

  constructor(
    @InjectRepository(Robotics)
    private readonly roboticsRepository: Repository<Robotics>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Robotics Service initialized');
  }

  async create(robotData: Partial<Robotics>): Promise<Robotics> {
    const robot = this.roboticsRepository.create(robotData);
    const saved = await this.roboticsRepository.save(robot);
    this.eventEmitter.emit('robot.created', saved);
    return saved;
  }

  async findAll(): Promise<Robotics[]> {
    return this.roboticsRepository.find({ order: { id: 'ASC' } });
  }

  async findById(id: string): Promise<Robotics | null> {
    return this.roboticsRepository.findOne({ where: { id } });
  }

  async startRobot(id: string): Promise<Robotics | null> {
    const robot = await this.findById(id);
    if (robot) {
      const updated = await this.roboticsRepository.save(robot);
      this.eventEmitter.emit('robot.started', updated);
      return updated;
    }
    return null;
  }
}
