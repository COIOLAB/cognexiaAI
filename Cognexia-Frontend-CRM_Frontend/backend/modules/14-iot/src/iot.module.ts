import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTController } from './controllers/iot.controller';
import { IoTService } from './services/iot.service';
import { IoTDevice } from './entities/iot-device.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { IoTGateway } from './entities/iot-gateway.entity';
import { DeviceAlert } from './entities/device-alert.entity';
import { IoTConfiguration } from './entities/iot-configuration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IoTDevice,
      SensorReading,
      IoTGateway,
      DeviceAlert,
      IoTConfiguration,
    ]),
  ],
  controllers: [IoTController],
  providers: [IoTService],
  exports: [IoTService],
})
export class IoTModule {}
