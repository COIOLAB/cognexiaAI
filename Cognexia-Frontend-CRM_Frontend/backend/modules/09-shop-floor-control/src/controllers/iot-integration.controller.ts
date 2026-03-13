// Industry 5.0 ERP Backend - IoT Integration Controller
// Advanced IoT device management and data integration for shop floor
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { IoTIntegrationService } from '../services/iot-integration.service';
import { ShopFloorSecurityGuard } from '../guards/shop-floor-security.guard';

// DTOs for IoT operations
export class CreateIoTDeviceDto {
  deviceId: string;
  deviceType: 'SENSOR' | 'ACTUATOR' | 'GATEWAY' | 'EDGE_COMPUTE' | 'CAMERA' | 'BEACON';
  name: string;
  location: {
    workCellId: string;
    position: { x: number; y: number; z: number };
    zone: string;
  };
  specifications: {
    manufacturer: string;
    model: string;
    firmware: string;
    capabilities: string[];
    communicationProtocol: 'MQTT' | 'HTTP' | 'CoAP' | 'MODBUS' | 'OPC_UA';
  };
  dataConfiguration: {
    samplingRate: number; // Hz
    dataFormat: 'JSON' | 'XML' | 'BINARY';
    encryption: boolean;
    compression: boolean;
  };
  thresholds?: {
    parameter: string;
    minValue: number;
    maxValue: number;
    alertLevel: 'INFO' | 'WARNING' | 'CRITICAL';
  }[];
}

export class UpdateIoTDeviceDto {
  status?: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
  configuration?: {
    samplingRate?: number;
    thresholds?: any[];
    alertsEnabled?: boolean;
  };
  location?: {
    workCellId?: string;
    position?: { x: number; y: number; z: number };
  };
  maintenanceSchedule?: {
    nextMaintenance: string;
    lastMaintenance: string;
  };
}

@ApiTags('IoT Integration')
@Controller('shop-floor/iot')
@UseGuards(ShopFloorSecurityGuard)
@ApiBearerAuth()
export class IoTIntegrationController {
  private readonly logger = new Logger(IoTIntegrationController.name);

  constructor(
    private readonly iotService: IoTIntegrationService,
  ) {}

  @Get('devices')
  @ApiOperation({
    summary: 'Get all IoT devices',
    description: 'Retrieve all IoT devices with their status and real-time data',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'deviceType', required: false })
  @ApiQuery({ name: 'workCellId', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'IoT devices retrieved successfully',
    schema: {
      example: {
        devices: [
          {
            id: 'sensor_001',
            name: 'Temperature Sensor A1',
            type: 'SENSOR',
            status: 'ONLINE',
            workCellId: 'CELL_001',
            lastReading: {
              timestamp: '2024-03-01T14:30:00Z',
              value: 25.6,
              unit: '°C'
            },
            batteryLevel: 87,
            signalStrength: -45
          }
        ],
        total: 156,
        online: 142,
        offline: 8,
        maintenance: 6
      }
    }
  })
  async getAllDevices(
    @Query('status') status?: string,
    @Query('deviceType') deviceType?: string,
    @Query('workCellId') workCellId?: string,
  ) {
    try {
      const devices = await this.iotService.getDevices({
        status,
        deviceType,
        workCellId,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'IoT devices retrieved successfully',
        data: devices,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve devices: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve devices',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('devices')
  @ApiOperation({
    summary: 'Register new IoT device',
    description: 'Add a new IoT device to the shop floor network',
  })
  @ApiBody({ type: CreateIoTDeviceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'IoT device registered successfully' 
  })
  async registerDevice(@Body() createDto: CreateIoTDeviceDto) {
    try {
      this.logger.log(`Registering new IoT device: ${createDto.deviceId}`);
      
      const device = await this.iotService.registerDevice(createDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'IoT device registered successfully',
        data: device,
      };
    } catch (error) {
      this.logger.error(`Failed to register device: ${error.message}`);
      throw new HttpException(
        'Failed to register device',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('devices/:id/data')
  @ApiOperation({
    summary: 'Get device data stream',
    description: 'Retrieve real-time and historical data from a specific IoT device',
  })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Time range (1h, 24h, 7d)' })
  @ApiQuery({ name: 'granularity', required: false, description: 'Data granularity (1m, 5m, 1h)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Device data retrieved',
    schema: {
      example: {
        deviceId: 'sensor_001',
        currentValue: 25.6,
        unit: '°C',
        timestamp: '2024-03-01T14:30:00Z',
        historicalData: [
          { timestamp: '2024-03-01T14:00:00Z', value: 24.8 },
          { timestamp: '2024-03-01T14:15:00Z', value: 25.2 },
          { timestamp: '2024-03-01T14:30:00Z', value: 25.6 }
        ],
        statistics: {
          min: 24.1,
          max: 26.2,
          average: 25.3,
          trend: 'stable'
        }
      }
    }
  })
  async getDeviceData(
    @Param('id') deviceId: string,
    @Query('timeRange') timeRange?: string,
    @Query('granularity') granularity?: string,
  ) {
    try {
      const data = await this.iotService.getDeviceData(deviceId, {
        timeRange,
        granularity,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Device data retrieved successfully',
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve device data: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve device data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/network')
  @ApiOperation({
    summary: 'Get network analytics',
    description: 'Analyze IoT network performance and health metrics',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Network analytics retrieved',
    schema: {
      example: {
        networkHealth: {
          overallStatus: 'HEALTHY',
          connectivity: 0.96,
          latency: 45, // ms
          throughput: 125.5, // MB/hour
          packetLoss: 0.02
        },
        deviceBreakdown: {
          total: 156,
          online: 142,
          offline: 8,
          maintenance: 6,
          byType: {
            'SENSOR': 89,
            'ACTUATOR': 34,
            'GATEWAY': 12,
            'CAMERA': 21
          }
        },
        alerts: {
          active: 3,
          critical: 1,
          warning: 2
        }
      }
    }
  })
  async getNetworkAnalytics() {
    try {
      const analytics = await this.iotService.getNetworkAnalytics();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Network analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve analytics: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
