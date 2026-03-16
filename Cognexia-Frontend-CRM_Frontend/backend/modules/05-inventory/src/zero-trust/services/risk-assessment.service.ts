import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeviceTrust } from '../../auth/entities/device-trust.entity';

export interface RiskFactor {
  id: string;
  category: 'user' | 'device' | 'network' | 'behavioral' | 'temporal' | 'geolocation';
  name: string;
  description: string;
  weight: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  value: number; // Calculated risk value
  confidence: number; // Confidence in the assessment
  evidence: Array<{
    type: string;
    value: any;
    timestamp: Date;
    source: string;
  }>;
}

export interface RiskAssessment {
  id: string;
  timestamp: Date;
  userId: string;
  deviceId: string;
  resourceId: string;
  totalRiskScore: number; // 0-100
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: RiskFactor[];
  mitigations: Array<{
    factor: string;
    action: string;
    effectiveness: number;
    implemented: boolean;
  }>;
  recommendations: string[];
  expiresAt: Date;
}

export interface BehaviorProfile {
  userId: string;
  deviceId: string;
  patterns: {
    accessTimes: Array<{ hour: number; frequency: number }>;
    locations: Array<{ country: string; region: string; frequency: number; risk: number }>;
    resources: Array<{ type: string; id: string; frequency: number; lastAccess: Date }>;
    networkSegments: Array<{ segment: string; frequency: number; risk: number }>;
    userAgents: Array<{ agent: string; frequency: number; lastSeen: Date }>;
  };
  anomalies: Array<{
    type: string;
    description: string;
    severity: number;
    timestamp: Date;
    resolved: boolean;
  }>;
  baseline: {
    established: Date;
    samples: number;
    confidence: number;
    lastUpdate: Date;
  };
  riskIndicators: {
    frequentLocationChanges: number;
    unusualAccessTimes: number;
    newDeviceFingerprints: number;
    suspiciousNetworkActivity: number;
    failedAuthAttempts: number;
  };
}

@Injectable()
export class RiskAssessmentService {
  private readonly logger = new Logger(RiskAssessmentService.name);
  private readonly behaviorProfiles = new Map<string, BehaviorProfile>();
  private readonly riskFactorWeights = new Map<string, number>();

  constructor(private eventEmitter: EventEmitter2) {
    this.initializeRiskFactors();
  }

  /**
   * Perform comprehensive risk assessment
   */
  async assessRisk(
    userId: string,
    deviceId: string,
    resourceId: string,
    context: {
      ipAddress: string;
      geolocation: any;
      userAgent: string;
      sessionId: string;
      requestType: string;
      timestamp: Date;
    },
    deviceTrust?: DeviceTrust
  ): Promise<RiskAssessment> {
    try {
      const assessmentId = `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get or create behavior profile
      const behaviorProfile = await this.getBehaviorProfile(userId, deviceId);
      
      // Calculate risk factors
      const factors = await this.calculateRiskFactors(
        userId,
        deviceId,
        resourceId,
        context,
        deviceTrust,
        behaviorProfile
      );

      // Calculate total risk score
      const totalRiskScore = this.calculateTotalRiskScore(factors);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(totalRiskScore);
      
      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(factors);
      
      // Generate mitigations
      const mitigations = await this.generateMitigations(factors);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(factors, riskLevel);

      const assessment: RiskAssessment = {
        id: assessmentId,
        timestamp: new Date(),
        userId,
        deviceId,
        resourceId,
        totalRiskScore,
        riskLevel,
        confidence,
        factors,
        mitigations,
        recommendations,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };

      // Update behavior profile with new data
      await this.updateBehaviorProfile(behaviorProfile, context, assessment);

      // Emit risk assessment event
      this.eventEmitter.emit('risk.assessment.completed', {
        assessment,
        previousRisk: await this.getPreviousRiskScore(userId, deviceId),
      });

      this.logger.log(`Risk assessment completed: ${assessmentId} - Score: ${totalRiskScore} (${riskLevel})`);
      return assessment;
    } catch (error) {
      this.logger.error('Risk assessment failed:', error);
      throw error;
    }
  }

  /**
   * Update behavior profile based on user activity
   */
  async updateBehaviorFromActivity(
    userId: string,
    deviceId: string,
    activity: {
      type: 'login' | 'resource_access' | 'logout' | 'failed_auth' | 'location_change';
      timestamp: Date;
      details: Record<string, any>;
      success: boolean;
    }
  ): Promise<void> {
    try {
      const profile = await this.getBehaviorProfile(userId, deviceId);
      
      switch (activity.type) {
        case 'login':
          await this.updateLoginPattern(profile, activity);
          break;
        case 'resource_access':
          await this.updateResourceAccessPattern(profile, activity);
          break;
        case 'location_change':
          await this.updateLocationPattern(profile, activity);
          break;
        case 'failed_auth':
          await this.updateFailedAuthPattern(profile, activity);
          break;
      }

      // Check for anomalies
      const anomalies = await this.detectBehaviorAnomalies(profile, activity);
      if (anomalies.length > 0) {
        profile.anomalies.push(...anomalies);
        
        // Emit anomaly detection event
        this.eventEmitter.emit('risk.behavior.anomaly', {
          userId,
          deviceId,
          anomalies,
          activity,
        });
      }

      this.behaviorProfiles.set(`${userId}-${deviceId}`, profile);
    } catch (error) {
      this.logger.error('Failed to update behavior profile:', error);
    }
  }

  /**
   * Calculate risk score for device trust changes
   */
  async calculateDeviceTrustRisk(
    deviceTrust: DeviceTrust,
    changes: {
      trustLevelChange?: { from: string; to: string };
      complianceChanges?: Array<{ policy: string; from: boolean; to: boolean }>;
      securityEvents?: Array<{ type: string; severity: number; timestamp: Date }>;
      locationChanges?: Array<{ from: any; to: any; distance: number }>;
    }
  ): Promise<{
    riskScore: number;
    riskFactors: string[];
    recommendations: string[];
    immediateActions: string[];
  }> {
    try {
      let riskScore = 0;
      const riskFactors: string[] = [];
      const recommendations: string[] = [];
      const immediateActions: string[] = [];

      // Trust level changes
      if (changes.trustLevelChange) {
        const trustRisk = this.calculateTrustLevelRisk(changes.trustLevelChange);
        riskScore += trustRisk.score;
        riskFactors.push(...trustRisk.factors);
        
        if (trustRisk.score > 50) {
          immediateActions.push('Require device re-verification');
        }
      }

      // Compliance changes
      if (changes.complianceChanges) {
        const complianceRisk = this.calculateComplianceRisk(changes.complianceChanges);
        riskScore += complianceRisk.score;
        riskFactors.push(...complianceRisk.factors);
        
        if (complianceRisk.score > 30) {
          recommendations.push('Update device security configuration');
        }
      }

      // Security events
      if (changes.securityEvents) {
        const securityRisk = this.calculateSecurityEventRisk(changes.securityEvents);
        riskScore += securityRisk.score;
        riskFactors.push(...securityRisk.factors);
        
        if (securityRisk.score > 70) {
          immediateActions.push('Quarantine device', 'Investigate security events');
        }
      }

      // Location changes
      if (changes.locationChanges) {
        const locationRisk = this.calculateLocationChangeRisk(changes.locationChanges);
        riskScore += locationRisk.score;
        riskFactors.push(...locationRisk.factors);
        
        if (locationRisk.score > 40) {
          recommendations.push('Verify device location authenticity');
        }
      }

      // Cap risk score at 100
      riskScore = Math.min(100, riskScore);

      // Add general recommendations based on overall risk
      if (riskScore > 80) {
        immediateActions.push('Suspend device access');
      } else if (riskScore > 60) {
        recommendations.push('Increase monitoring frequency', 'Require additional authentication');
      }

      return {
        riskScore,
        riskFactors,
        recommendations,
        immediateActions,
      };
    } catch (error) {
      this.logger.error('Failed to calculate device trust risk:', error);
      return {
        riskScore: 100, // Fail safe
        riskFactors: ['risk_calculation_error'],
        recommendations: ['Manual security review required'],
        immediateActions: ['Contact security team'],
      };
    }
  }

  /**
   * Detect real-time risk anomalies
   */
  async detectRealTimeAnomalies(
    userId: string,
    deviceId: string,
    currentActivity: {
      type: string;
      location: any;
      time: Date;
      resource: string;
      context: Record<string, any>;
    }
  ): Promise<Array<{
    type: 'velocity' | 'location' | 'time' | 'behavior' | 'device';
    severity: number;
    description: string;
    riskIncrease: number;
    recommended_actions: string[];
  }>> {
    try {
      const anomalies: Array<{
        type: 'velocity' | 'location' | 'time' | 'behavior' | 'device';
        severity: number;
        description: string;
        riskIncrease: number;
        recommended_actions: string[];
      }> = [];

      const profile = await this.getBehaviorProfile(userId, deviceId);

      // Check velocity anomalies (impossible travel)
      const velocityAnomaly = await this.checkVelocityAnomaly(profile, currentActivity);
      if (velocityAnomaly) {
        anomalies.push(velocityAnomaly);
      }

      // Check location anomalies
      const locationAnomaly = await this.checkLocationAnomaly(profile, currentActivity);
      if (locationAnomaly) {
        anomalies.push(locationAnomaly);
      }

      // Check time-based anomalies
      const timeAnomaly = await this.checkTimeAnomaly(profile, currentActivity);
      if (timeAnomaly) {
        anomalies.push(timeAnomaly);
      }

      // Check behavioral anomalies
      const behaviorAnomaly = await this.checkBehaviorAnomaly(profile, currentActivity);
      if (behaviorAnomaly) {
        anomalies.push(behaviorAnomaly);
      }

      // Check device anomalies
      const deviceAnomaly = await this.checkDeviceAnomaly(profile, currentActivity);
      if (deviceAnomaly) {
        anomalies.push(deviceAnomaly);
      }

      // Emit real-time anomaly event if any found
      if (anomalies.length > 0) {
        this.eventEmitter.emit('risk.realtime.anomalies', {
          userId,
          deviceId,
          anomalies,
          activity: currentActivity,
        });
      }

      return anomalies;
    } catch (error) {
      this.logger.error('Failed to detect real-time anomalies:', error);
      return [];
    }
  }

  // Private helper methods

  private initializeRiskFactors(): void {
    // Initialize risk factor weights
    this.riskFactorWeights.set('device_trust_low', 30);
    this.riskFactorWeights.set('device_trust_untrusted', 50);
    this.riskFactorWeights.set('device_compromised', 100);
    this.riskFactorWeights.set('user_trust_low', 25);
    this.riskFactorWeights.set('unusual_location', 20);
    this.riskFactorWeights.set('unusual_time', 15);
    this.riskFactorWeights.set('failed_auth_attempts', 35);
    this.riskFactorWeights.set('new_device', 40);
    this.riskFactorWeights.set('network_untrusted', 30);
    this.riskFactorWeights.set('resource_sensitive', 25);
    this.riskFactorWeights.set('velocity_impossible', 80);
    this.riskFactorWeights.set('behavior_anomaly', 45);
  }

  private async getBehaviorProfile(userId: string, deviceId: string): Promise<BehaviorProfile> {
    const key = `${userId}-${deviceId}`;
    let profile = this.behaviorProfiles.get(key);

    if (!profile) {
      profile = {
        userId,
        deviceId,
        patterns: {
          accessTimes: [],
          locations: [],
          resources: [],
          networkSegments: [],
          userAgents: [],
        },
        anomalies: [],
        baseline: {
          established: new Date(),
          samples: 0,
          confidence: 0,
          lastUpdate: new Date(),
        },
        riskIndicators: {
          frequentLocationChanges: 0,
          unusualAccessTimes: 0,
          newDeviceFingerprints: 0,
          suspiciousNetworkActivity: 0,
          failedAuthAttempts: 0,
        },
      };

      this.behaviorProfiles.set(key, profile);
    }

    return profile;
  }

  private async calculateRiskFactors(
    userId: string,
    deviceId: string,
    resourceId: string,
    context: any,
    deviceTrust?: DeviceTrust,
    behaviorProfile?: BehaviorProfile
  ): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Device trust factors
    if (deviceTrust) {
      if (deviceTrust.compromised) {
        factors.push({
          id: 'device_compromised',
          category: 'device',
          name: 'Device Compromised',
          description: 'Device has been marked as compromised',
          weight: 100,
          severity: 'critical',
          value: 100,
          confidence: 95,
          evidence: [{ type: 'device_status', value: 'compromised', timestamp: new Date(), source: 'device_trust' }],
        });
      }

      if (deviceTrust.trustLevel === 'untrusted') {
        factors.push({
          id: 'device_untrusted',
          category: 'device',
          name: 'Device Untrusted',
          description: 'Device trust level is untrusted',
          weight: 50,
          severity: 'high',
          value: 50,
          confidence: 90,
          evidence: [{ type: 'trust_level', value: 'untrusted', timestamp: new Date(), source: 'device_trust' }],
        });
      }

      if (deviceTrust.trustMetrics.score < 50) {
        factors.push({
          id: 'low_device_score',
          category: 'device',
          name: 'Low Device Trust Score',
          description: 'Device trust score is below acceptable threshold',
          weight: 30,
          severity: 'medium',
          value: 50 - deviceTrust.trustMetrics.score,
          confidence: 85,
          evidence: [{ type: 'trust_score', value: deviceTrust.trustMetrics.score, timestamp: new Date(), source: 'device_trust' }],
        });
      }
    } else {
      // Unknown device
      factors.push({
        id: 'device_unknown',
        category: 'device',
        name: 'Unknown Device',
        description: 'Device is not registered in trust database',
        weight: 60,
        severity: 'high',
        value: 60,
        confidence: 100,
        evidence: [{ type: 'device_status', value: 'unknown', timestamp: new Date(), source: 'device_trust' }],
      });
    }

    // Behavioral factors
    if (behaviorProfile) {
      const behaviorRisk = await this.calculateBehaviorRisk(behaviorProfile, context);
      factors.push(...behaviorRisk);
    }

    // Network factors
    const networkRisk = await this.calculateNetworkRisk(context);
    factors.push(...networkRisk);

    // Temporal factors
    const temporalRisk = await this.calculateTemporalRisk(context);
    factors.push(...temporalRisk);

    // Geolocation factors
    const geolocationRisk = await this.calculateGeolocationRisk(context, behaviorProfile);
    factors.push(...geolocationRisk);

    return factors;
  }

  private calculateTotalRiskScore(factors: RiskFactor[]): number {
    let totalWeight = 0;
    let weightedScore = 0;

    factors.forEach(factor => {
      const weight = factor.weight * (factor.confidence / 100);
      totalWeight += weight;
      weightedScore += factor.value * weight;
    });

    return totalWeight > 0 ? Math.min(100, weightedScore / totalWeight) : 0;
  }

  private determineRiskLevel(score: number): RiskAssessment['riskLevel'] {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'very_low';
  }

  private calculateOverallConfidence(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0;
    return factors.reduce((sum, factor) => sum + factor.confidence, 0) / factors.length;
  }

  private async generateMitigations(factors: RiskFactor[]): Promise<RiskAssessment['mitigations']> {
    const mitigations: RiskAssessment['mitigations'] = [];

    factors.forEach(factor => {
      switch (factor.id) {
        case 'device_compromised':
          mitigations.push({
            factor: factor.id,
            action: 'Quarantine device and require security scan',
            effectiveness: 90,
            implemented: false,
          });
          break;
        case 'device_untrusted':
          mitigations.push({
            factor: factor.id,
            action: 'Require device verification and compliance check',
            effectiveness: 75,
            implemented: false,
          });
          break;
        case 'unusual_location':
          mitigations.push({
            factor: factor.id,
            action: 'Require additional authentication and location verification',
            effectiveness: 65,
            implemented: false,
          });
          break;
        case 'behavior_anomaly':
          mitigations.push({
            factor: factor.id,
            action: 'Enable enhanced monitoring and require MFA',
            effectiveness: 70,
            implemented: false,
          });
          break;
      }
    });

    return mitigations;
  }

  private generateRecommendations(factors: RiskFactor[], riskLevel: RiskAssessment['riskLevel']): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Deny access and require security review');
      recommendations.push('Alert security team immediately');
    } else if (riskLevel === 'medium') {
      recommendations.push('Allow access with enhanced monitoring');
      recommendations.push('Require additional authentication factors');
      recommendations.push('Limit session duration');
    } else {
      recommendations.push('Allow access with standard monitoring');
      recommendations.push('Continue behavioral profiling');
    }

    // Add factor-specific recommendations
    factors.forEach(factor => {
      if (factor.severity === 'critical' || factor.severity === 'high') {
        recommendations.push(`Address ${factor.name}: ${factor.description}`);
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Additional helper methods would be implemented here...
  private async updateBehaviorProfile(profile: BehaviorProfile, context: any, assessment: RiskAssessment): Promise<void> {}
  private async getPreviousRiskScore(userId: string, deviceId: string): Promise<number> { return 0; }
  private async updateLoginPattern(profile: BehaviorProfile, activity: any): Promise<void> {}
  private async updateResourceAccessPattern(profile: BehaviorProfile, activity: any): Promise<void> {}
  private async updateLocationPattern(profile: BehaviorProfile, activity: any): Promise<void> {}
  private async updateFailedAuthPattern(profile: BehaviorProfile, activity: any): Promise<void> {}
  private async detectBehaviorAnomalies(profile: BehaviorProfile, activity: any): Promise<any[]> { return []; }
  private calculateTrustLevelRisk(change: any): { score: number; factors: string[] } { return { score: 0, factors: [] }; }
  private calculateComplianceRisk(changes: any[]): { score: number; factors: string[] } { return { score: 0, factors: [] }; }
  private calculateSecurityEventRisk(events: any[]): { score: number; factors: string[] } { return { score: 0, factors: [] }; }
  private calculateLocationChangeRisk(changes: any[]): { score: number; factors: string[] } { return { score: 0, factors: [] }; }
  private async checkVelocityAnomaly(profile: BehaviorProfile, activity: any): Promise<any> { return null; }
  private async checkLocationAnomaly(profile: BehaviorProfile, activity: any): Promise<any> { return null; }
  private async checkTimeAnomaly(profile: BehaviorProfile, activity: any): Promise<any> { return null; }
  private async checkBehaviorAnomaly(profile: BehaviorProfile, activity: any): Promise<any> { return null; }
  private async checkDeviceAnomaly(profile: BehaviorProfile, activity: any): Promise<any> { return null; }
  private async calculateBehaviorRisk(profile: BehaviorProfile, context: any): Promise<RiskFactor[]> { return []; }
  private async calculateNetworkRisk(context: any): Promise<RiskFactor[]> { return []; }
  private async calculateTemporalRisk(context: any): Promise<RiskFactor[]> { return []; }
  private async calculateGeolocationRisk(context: any, profile?: BehaviorProfile): Promise<RiskFactor[]> { return []; }
}
