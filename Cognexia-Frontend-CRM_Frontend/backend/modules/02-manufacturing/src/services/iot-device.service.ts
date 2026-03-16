import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IoTDevice } from '../entities/IoTDevice';

@Injectable()
export class IoTDeviceService {
  private readonly logger = new Logger(IoTDeviceService.name);

  constructor(
    @InjectRepository(IoTDevice)
    private readonly iotDeviceRepository: Repository<IoTDevice>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('IoT Device Service initialized');
  }

  async create(deviceData: Partial<IoTDevice>): Promise<IoTDevice> {
    const device = this.iotDeviceRepository.create(deviceData);
    const saved = await this.iotDeviceRepository.save(device);
    this.eventEmitter.emit('iot-device.created', saved);
    return saved;
  }

  async findAll(): Promise<IoTDevice[]> {
    return this.iotDeviceRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<IoTDevice> {
    return this.iotDeviceRepository.findOne({ where: { id } });
  }

  async updateSensorData(deviceId: string, sensorData: any): Promise<IoTDevice> {
    const device = await this.findById(deviceId);
    if (device) {
      device.lastDataReceived = new Date();
      const updated = await this.iotDeviceRepository.save(device);
      this.eventEmitter.emit('iot-device.data-updated', { device: updated, data: sensorData });
      return updated;
    }
    return null;
  }
}
