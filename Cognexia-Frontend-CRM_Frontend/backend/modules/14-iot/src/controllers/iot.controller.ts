import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IoTService } from '../services/iot.service';

@ApiTags('IoT')
@Controller('iot')
export class IoTController {
  constructor(private readonly iotService: IoTService) {}

  @Get('devices')
  @ApiOperation({ summary: 'Get all IoT devices' })
  @ApiResponse({ status: 200, description: 'IoT devices retrieved successfully' })
  async getDevices() {
    return await this.iotService.getDevices();
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get IoT device by ID' })
  async getDeviceById(@Param('id') id: string) {
    return await this.iotService.getDeviceById(id);
  }

  @Post('devices')
  @ApiOperation({ summary: 'Create new IoT device' })
  async createDevice(@Body() deviceData: any) {
    return await this.iotService.createDevice(deviceData);
  }

  @Put('devices/:id')
  @ApiOperation({ summary: 'Update IoT device' })
  async updateDevice(@Param('id') id: string, @Body() deviceData: any) {
    return await this.iotService.updateDevice(id, deviceData);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Delete IoT device' })
  async deleteDevice(@Param('id') id: string) {
    return await this.iotService.deleteDevice(id);
  }

  @Get('sensors')
  @ApiOperation({ summary: 'Get sensor readings' })
  async getSensorReadings(@Query() filters: any) {
    return await this.iotService.getSensorReadings(filters);
  }

  @Post('sensors/readings')
  @ApiOperation({ summary: 'Record sensor reading' })
  async recordReading(@Body() readingData: any) {
    return await this.iotService.recordReading(readingData);
  }

  @Get('gateways')
  @ApiOperation({ summary: 'Get IoT gateways' })
  async getGateways() {
    return await this.iotService.getGateways();
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get device alerts' })
  async getAlerts(@Query() filters: any) {
    return await this.iotService.getAlerts(filters);
  }

  @Get('configurations')
  @ApiOperation({ summary: 'Get IoT configurations' })
  async getConfigurations() {
    return await this.iotService.getConfigurations();
  }
}
