import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { DashboardKPI } from './entities/dashboard-kpi.entity';
import { Report } from './entities/report.entity';
import { DataVisualization } from './entities/data-visualization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardKPI,
      Report,
      DataVisualization,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
