import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityController } from './controllers/quality.controller';
import { QualityService } from './services/quality.service';
import { QualityPlan } from './entities/quality-plan.entity';
import { QualityInspection } from './entities/quality-inspection.entity';
import { QualityDefect } from './entities/quality-defect.entity';
import { QualityAlert } from './entities/quality-alert.entity';
import { QualityMetrics } from './entities/quality-metrics.entity';
import { Calibration } from './entities/calibration.entity';
import { ComplianceRecord } from './entities/compliance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QualityPlan,
      QualityInspection,
      QualityDefect,
      QualityAlert,
      QualityMetrics,
      Calibration,
      ComplianceRecord,
    ]),
  ],
  controllers: [QualityController],
  providers: [QualityService],
  exports: [QualityService],
})
export class QualityModule {}
