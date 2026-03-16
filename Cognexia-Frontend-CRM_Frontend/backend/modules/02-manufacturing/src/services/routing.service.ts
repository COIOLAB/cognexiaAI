import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routing } from '../entities/Routing';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(
    @InjectRepository(Routing)
    private readonly routingRepository: Repository<Routing>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Routing Service initialized');
  }

  async create(routingData: Partial<Routing>): Promise<Routing> {
    const routing = this.routingRepository.create(routingData);
    const saved = await this.routingRepository.save(routing);
    this.eventEmitter.emit('routing.created', saved);
    return saved;
  }

  async findAll(): Promise<Routing[]> {
    return this.routingRepository.find({ relations: ['operations'] });
  }

  async findOne(id: string): Promise<Routing | null> {
    return this.routingRepository.findOne({ where: { id }, relations: ['operations'] });
  }
}
