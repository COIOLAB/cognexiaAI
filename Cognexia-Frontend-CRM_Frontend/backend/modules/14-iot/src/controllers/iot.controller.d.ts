import { IoTService } from '../services/iot.service';
export declare class IoTController {
    private readonly iotService;
    constructor(iotService: IoTService);
    getDevices(): Promise<never[]>;
    getDeviceById(id: string): Promise<{
        id: string;
        name: string;
        status: string;
    }>;
    createDevice(deviceData: any): Promise<any>;
    updateDevice(id: string, deviceData: any): Promise<any>;
    deleteDevice(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSensorReadings(filters: any): Promise<never[]>;
    recordReading(readingData: any): Promise<any>;
    getGateways(): Promise<never[]>;
    getAlerts(filters: any): Promise<never[]>;
    getConfigurations(): Promise<never[]>;
}
//# sourceMappingURL=iot.controller.d.ts.map