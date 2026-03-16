import { IoTDevice } from './iot-device.entity';
export declare class SensorReading {
    id: string;
    deviceId: string;
    sensorType: string;
    value: number;
    unit?: string;
    metadata?: any;
    timestamp: Date;
    device: IoTDevice;
}
//# sourceMappingURL=sensor-reading.entity.d.ts.map