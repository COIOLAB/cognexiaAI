import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createClient, SupabaseClient, RealtimeChannel, User as SupabaseUser } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../rbac/entities/User.entity';
import * as crypto from 'crypto';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
  jwtSecret: string;
  enableRealtime: boolean;
  enableStorage: boolean;
  bucketName: string;
}

export interface RealtimeSubscription {
  id: string;
  channel: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: any) => void;
  filter?: string;
  isActive: boolean;
}

export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: Buffer | File;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, any>;
}

export interface FileDownloadOptions {
  bucket: string;
  path: string;
  transform?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  };
}

export interface EdgeFunctionOptions {
  functionName: string;
  payload?: any;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface DatabaseQuery {
  table: string;
  select?: string;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
    value: any;
  }>;
  orderBy?: Array<{
    column: string;
    ascending: boolean;
  }>;
  limit?: number;
  offset?: number;
}

@Injectable()
export class SupabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private adminSupabase: SupabaseClient;
  private realtimeSubscriptions: Map<string, RealtimeSubscription> = new Map();
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeSupabase();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.setupRealtimeSubscriptions();
      await this.initializeStorageBuckets();
      this.logger.log('Supabase service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase service', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.cleanup();
      this.logger.log('Supabase service cleaned up successfully');
    } catch (error) {
      this.logger.error('Error during Supabase service cleanup', error);
    }
  }

  private initializeSupabase(): void {
    const config: SupabaseConfig = {
      url: this.configService.get<string>('SUPABASE_URL'),
      anonKey: this.configService.get<string>('SUPABASE_ANON_KEY'),
      serviceKey: this.configService.get<string>('SUPABASE_SERVICE_KEY'),
      jwtSecret: this.configService.get<string>('SUPABASE_JWT_SECRET'),
      enableRealtime: this.configService.get<boolean>('SUPABASE_ENABLE_REALTIME', true),
      enableStorage: this.configService.get<boolean>('SUPABASE_ENABLE_STORAGE', true),
      bucketName: this.configService.get<string>('SUPABASE_BUCKET_NAME', 'inventory'),
    };

    if (!config.url || !config.anonKey) {
      throw new Error('Supabase configuration is missing required fields');
    }

    // Client for user-facing operations
    this.supabase = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 50,
        },
      },
    });

    // Admin client for service operations
    this.adminSupabase = createClient(config.url, config.serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    this.logger.log('Supabase clients initialized');
  }

  // Authentication Methods
  async authenticateUser(token: string): Promise<SupabaseUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        this.logger.warn('Failed to authenticate user with Supabase', error);
        return null;
      }

      // Sync user with local database
      if (user) {
        await this.syncUserWithDatabase(user);
      }

      return user;
    } catch (error) {
      this.logger.error('Error authenticating user', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    password?: string;
    metadata?: Record<string, any>;
    emailRedirectTo?: string;
  }): Promise<{ user: SupabaseUser | null; error: any }> {
    try {
      const { data, error } = await this.adminSupabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.metadata,
        email_confirm: true,
      });

      if (!error && data.user) {
        await this.syncUserWithDatabase(data.user);
      }

      return { user: data.user, error };
    } catch (error) {
      this.logger.error('Error creating user in Supabase', error);
      return { user: null, error };
    }
  }

  async updateUser(userId: string, updates: {
    email?: string;
    password?: string;
    metadata?: Record<string, any>;
  }): Promise<{ user: SupabaseUser | null; error: any }> {
    try {
      const { data, error } = await this.adminSupabase.auth.admin.updateUserById(userId, {
        email: updates.email,
        password: updates.password,
        user_metadata: updates.metadata,
      });

      if (!error && data.user) {
        await this.syncUserWithDatabase(data.user);
      }

      return { user: data.user, error };
    } catch (error) {
      this.logger.error('Error updating user in Supabase', error);
      return { user: null, error };
    }
  }

  async deleteUser(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await this.adminSupabase.auth.admin.deleteUser(userId);

      if (!error) {
        // Soft delete user in local database
        await this.userRepository.update({ supabaseId: userId }, { deletedAt: new Date() });
      }

      return { error };
    } catch (error) {
      this.logger.error('Error deleting user in Supabase', error);
      return { error };
    }
  }

  // Realtime Subscriptions
  async subscribeToTable(subscription: Omit<RealtimeSubscription, 'id' | 'isActive'>): Promise<string> {
    try {
      const subscriptionId = crypto.randomUUID();
      
      const channel = this.supabase
        .channel(`${subscription.table}:${subscriptionId}`)
        .on(
          'postgres_changes',
          {
            event: subscription.event,
            schema: 'public',
            table: subscription.table,
            filter: subscription.filter,
          },
          (payload) => {
            this.logger.debug(`Realtime event received: ${subscription.table}:${subscription.event}`, payload);
            subscription.callback(payload);
            
            // Emit internal event
            this.eventEmitter.emit(`supabase.${subscription.table}.${subscription.event.toLowerCase()}`, payload);
          }
        )
        .subscribe((status) => {
          this.logger.log(`Subscription status for ${subscription.table}: ${status}`);
        });

      this.channels.set(subscriptionId, channel);
      this.realtimeSubscriptions.set(subscriptionId, {
        ...subscription,
        id: subscriptionId,
        isActive: true,
      });

      this.logger.log(`Subscribed to ${subscription.table} table with ID: ${subscriptionId}`);
      return subscriptionId;
    } catch (error) {
      this.logger.error('Error subscribing to table', error);
      throw error;
    }
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      const channel = this.channels.get(subscriptionId);
      if (channel) {
        await this.supabase.removeChannel(channel);
        this.channels.delete(subscriptionId);
      }

      const subscription = this.realtimeSubscriptions.get(subscriptionId);
      if (subscription) {
        subscription.isActive = false;
        this.realtimeSubscriptions.delete(subscriptionId);
      }

      this.logger.log(`Unsubscribed from channel: ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Error unsubscribing from channel', error);
      throw error;
    }
  }

  // Database Operations
  async query(query: DatabaseQuery): Promise<{ data: any[]; error: any }> {
    try {
      let supabaseQuery = this.supabase.from(query.table);

      // Select columns
      if (query.select) {
        supabaseQuery = supabaseQuery.select(query.select);
      }

      // Apply filters
      if (query.filters) {
        for (const filter of query.filters) {
          switch (filter.operator) {
            case 'eq':
              supabaseQuery = supabaseQuery.eq(filter.column, filter.value);
              break;
            case 'neq':
              supabaseQuery = supabaseQuery.neq(filter.column, filter.value);
              break;
            case 'gt':
              supabaseQuery = supabaseQuery.gt(filter.column, filter.value);
              break;
            case 'gte':
              supabaseQuery = supabaseQuery.gte(filter.column, filter.value);
              break;
            case 'lt':
              supabaseQuery = supabaseQuery.lt(filter.column, filter.value);
              break;
            case 'lte':
              supabaseQuery = supabaseQuery.lte(filter.column, filter.value);
              break;
            case 'like':
              supabaseQuery = supabaseQuery.like(filter.column, filter.value);
              break;
            case 'ilike':
              supabaseQuery = supabaseQuery.ilike(filter.column, filter.value);
              break;
            case 'in':
              supabaseQuery = supabaseQuery.in(filter.column, filter.value);
              break;
            case 'is':
              supabaseQuery = supabaseQuery.is(filter.column, filter.value);
              break;
          }
        }
      }

      // Apply ordering
      if (query.orderBy) {
        for (const order of query.orderBy) {
          supabaseQuery = supabaseQuery.order(order.column, { ascending: order.ascending });
        }
      }

      // Apply pagination
      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }
      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 100) - 1);
      }

      const { data, error } = await supabaseQuery;
      return { data: data || [], error };
    } catch (error) {
      this.logger.error('Error executing Supabase query', error);
      return { data: [], error };
    }
  }

  async insert(table: string, data: any): Promise<{ data: any; error: any }> {
    try {
      const { data: result, error } = await this.supabase.from(table).insert(data).select();
      return { data: result, error };
    } catch (error) {
      this.logger.error('Error inserting data into Supabase', error);
      return { data: null, error };
    }
  }

  async update(table: string, data: any, filters: any): Promise<{ data: any; error: any }> {
    try {
      let query = this.supabase.from(table).update(data);
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });

      const { data: result, error } = await query.select();
      return { data: result, error };
    } catch (error) {
      this.logger.error('Error updating data in Supabase', error);
      return { data: null, error };
    }
  }

  async delete(table: string, filters: any): Promise<{ error: any }> {
    try {
      let query = this.supabase.from(table).delete();
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });

      const { error } = await query;
      return { error };
    } catch (error) {
      this.logger.error('Error deleting data from Supabase', error);
      return { error };
    }
  }

  // Storage Operations
  async uploadFile(options: FileUploadOptions): Promise<{ path: string; error: any }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(options.bucket)
        .upload(options.path, options.file, {
          contentType: options.contentType,
          cacheControl: options.cacheControl || '3600',
          metadata: options.metadata,
          upsert: true,
        });

      if (error) {
        this.logger.error('Error uploading file to Supabase Storage', error);
        return { path: '', error };
      }

      return { path: data.path, error: null };
    } catch (error) {
      this.logger.error('Error uploading file to Supabase Storage', error);
      return { path: '', error };
    }
  }

  async downloadFile(options: FileDownloadOptions): Promise<{ data: Blob; error: any }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(options.bucket)
        .download(options.path, options.transform);

      return { data, error };
    } catch (error) {
      this.logger.error('Error downloading file from Supabase Storage', error);
      return { data: null, error };
    }
  }

  async getFileUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<{ url: string; error: any }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      return { url: data?.signedUrl || '', error };
    } catch (error) {
      this.logger.error('Error creating signed URL for file', error);
      return { url: '', error };
    }
  }

  async deleteFile(bucket: string, paths: string[]): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove(paths);

      return { error };
    } catch (error) {
      this.logger.error('Error deleting files from Supabase Storage', error);
      return { error };
    }
  }

  // Edge Functions
  async invokeEdgeFunction(options: EdgeFunctionOptions): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this.supabase.functions.invoke(options.functionName, {
        body: options.payload,
        headers: options.headers,
        method: options.method,
      });

      return { data, error };
    } catch (error) {
      this.logger.error('Error invoking edge function', error);
      return { data: null, error };
    }
  }

  // Analytics and Monitoring
  async getRealtimeMetrics(): Promise<{
    activeSubscriptions: number;
    activeChannels: number;
    subscriptionDetails: RealtimeSubscription[];
  }> {
    return {
      activeSubscriptions: this.realtimeSubscriptions.size,
      activeChannels: this.channels.size,
      subscriptionDetails: Array.from(this.realtimeSubscriptions.values()),
    };
  }

  // Private Helper Methods
  private async syncUserWithDatabase(supabaseUser: SupabaseUser): Promise<void> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { supabaseId: supabaseUser.id },
      });

      const userData = {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        firstName: supabaseUser.user_metadata?.firstName,
        lastName: supabaseUser.user_metadata?.lastName,
        phoneNumber: supabaseUser.phone,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        emailVerifiedAt: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
        phoneVerifiedAt: supabaseUser.phone_confirmed_at ? new Date(supabaseUser.phone_confirmed_at) : null,
        lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : null,
        metadata: supabaseUser.user_metadata,
        status: 'active' as const,
      };

      if (existingUser) {
        await this.userRepository.update(existingUser.id, userData);
      } else {
        const newUser = this.userRepository.create(userData);
        await this.userRepository.save(newUser);
      }
    } catch (error) {
      this.logger.error('Error syncing user with database', error);
    }
  }

  private async setupRealtimeSubscriptions(): Promise<void> {
    try {
      // Subscribe to inventory items changes
      await this.subscribeToTable({
        channel: 'inventory_items_changes',
        table: 'inventory_items',
        event: '*',
        callback: (payload) => {
          this.eventEmitter.emit('inventory.item.changed', payload);
        },
      });

      // Subscribe to stock movements changes
      await this.subscribeToTable({
        channel: 'stock_movements_changes',
        table: 'stock_movements',
        event: '*',
        callback: (payload) => {
          this.eventEmitter.emit('inventory.movement.changed', payload);
        },
      });

      // Subscribe to location changes
      await this.subscribeToTable({
        channel: 'locations_changes',
        table: 'locations',
        event: '*',
        callback: (payload) => {
          this.eventEmitter.emit('inventory.location.changed', payload);
        },
      });

      this.logger.log('Realtime subscriptions setup completed');
    } catch (error) {
      this.logger.error('Error setting up realtime subscriptions', error);
    }
  }

  private async initializeStorageBuckets(): Promise<void> {
    try {
      const buckets = [
        { name: 'inventory', isPublic: false },
        { name: 'documents', isPublic: false },
        { name: 'images', isPublic: true },
        { name: 'reports', isPublic: false },
      ];

      for (const bucket of buckets) {
        const { error } = await this.adminSupabase.storage.createBucket(bucket.name, {
          public: bucket.isPublic,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: bucket.name === 'images' 
            ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            : undefined,
        });

        if (error && error.message !== 'Bucket already exists') {
          this.logger.warn(`Failed to create bucket ${bucket.name}:`, error);
        } else {
          this.logger.log(`Storage bucket ${bucket.name} initialized`);
        }
      }
    } catch (error) {
      this.logger.error('Error initializing storage buckets', error);
    }
  }

  private async cleanup(): Promise<void> {
    try {
      // Unsubscribe from all channels
      for (const [subscriptionId] of this.realtimeSubscriptions) {
        await this.unsubscribe(subscriptionId);
      }

      // Clear caches
      this.realtimeSubscriptions.clear();
      this.channels.clear();
    } catch (error) {
      this.logger.error('Error during cleanup', error);
    }
  }
}
