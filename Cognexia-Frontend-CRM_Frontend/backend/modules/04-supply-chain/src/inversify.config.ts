import { Container } from 'inversify';
import { SupplierManagementService } from './services/SupplierManagementService';
import { SupplyChainRiskManagementService } from './services/SupplyChainRiskManagementService';
import { SupplierPerformanceAnalyticsService } from './services/SupplierPerformanceAnalyticsService';

const container = new Container();

container.bind<SupplierManagementService>(SupplierManagementService).toSelf();
container.bind<SupplyChainRiskManagementService>(SupplyChainRiskManagementService).toSelf();
container.bind<SupplierPerformanceAnalyticsService>(SupplierPerformanceAnalyticsService).toSelf();

export { container };
