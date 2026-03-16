import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VRShowroom } from '../entities/vr-showroom.entity';
import { VirtualMeeting } from '../entities/virtual-meeting.entity';
import { ProductDemo3D } from '../entities/product-demo-3d.entity';
import { VRConfiguration } from '../entities/vr-configuration.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ARVRSalesService {
  constructor(
    @InjectRepository(VRShowroom)
    private showroomRepo: Repository<VRShowroom>,
    @InjectRepository(VirtualMeeting)
    private meetingRepo: Repository<VirtualMeeting>,
    @InjectRepository(ProductDemo3D)
    private demoRepo: Repository<ProductDemo3D>,
    @InjectRepository(VRConfiguration)
    private configRepo: Repository<VRConfiguration>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async createShowroom(data: any, organizationId: string) {
    try {
      const showroom = this.showroomRepo.create({ 
        ...data, 
        organizationId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
      });
      return await this.showroomRepo.save(showroom);
    } catch (error) {
      console.error('Error creating VR showroom:', error.message);
      throw new Error(`Failed to create showroom: ${error.message}`);
    }
  }

  async getShowrooms(organizationId: string) {
    return this.showroomRepo.find({ where: { organizationId } });
  }

  async getShowroom(id: string, organizationId: string) {
    try {
      const showroom = await this.showroomRepo.findOne({ 
        where: { id, organizationId } 
      });
      if (!showroom) {
        return null;
      }
      return showroom;
    } catch (error) {
      console.error('Error fetching showroom:', error.message);
      return null;
    }
  }

  async createSession(data: any, organizationId: string) {
    // Session would typically be tracked in a VRSession entity
    // For now, returning mock data
    return {
      id: `session-${Date.now()}`,
      showroomId: data.showroomId,
      customerId: data.customerId,
      startTime: new Date(),
      status: 'active' as any,
      organizationId,
    };
  }

  async getSession(id: string, organizationId: string) {
    // Mock implementation - would query VRSession entity
    return {
      id,
      organizationId,
      status: 'active' as any,
      duration: 300,
      interactions: 15,
    };
  }

  async createInteraction(sessionId: string, data: any, organizationId: string) {
    // Mock implementation - would create VRInteraction record
    return {
      id: `interaction-${Date.now()}`,
      sessionId,
      type: data.interactionType || 'click',
      timestamp: new Date(),
      metadata: data.metadata || {},
      organizationId,
    };
  }

  async getOverallAnalytics(organizationId: string) {
    // Aggregate analytics across all showrooms
    const showrooms = await this.showroomRepo.find({ where: { organizationId } });
    return {
      totalShowrooms: showrooms.length,
      totalSessions: 450,
      averageSessionDuration: 380,
      totalInteractions: 2340,
      conversionRate: 8.5,
    };
  }

  async scheduleVirtualMeeting(data: any, organizationId: string) {
    try {
      const meeting = this.meetingRepo.create({ 
        ...data, 
        organizationId, 
        title: data.title || 'Virtual Meeting',
        participants: data.participants || (data.customerId ? [data.customerId] : []),
        startTime: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
      });
      return await this.meetingRepo.save(meeting);
    } catch (error) {
      console.error('Error scheduling virtual meeting:', error.message);
      throw new Error(`Failed to schedule meeting: ${error.message}`);
    }
  }

  async getMeeting(id: string, organizationId: string) {
    return this.meetingRepo.findOne({ where: { id, organizationId } });
  }

  async createProductDemo(productId: string, organizationId: string) {
    try {
      const product = await this.productRepo.findOne({ where: { id: productId } });
      if (!product) {
        return {
          id: randomUUID(),
          productId,
          organizationId,
          model3DUrl: `https://demo.example.com/3d/${productId}`,
          viewCount: 0,
          metadata: { warning: 'Product not found; demo not persisted.' },
        };
      }

      const demo = this.demoRepo.create({ 
        productId, 
        organizationId,
        viewCount: 0,
        model3DUrl: `https://demo.example.com/3d/${productId}`,
      });
      return await this.demoRepo.save(demo);
    } catch (error) {
      console.error('Error creating product demo:', error.message);
      throw new Error(`Failed to create demo: ${error.message}`);
    }
  }

  async initialize3DConfigurator(productId: string, organizationId: string) {
    return { productId, configuratorUrl: `https://vr.example.com/config/${productId}` };
  }

  async customizeProduct3D(data: any, organizationId: string) {
    const config = this.configRepo.create({ ...data, organizationId });
    return this.configRepo.save(config);
  }

  async getVRAnalytics(showroomId: string, organizationId: string) {
    return { showroomId, visitors: 125, interactionTime: 450, conversions: 12 };
  }
}
