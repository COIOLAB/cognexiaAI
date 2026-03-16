import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './services/health.service';
// import { SharedModule } from '@industry5/shared'; // Temporarily disabled

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([]), // Add entities if needed for health checks
    // SharedModule, // Import shared module for EventBusService - temporarily disabled
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
