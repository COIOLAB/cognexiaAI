import { IoTDevice } from './iot-device.entity';
export declare class DeviceAlert {
    id: string;
    deviceId: string;
    alertType: string;
    severity: string;
    message: string;
    details?: any;
    resolved: boolean;
    createdAt: Date;
    device: IoTDevice;
}
//# sourceMappingURL=device-alert.entity.d.ts.map