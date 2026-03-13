import { Module } from '@nestjs/common';
import { MaintenanceMethodsPart1 } from './maintenance-methods-part1';
import { MaintenanceMethodsPart2 } from './maintenance-methods-part2';
import { MaintenanceMethodsPart3 } from './maintenance-methods-part3';
import { IntelligentMaintenanceCompleteImplementation } from './intelligent-maintenance-complete-implementation';

@Module({
  providers: [
    MaintenanceMethodsPart1,
    MaintenanceMethodsPart2,
    MaintenanceMethodsPart3,
    IntelligentMaintenanceCompleteImplementation
  ],
  exports: [
    MaintenanceMethodsPart1,
    MaintenanceMethodsPart2,
    MaintenanceMethodsPart3,
    IntelligentMaintenanceCompleteImplementation
  ]
})
export class MaintenanceImplementationModule {}
