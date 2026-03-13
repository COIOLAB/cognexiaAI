import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DigitalTwin } from './entities/digital-twin.entity';
import { DigitalTwinSimulation } from './entities/digital-twin-simulation.entity';
import { DigitalTwinService } from './services/digital-twin.service';
import { DigitalTwinController } from './controllers/digital-twin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalTwin,
      DigitalTwinSimulation,
    ]),
    ScheduleModule.forRoot(), // Enable scheduled tasks
  ],
  controllers: [DigitalTwinController],
  providers: [DigitalTwinService],
  exports: [DigitalTwinService, TypeOrmModule],
})
export class DigitalTwinModule {}
