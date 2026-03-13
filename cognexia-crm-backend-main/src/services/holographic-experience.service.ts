import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolographicProjection } from '../entities/holographic-projection.entity';
import { SpatialSession } from '../entities/spatial-session.entity';
import { InteractiveHologram } from '../entities/interactive-hologram.entity';

@Injectable()
export class HolographicExperienceService {
  constructor(
    @InjectRepository(HolographicProjection)
    private projectionRepo: Repository<HolographicProjection>,
    @InjectRepository(SpatialSession)
    private sessionRepo: Repository<SpatialSession>,
    @InjectRepository(InteractiveHologram)
    private interactionRepo: Repository<InteractiveHologram>,
  ) {}

  async createProjection(data: any, organizationId: string) {
    try {
      // Check if customer exists if provided
      if (data.customerId) {
        try {
          const customerExists = await this.projectionRepo.manager.query(
            'SELECT id FROM crm_customers WHERE id = $1 LIMIT 1',
            [data.customerId]
          );
          if (!customerExists || customerExists.length === 0) {
            console.warn(`Customer ${data.customerId} not found, creating projection without customer`);
            data.customerId = null;
          }
        } catch (err) {
          console.warn('Could not check customer existence, proceeding without customer:', err.message);
          data.customerId = null;
        }
      }
      
      // Map type to valid projectionType enum
      let projectionType = data.projectionType || 'VOLUMETRIC';
      if (data.type && !data.projectionType) {
        // If 'type' is provided but not 'projectionType', use VOLUMETRIC as default
        projectionType = 'VOLUMETRIC';
      }
      
      const projection = this.projectionRepo.create({ 
        ...data, 
        organizationId,
        name: data.name || 'Holographic Projection',
        projectionType,
        viewerCount: data.viewerCount || 0,
        type: undefined, // Remove 'type' from data to avoid conflicts
      });
      return await this.projectionRepo.save(projection);
    } catch (error) {
      console.error('Error creating holographic projection:', error);
      console.error('Stack:', error.stack);
      throw new Error(`Failed to create projection: ${error.message}`);
    }
  }

  async initializeSpatialSession(data: any, organizationId: string) {
    try {
      const session = this.sessionRepo.create({
        ...data,
        organizationId,
        sessionName: data.sessionName || 'Spatial Session',
        participantIds: data.participantIds || data.participants || [],
        startTime: new Date(),
        status: 'INITIALIZING',
      });
      return await this.sessionRepo.save(session);
    } catch (error) {
      console.error('Error initializing spatial session:', error.message);
      throw new Error(`Failed to initialize session: ${error.message}`);
    }
  }

  async getSession(sessionId: string, organizationId: string) {
    return this.sessionRepo.findOne({ where: { id: sessionId, organizationId } });
  }

  async trackSpatialInteractions(sessionId: string, data: any, organizationId: string) {
    const interaction = this.interactionRepo.create({
      hologramId: sessionId,
      ...data,
      organizationId,
      timestamp: new Date(),
    });
    return this.interactionRepo.save(interaction);
  }

  async generateHolographicAvatar(customerId: string, organizationId: string) {
    return {
      customerId,
      avatarUrl: `https://holo.example.com/avatars/${customerId}`,
      volumetricData: {},
    };
  }

  async synchronizeMultiUserSpace(sessionId: string, organizationId: string) {
    try {
      const session = await this.sessionRepo.findOne({ where: { id: sessionId, organizationId } });
      return { sessionId, synchronized: true, participants: session?.participantIds || [] };
    } catch (error) {
      console.error('Error synchronizing multi-user space:', error.message);
      // Return mock response if database fails
      return { sessionId, synchronized: false, participants: [] };
    }
  }

  async createSession(data: any, organizationId: string) {
    const session = this.sessionRepo.create({
      organizationId,
      sessionName: data.sessionName || data.experienceType || 'Holographic Session',
      participantIds: data.participantIds || data.participants || [],
      status: data.status || 'ACTIVE',
      spatialEnvironment: data.spatialEnvironment || {},
      startTime: new Date(),
      metadata: data.metadata,
    });
    return this.sessionRepo.save(session);
  }

  async updateSession(id: string, data: any, organizationId: string) {
    await this.sessionRepo.update({ id, organizationId }, { ...data });
    return this.sessionRepo.findOne({ where: { id, organizationId } });
  }

  async recordGesture(sessionId: string, data: any, organizationId: string) {
    try {
      const interaction = this.interactionRepo.create({
        hologramId: sessionId,
        organizationId,
        userId: data.userId,
        interactionType: data.gestureType || data.interactionType || 'gesture',
        gestureData: data.gestureData || data,
        gazeTracking: data.gazeTracking,
        emotionalResponse: data.emotionalResponse,
        timestamp: new Date(),
      });
      return await this.interactionRepo.save(interaction);
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to record gesture',
        data: {
          sessionId,
          organizationId,
          interactionType: data?.gestureType || data?.interactionType || 'gesture',
        },
      };
    }
  }

  async getSessionAnalytics(sessionId: string, organizationId: string) {
    const interactions = await this.interactionRepo.find({
      where: { hologramId: sessionId, organizationId },
    });
    return {
      sessionId,
      interactions: interactions.length,
      gestures: interactions.filter((item) => item.interactionType === 'gesture').length,
      engagementScore: Math.min(100, interactions.length * 3),
    };
  }

  async createTemplate(data: any, organizationId: string) {
    return {
      id: `template-${Date.now()}`,
      organizationId,
      name: data.name || 'Holographic Template',
      config: data.config || {},
      createdAt: new Date(),
    };
  }
}
