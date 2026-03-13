import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../../../utils/logger';
import { IntegrationGatewayService, IntegrationGatewayManager } from '../services/index';
import { ModbusProtocolAdapter } from '../protocols/ModbusProtocolAdapter';
import { MQTTProtocolAdapter } from '../protocols/MQTTProtocolAdapter';
import { OPCUAProtocolAdapter } from '../protocols/OPCUAProtocolAdapter';

export class IntegrationGatewayController {
  private integrationGatewayService: IntegrationGatewayService;
  private integrationGatewayManager: IntegrationGatewayManager;

  constructor() {
    this.integrationGatewayService = new IntegrationGatewayService();
    this.integrationGatewayManager = new IntegrationGatewayManager();
  }

  // Integration System Management
  public registerIntegrationSystem = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const systemData = req.body;
      const result = await this.integrationGatewayService.registerIntegrationSystem(systemData);
      
      logger.info('Integration system registered successfully', { systemId: result.systemId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Integration system registered successfully'
      });
    } catch (error) {
      logger.error('Error registering integration system', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to register integration system',
        error: error.message
      });
    }
  };

  public getIntegrationSystems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, type, protocol, limit, offset } = req.query;
      const filters = {
        status: status as string,
        type: type as string,
        protocol: protocol as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.integrationGatewayService.getIntegrationSystems(filters);
      
      res.status(200).json({
        success: true,
        data: result.systems,
        pagination: result.pagination,
        message: 'Integration systems retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration systems', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration systems',
        error: error.message
      });
    }
  };

  public getIntegrationSystemById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const result = await this.integrationGatewayService.getIntegrationSystemById(systemId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Integration system not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration system retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration system', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration system',
        error: error.message
      });
    }
  };

  public updateIntegrationSystem = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const updateData = req.body;
      const result = await this.integrationGatewayService.updateIntegrationSystem(systemId, updateData);
      
      logger.info('Integration system updated successfully', { systemId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration system updated successfully'
      });
    } catch (error) {
      logger.error('Error updating integration system', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update integration system',
        error: error.message
      });
    }
  };

  public deleteIntegrationSystem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      await this.integrationGatewayService.deleteIntegrationSystem(systemId);
      
      logger.info('Integration system deleted successfully', { systemId });
      res.status(200).json({
        success: true,
        message: 'Integration system deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting integration system', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete integration system',
        error: error.message
      });
    }
  };

  // Connection Management
  public testConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const result = await this.integrationGatewayService.testConnection(systemId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Connection test completed'
      });
    } catch (error) {
      logger.error('Error testing connection', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to test connection',
        error: error.message
      });
    }
  };

  public establishConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const result = await this.integrationGatewayService.establishConnection(systemId);
      
      logger.info('Connection established successfully', { systemId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Connection established successfully'
      });
    } catch (error) {
      logger.error('Error establishing connection', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to establish connection',
        error: error.message
      });
    }
  };

  public closeConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      await this.integrationGatewayService.closeConnection(systemId);
      
      logger.info('Connection closed successfully', { systemId });
      res.status(200).json({
        success: true,
        message: 'Connection closed successfully'
      });
    } catch (error) {
      logger.error('Error closing connection', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to close connection',
        error: error.message
      });
    }
  };

  public getConnectionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const result = await this.integrationGatewayService.getConnectionStatus(systemId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Connection status retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching connection status', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch connection status',
        error: error.message
      });
    }
  };

  // Data Exchange Management
  public sendData = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const { data, options } = req.body;
      const result = await this.integrationGatewayService.sendData(systemId, data, options);
      
      logger.info('Data sent successfully', { systemId, dataSize: JSON.stringify(data).length });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data sent successfully'
      });
    } catch (error) {
      logger.error('Error sending data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to send data',
        error: error.message
      });
    }
  };

  public receiveData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const { filters } = req.query;
      const result = await this.integrationGatewayService.receiveData(systemId, JSON.parse(filters as string || '{}'));
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data received successfully'
      });
    } catch (error) {
      logger.error('Error receiving data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to receive data',
        error: error.message
      });
    }
  };

  public synchronizeData = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const syncOptions = req.body;
      const result = await this.integrationGatewayService.synchronizeData(systemId, syncOptions);
      
      logger.info('Data synchronized successfully', { systemId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data synchronized successfully'
      });
    } catch (error) {
      logger.error('Error synchronizing data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to synchronize data',
        error: error.message
      });
    }
  };

  // Protocol-Specific Operations
  public executeModbusOperation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const { operation, parameters } = req.body;
      const modbusAdapter = new ModbusProtocolAdapter();
      const result = await modbusAdapter.executeOperation(systemId, operation, parameters);
      
      logger.info('Modbus operation executed successfully', { systemId, operation });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Modbus operation executed successfully'
      });
    } catch (error) {
      logger.error('Error executing Modbus operation', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to execute Modbus operation',
        error: error.message
      });
    }
  };

  public executeMQTTOperation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const { operation, parameters } = req.body;
      const mqttAdapter = new MQTTProtocolAdapter();
      const result = await mqttAdapter.executeOperation(systemId, operation, parameters);
      
      logger.info('MQTT operation executed successfully', { systemId, operation });
      res.status(200).json({
        success: true,
        data: result,
        message: 'MQTT operation executed successfully'
      });
    } catch (error) {
      logger.error('Error executing MQTT operation', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to execute MQTT operation',
        error: error.message
      });
    }
  };

  public executeOPCUAOperation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const { operation, parameters } = req.body;
      const opcuaAdapter = new OPCUAProtocolAdapter();
      const result = await opcuaAdapter.executeOperation(systemId, operation, parameters);
      
      logger.info('OPC UA operation executed successfully', { systemId, operation });
      res.status(200).json({
        success: true,
        data: result,
        message: 'OPC UA operation executed successfully'
      });
    } catch (error) {
      logger.error('Error executing OPC UA operation', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to execute OPC UA operation',
        error: error.message
      });
    }
  };

  // Integration Mapping Management
  public createDataMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const mappingData = req.body;
      const result = await this.integrationGatewayService.createDataMapping(mappingData);
      
      logger.info('Data mapping created successfully', { mappingId: result.mappingId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Data mapping created successfully'
      });
    } catch (error) {
      logger.error('Error creating data mapping', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create data mapping',
        error: error.message
      });
    }
  };

  public getDataMappings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId, sourceSystem, targetSystem, limit, offset } = req.query;
      const filters = {
        systemId: systemId as string,
        sourceSystem: sourceSystem as string,
        targetSystem: targetSystem as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.integrationGatewayService.getDataMappings(filters);
      
      res.status(200).json({
        success: true,
        data: result.mappings,
        pagination: result.pagination,
        message: 'Data mappings retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching data mappings', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data mappings',
        error: error.message
      });
    }
  };

  public updateDataMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { mappingId } = req.params;
      const updateData = req.body;
      const result = await this.integrationGatewayService.updateDataMapping(mappingId, updateData);
      
      logger.info('Data mapping updated successfully', { mappingId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data mapping updated successfully'
      });
    } catch (error) {
      logger.error('Error updating data mapping', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update data mapping',
        error: error.message
      });
    }
  };

  public deleteDataMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mappingId } = req.params;
      await this.integrationGatewayService.deleteDataMapping(mappingId);
      
      logger.info('Data mapping deleted successfully', { mappingId });
      res.status(200).json({
        success: true,
        message: 'Data mapping deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting data mapping', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete data mapping',
        error: error.message
      });
    }
  };

  // Integration Monitoring and Analytics
  public getIntegrationDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeframe } = req.query;
      const result = await this.integrationGatewayService.getIntegrationDashboard(timeframe as string || '24h');
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration dashboard data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration dashboard', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration dashboard',
        error: error.message
      });
    }
  };

  public getIntegrationMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, systemId, metricType } = req.query;
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        systemId: systemId as string,
        metricType: metricType as string
      };

      const result = await this.integrationGatewayService.getIntegrationMetrics(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration metrics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration metrics', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration metrics',
        error: error.message
      });
    }
  };

  public getIntegrationLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId, level, startDate, endDate, limit, offset } = req.query;
      const filters = {
        systemId: systemId as string,
        level: level as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.integrationGatewayService.getIntegrationLogs(filters);
      
      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
        message: 'Integration logs retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration logs', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration logs',
        error: error.message
      });
    }
  };

  // Integration Health and Status
  public getIntegrationHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.integrationGatewayService.getIntegrationHealth();
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration health status retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration health', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration health',
        error: error.message
      });
    }
  };

  public performHealthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const result = await this.integrationGatewayService.performHealthCheck(systemId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Health check completed successfully'
      });
    } catch (error) {
      logger.error('Error performing health check', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to perform health check',
        error: error.message
      });
    }
  };

  // Integration Configuration Management
  public getIntegrationConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemId } = req.params;
      const result = await this.integrationGatewayService.getIntegrationConfig(systemId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration configuration retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration configuration', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration configuration',
        error: error.message
      });
    }
  };

  public updateIntegrationConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { systemId } = req.params;
      const configData = req.body;
      const result = await this.integrationGatewayService.updateIntegrationConfig(systemId, configData);
      
      logger.info('Integration configuration updated successfully', { systemId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration configuration updated successfully'
      });
    } catch (error) {
      logger.error('Error updating integration configuration', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update integration configuration',
        error: error.message
      });
    }
  };

  // Data Transformation and Processing
  public transformData = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { data, transformationRules } = req.body;
      const result = await this.integrationGatewayService.transformData(data, transformationRules);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data transformed successfully'
      });
    } catch (error) {
      logger.error('Error transforming data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to transform data',
        error: error.message
      });
    }
  };

  public validateData = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { data, validationSchema } = req.body;
      const result = await this.integrationGatewayService.validateData(data, validationSchema);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data validation completed'
      });
    } catch (error) {
      logger.error('Error validating data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to validate data',
        error: error.message
      });
    }
  };

  // Integration Flow Management
  public createIntegrationFlow = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const flowData = req.body;
      const result = await this.integrationGatewayService.createIntegrationFlow(flowData);
      
      logger.info('Integration flow created successfully', { flowId: result.flowId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Integration flow created successfully'
      });
    } catch (error) {
      logger.error('Error creating integration flow', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create integration flow',
        error: error.message
      });
    }
  };

  public getIntegrationFlows = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, sourceSystem, targetSystem, limit, offset } = req.query;
      const filters = {
        status: status as string,
        sourceSystem: sourceSystem as string,
        targetSystem: targetSystem as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.integrationGatewayService.getIntegrationFlows(filters);
      
      res.status(200).json({
        success: true,
        data: result.flows,
        pagination: result.pagination,
        message: 'Integration flows retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching integration flows', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration flows',
        error: error.message
      });
    }
  };

  public executeIntegrationFlow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { flowId } = req.params;
      const { inputData } = req.body;
      const result = await this.integrationGatewayService.executeIntegrationFlow(flowId, inputData);
      
      logger.info('Integration flow executed successfully', { flowId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Integration flow executed successfully'
      });
    } catch (error) {
      logger.error('Error executing integration flow', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to execute integration flow',
        error: error.message
      });
    }
  };
}

export default new IntegrationGatewayController();
