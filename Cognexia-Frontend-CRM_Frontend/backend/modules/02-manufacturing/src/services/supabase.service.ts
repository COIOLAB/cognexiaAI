import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseConfigService } from '../config/supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';
import { ErrorHandler } from '../../../22-shared/src/utils/error-handler.util';

@Injectable()
export class SupabaseManufacturingService {
  private readonly logger = new Logger(SupabaseManufacturingService.name);
  private supabaseClient: SupabaseClient;

  constructor(
    private readonly supabaseConfig: SupabaseConfigService,
    private readonly configService: ConfigService
  ) {
    this.supabaseClient = this.supabaseConfig.getClient();
    this.initializeRealTimeSubscriptions();
  }

  // Real-time subscriptions for manufacturing data
  private initializeRealTimeSubscriptions(): void {
    const realtimeConfig = this.supabaseConfig.getRealtimeConfig();
    
    // Subscribe to production orders changes
    this.supabaseClient
      .channel(realtimeConfig.manufacturing.channels.production_orders)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'production_orders'
      }, (payload) => {
        this.handleProductionOrderChange(payload);
      })
      .subscribe();

    // Subscribe to work orders changes
    this.supabaseClient
      .channel(realtimeConfig.manufacturing.channels.work_orders)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_orders'
      }, (payload) => {
        this.handleWorkOrderChange(payload);
      })
      .subscribe();

    // Subscribe to equipment status changes
    this.supabaseClient
      .channel(realtimeConfig.manufacturing.channels.equipment_status)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_centers'
      }, (payload) => {
        this.handleEquipmentStatusChange(payload);
      })
      .subscribe();

    this.logger.log('Real-time subscriptions initialized for manufacturing module');
  }

  // Work Centers Operations
  async getWorkCenters(filters?: any) {
    try {
      let query = this.supabaseClient
        .from('work_centers')
        .select('*')
        .eq('is_active', true);

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching work centers:', error);
      const errorMessage = ErrorHandler.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }

  async createWorkCenter(workCenterData: any) {
    try {
      const { data, error } = await this.supabaseClient
        .from('work_centers')
        .insert([workCenterData])
        .select();

      if (error) throw error;
      
      this.logger.log(`Work center created: ${workCenterData.name}`);
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error creating work center:', error);
      return { success: false, error: ErrorHandler.getErrorMessage(error) };
    }
  }

  async updateWorkCenter(id: string, updateData: any) {
    try {
      const { data, error } = await this.supabaseClient
        .from('work_centers')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      this.logger.log(`Work center updated: ${id}`);
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error updating work center:', error);
      return { success: false, error: error.message };
    }
  }

  // Production Orders Operations
  async getProductionOrders(filters?: any) {
    try {
      let query = this.supabaseClient
        .from('production_orders')
        .select(`
          *,
          bill_of_materials:bill_of_materials_id(*),
          assigned_production_line:assigned_production_line_id(*)
        `)
        .eq('is_active', true);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateRange) {
        query = query.gte('planned_start_date', filters.dateRange.start)
                    .lte('planned_end_date', filters.dateRange.end);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching production orders:', error);
      return { success: false, error: error.message };
    }
  }

  async createProductionOrder(orderData: any) {
    try {
      // Generate order number if not provided
      if (!orderData.order_number) {
        orderData.order_number = await this.generateOrderNumber('PO');
      }

      const { data, error } = await this.supabaseClient
        .from('production_orders')
        .insert([orderData])
        .select();

      if (error) throw error;
      
      this.logger.log(`Production order created: ${orderData.order_number}`);
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error creating production order:', error);
      return { success: false, error: error.message };
    }
  }

  // Work Orders Operations
  async getWorkOrders(productionOrderId?: string) {
    try {
      let query = this.supabaseClient
        .from('work_orders')
        .select(`
          *,
          production_order:production_order_id(*),
          work_center:work_center_id(*)
        `)
        .eq('is_active', true);

      if (productionOrderId) {
        query = query.eq('production_order_id', productionOrderId);
      }

      const { data, error } = await query.order('operation_sequence');
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching work orders:', error);
      return { success: false, error: error.message };
    }
  }

  async updateWorkOrderProgress(workOrderId: string, progress: number, status?: string) {
    try {
      const updateData: any = {
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      };

      if (status) {
        updateData.status = status;
      }

      // If progress is 100%, set actual end time
      if (progress >= 100) {
        updateData.actual_end_time = new Date().toISOString();
        updateData.status = 'COMPLETED';
      }

      const { data, error } = await this.supabaseClient
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId)
        .select();

      if (error) throw error;
      
      this.logger.log(`Work order progress updated: ${workOrderId} - ${progress}%`);
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error updating work order progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Quality Checks Operations
  async getQualityChecks(filters?: any) {
    try {
      let query = this.supabaseClient
        .from('quality_checks')
        .select(`
          *,
          work_order:work_order_id(*),
          production_order:production_order_id(*)
        `)
        .eq('is_active', true);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('performed_time', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching quality checks:', error);
      return { success: false, error: error.message };
    }
  }

  async createQualityCheck(checkData: any) {
    try {
      if (!checkData.check_number) {
        checkData.check_number = await this.generateOrderNumber('QC');
      }

      const { data, error } = await this.supabaseClient
        .from('quality_checks')
        .insert([checkData])
        .select();

      if (error) throw error;
      
      this.logger.log(`Quality check created: ${checkData.check_number}`);
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error creating quality check:', error);
      return { success: false, error: error.message };
    }
  }

  // IoT Devices Operations
  async getIoTDevices(workCenterId?: string) {
    try {
      let query = this.supabaseClient
        .from('iot_devices')
        .select(`
          *,
          work_center:work_center_id(*),
          production_line:production_line_id(*)
        `)
        .eq('is_active', true);

      if (workCenterId) {
        query = query.eq('work_center_id', workCenterId);
      }

      const { data, error } = await query.order('device_name');
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching IoT devices:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDeviceReadings(deviceId: string, readings: any) {
    try {
      const { data, error } = await this.supabaseClient
        .from('iot_devices')
        .update({
          current_readings: readings,
          last_communication: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('device_id', deviceId)
        .select();

      if (error) throw error;
      
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error updating device readings:', error);
      return { success: false, error: error.message };
    }
  }

  // Digital Twins Operations
  async getDigitalTwins(assetType?: string) {
    try {
      let query = this.supabaseClient
        .from('digital_twins')
        .select('*')
        .eq('is_active', true);

      if (assetType) {
        query = query.eq('twin_type', assetType);
      }

      const { data, error } = await query.order('twin_name');
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching digital twins:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDigitalTwinData(twinId: string, simulationResults: any) {
    try {
      const { data, error } = await this.supabaseClient
        .from('digital_twins')
        .update({
          simulation_results: simulationResults,
          last_sync_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', twinId)
        .select();

      if (error) throw error;
      
      return { success: true, data: data[0] };
    } catch (error) {
      this.logger.error('Error updating digital twin data:', error);
      return { success: false, error: error.message };
    }
  }

  // Manufacturing Analytics
  async getManufacturingDashboard() {
    try {
      const { data, error } = await this.supabaseClient
        .from('manufacturing_dashboard')
        .select('*');

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching manufacturing dashboard:', error);
      return { success: false, error: error.message };
    }
  }

  async getOperationLogs(filters?: any) {
    try {
      let query = this.supabaseClient
        .from('operation_logs')
        .select(`
          *,
          work_order:work_order_id(*),
          work_center:work_center_id(*)
        `)
        .eq('is_active', true);

      if (filters?.dateRange) {
        query = query.gte('start_time', filters.dateRange.start)
                    .lte('end_time', filters.dateRange.end);
      }

      if (filters?.operationType) {
        query = query.eq('operation_type', filters.operationType);
      }

      const { data, error } = await query.order('start_time', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error fetching operation logs:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility Functions
  private async generateOrderNumber(prefix: string): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  // Real-time event handlers
  private handleProductionOrderChange(payload: any): void {
    this.logger.debug('Production order changed:', payload);
    // Implement custom logic for production order changes
    // Example: Send notifications, update caches, trigger workflows
  }

  private handleWorkOrderChange(payload: any): void {
    this.logger.debug('Work order changed:', payload);
    // Implement custom logic for work order changes
  }

  private handleEquipmentStatusChange(payload: any): void {
    this.logger.debug('Equipment status changed:', payload);
    // Implement custom logic for equipment status changes
    // Example: Send alerts, update dashboards, trigger maintenance
  }

  private handleQualityCheckChange(payload: any): void {
    this.logger.debug('Quality check changed:', payload);
    // Implement custom logic for quality check changes
  }

  // Health Check
  async healthCheck() {
    try {
      const result = await this.supabaseConfig.healthCheck();
      this.logger.log('Supabase health check:', result.status);
      return result;
    } catch (error) {
      this.logger.error('Supabase health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date(),
        details: error.message
      };
    }
  }

  // Bulk Operations
  async bulkInsert(tableName: string, records: any[]) {
    try {
      const { data, error } = await this.supabaseClient
        .from(tableName)
        .insert(records)
        .select();

      if (error) throw error;
      
      this.logger.log(`Bulk insert completed: ${records.length} records to ${tableName}`);
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error in bulk insert:', error);
      return { success: false, error: error.message };
    }
  }

  async bulkUpdate(tableName: string, updates: Array<{ id: string, data: any }>) {
    try {
      const promises = updates.map(update => 
        this.supabaseClient
          .from(tableName)
          .update(update.data)
          .eq('id', update.id)
          .select()
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Bulk update had ${errors.length} errors`);
      }

      this.logger.log(`Bulk update completed: ${updates.length} records in ${tableName}`);
      return { success: true, data: results.map(r => r.data[0]) };
    } catch (error) {
      this.logger.error('Error in bulk update:', error);
      return { success: false, error: error.message };
    }
  }

  // Advanced Query Builder
  async executeCustomQuery(query: string, params?: any[]) {
    try {
      const { data, error } = await this.supabaseClient.rpc('execute_sql', {
        query: query,
        params: params || []
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error executing custom query:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscription Management
  async subscribeToTable(tableName: string, callback: (payload: any) => void) {
    return this.supabaseClient
      .channel(`${tableName}_subscription`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName
      }, callback)
      .subscribe();
  }

  // File Storage Operations (for manufacturing documents)
  async uploadFile(bucket: string, path: string, file: File | Buffer) {
    try {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;
      
      this.logger.log(`File uploaded: ${path} to bucket ${bucket}`);
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  }

  async downloadFile(bucket: string, path: string) {
    try {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      this.logger.error('Error downloading file:', error);
      return { success: false, error: error.message };
    }
  }
}
