// Industry 5.0 ERP Backend - Procurement Module
// SupabaseService - Database integration and real-time features for procurement operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface RealtimeSubscription {
  id: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: any) => void;
  filter?: string;
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;
  private serviceClient: SupabaseClient;
  private subscriptions: Map<string, any> = new Map();
  private config: SupabaseConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      url: this.configService.get<string>('SUPABASE_URL'),
      anonKey: this.configService.get<string>('SUPABASE_ANON_KEY'),
      serviceRoleKey: this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
    };
  }

  async onModuleInit() {
    await this.initializeClients();
  }

  private async initializeClients(): Promise<void> {
    try {
      if (!this.config.url || !this.config.anonKey) {
        this.logger.warn('Supabase configuration not found. Supabase features will be disabled.');
        return;
      }

      // Initialize public client
      this.supabaseClient = createClient(this.config.url, this.config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      // Initialize service role client if available
      if (this.config.serviceRoleKey) {
        this.serviceClient = createClient(this.config.url, this.config.serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      }

      this.logger.log('Supabase clients initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase clients', error);
      throw error;
    }
  }

  // Client Access Methods
  getClient(): SupabaseClient | null {
    return this.supabaseClient || null;
  }

  getServiceClient(): SupabaseClient | null {
    return this.serviceClient || null;
  }

  isAvailable(): boolean {
    return !!this.supabaseClient;
  }

  // Real-time Subscription Methods
  async subscribeToTable(subscription: RealtimeSubscription): Promise<string> {
    if (!this.isAvailable()) {
      this.logger.warn('Supabase not available. Cannot create subscription.');
      return null;
    }

    try {
      const channel = this.supabaseClient
        .channel(`procurement_${subscription.id}`)
        .on(
          'postgres_changes',
          {
            event: subscription.event,
            schema: 'public',
            table: subscription.table,
            filter: subscription.filter,
          },
          (payload) => {
            this.logger.debug(`Real-time event received for ${subscription.table}:`, payload);
            subscription.callback(payload);
          }
        )
        .subscribe();

      this.subscriptions.set(subscription.id, channel);
      this.logger.log(`Created real-time subscription for ${subscription.table} with ID: ${subscription.id}`);
      
      return subscription.id;
    } catch (error) {
      this.logger.error(`Failed to create subscription for ${subscription.table}`, error);
      throw error;
    }
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    if (!this.subscriptions.has(subscriptionId)) {
      this.logger.warn(`Subscription ${subscriptionId} not found`);
      return;
    }

    try {
      const channel = this.subscriptions.get(subscriptionId);
      await this.supabaseClient.removeChannel(channel);
      this.subscriptions.delete(subscriptionId);
      this.logger.log(`Unsubscribed from ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from ${subscriptionId}`, error);
      throw error;
    }
  }

  async unsubscribeAll(): Promise<void> {
    const subscriptionIds = Array.from(this.subscriptions.keys());
    
    for (const id of subscriptionIds) {
      await this.unsubscribe(id);
    }
    
    this.logger.log('All subscriptions removed');
  }

  // Procurement-specific Real-time Methods
  async subscribeToPurchaseOrders(callback: (payload: any) => void): Promise<string> {
    return this.subscribeToTable({
      id: 'purchase_orders',
      table: 'purchase_orders',
      event: '*',
      callback,
    });
  }

  async subscribeToRequisitions(callback: (payload: any) => void): Promise<string> {
    return this.subscribeToTable({
      id: 'purchase_requisitions',
      table: 'purchase_requisitions',
      event: '*',
      callback,
    });
  }

  async subscribeToVendorUpdates(callback: (payload: any) => void): Promise<string> {
    return this.subscribeToTable({
      id: 'vendors',
      table: 'vendors',
      event: 'UPDATE',
      callback,
    });
  }

  async subscribeToPerformanceMetrics(callback: (payload: any) => void): Promise<string> {
    return this.subscribeToTable({
      id: 'supplier_performance_metrics',
      table: 'supplier_performance_metrics',
      event: 'INSERT',
      callback,
    });
  }

  // Data Management Methods
  async insertData(table: string, data: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data: result, error } = await this.supabaseClient
        .from(table)
        .insert(data)
        .select();

      if (error) {
        this.logger.error(`Failed to insert data into ${table}`, error);
        throw error;
      }

      this.logger.debug(`Data inserted into ${table}:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error inserting data into ${table}`, error);
      throw error;
    }
  }

  async updateData(table: string, id: string, data: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data: result, error } = await this.supabaseClient
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error(`Failed to update data in ${table}`, error);
        throw error;
      }

      this.logger.debug(`Data updated in ${table}:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error updating data in ${table}`, error);
      throw error;
    }
  }

  async deleteData(table: string, id: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data: result, error } = await this.supabaseClient
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Failed to delete data from ${table}`, error);
        throw error;
      }

      this.logger.debug(`Data deleted from ${table} with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting data from ${table}`, error);
      throw error;
    }
  }

  async selectData(table: string, filters?: any, select?: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      let query = this.supabaseClient.from(table);

      if (select) {
        query = query.select(select);
      } else {
        query = query.select('*');
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error(`Failed to select data from ${table}`, error);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error selecting data from ${table}`, error);
      throw error;
    }
  }

  // Authentication Methods
  async signIn(email: string, password: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error('Authentication failed', error);
        throw error;
      }

      this.logger.log('User signed in successfully');
      return data;
    } catch (error) {
      this.logger.error('Error during sign in', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { error } = await this.supabaseClient.auth.signOut();

      if (error) {
        this.logger.error('Sign out failed', error);
        throw error;
      }

      this.logger.log('User signed out successfully');
    } catch (error) {
      this.logger.error('Error during sign out', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { data: { user } } = await this.supabaseClient.auth.getUser();
      return user;
    } catch (error) {
      this.logger.error('Error getting current user', error);
      return null;
    }
  }

  // File Storage Methods
  async uploadFile(bucket: string, path: string, file: File | Buffer): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(path, file);

      if (error) {
        this.logger.error(`Failed to upload file to ${bucket}/${path}`, error);
        throw error;
      }

      this.logger.log(`File uploaded successfully to ${bucket}/${path}`);
      return data.path;
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw error;
    }
  }

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .download(path);

      if (error) {
        this.logger.error(`Failed to download file from ${bucket}/${path}`, error);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('Error downloading file', error);
      throw error;
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { error } = await this.supabaseClient.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        this.logger.error(`Failed to delete file from ${bucket}/${path}`, error);
        throw error;
      }

      this.logger.log(`File deleted successfully from ${bucket}/${path}`);
    } catch (error) {
      this.logger.error('Error deleting file', error);
      throw error;
    }
  }

  // RPC (Remote Procedure Call) Methods
  async callFunction(functionName: string, parameters?: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await this.supabaseClient.rpc(functionName, parameters);

      if (error) {
        this.logger.error(`Failed to call function ${functionName}`, error);
        throw error;
      }

      this.logger.debug(`Function ${functionName} called successfully`);
      return data;
    } catch (error) {
      this.logger.error(`Error calling function ${functionName}`, error);
      throw error;
    }
  }

  // Procurement-specific RPC Methods
  async calculateVendorScore(vendorId: string): Promise<number> {
    return this.callFunction('calculate_vendor_score', { vendor_id: vendorId });
  }

  async generateProcurementReport(parameters: any): Promise<any> {
    return this.callFunction('generate_procurement_report', parameters);
  }

  async optimizeSupplierSelection(criteria: any): Promise<any> {
    return this.callFunction('optimize_supplier_selection', { criteria });
  }

  // Utility Methods
  async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      if (error) {
        this.logger.error('Supabase connection test failed', error);
        return false;
      }

      this.logger.log('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Error testing Supabase connection', error);
      return false;
    }
  }

  async getConnectionInfo(): Promise<any> {
    return {
      isAvailable: this.isAvailable(),
      hasServiceClient: !!this.serviceClient,
      activeSubscriptions: this.subscriptions.size,
      config: {
        url: this.config.url,
        hasAnonKey: !!this.config.anonKey,
        hasServiceKey: !!this.config.serviceRoleKey,
      },
    };
  }

  // Cleanup Methods
  async onModuleDestroy(): Promise<void> {
    await this.unsubscribeAll();
    this.logger.log('SupabaseService destroyed');
  }
}
