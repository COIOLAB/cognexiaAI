import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ZeroTrustService } from './zero-trust.service';
import { ZeroTrustController } from './zero-trust.controller';
import { DeviceTrust } from '../auth/entities/device-trust.entity';
import { RiskAssessmentService } from './services/risk-assessment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceTrust]),
    ConfigModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [ZeroTrustController],
  providers: [ZeroTrustService, RiskAssessmentService],
  exports: [ZeroTrustService, RiskAssessmentService],
})
export class ZeroTrustModule {}
