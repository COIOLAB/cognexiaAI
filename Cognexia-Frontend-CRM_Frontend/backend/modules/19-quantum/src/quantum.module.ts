import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuantumController } from './controllers/quantum.controller';
import { QuantumService } from './services/quantum.service';
import { QuantumProcessor } from './entities/quantum-processor.entity';
import { QuantumSensor } from './entities/quantum-sensor.entity';
import { QuantumOptimization } from './entities/quantum-optimization.entity';
import { QuantumSecurity } from './entities/quantum-security.entity';
import { QuantumAnalytics } from './entities/quantum-analytics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuantumProcessor,
      QuantumSensor,
      QuantumOptimization,
      QuantumSecurity,
      QuantumAnalytics,
    ]),
  ],
  controllers: [QuantumController],
  providers: [QuantumService],
  exports: [QuantumService],
})
export class QuantumModule {}
