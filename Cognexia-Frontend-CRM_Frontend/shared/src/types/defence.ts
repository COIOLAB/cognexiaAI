// Defence Industry 5.0 Types

import { BaseEntity, SecurityClearanceLevel } from './core';

export enum MissionType {
  TRAINING = 'TRAINING',
  COMBAT = 'COMBAT',
  RECONNAISSANCE = 'RECONNAISSANCE',
  LOGISTICS = 'LOGISTICS',
  PEACEKEEPING = 'PEACEKEEPING',
  HUMANITARIAN = 'HUMANITARIAN'
}

export enum AssetType {
  PERSONNEL = 'PERSONNEL',
  VEHICLE = 'VEHICLE',
  AIRCRAFT = 'AIRCRAFT',
  NAVAL = 'NAVAL',
  WEAPON = 'WEAPON',
  EQUIPMENT = 'EQUIPMENT',
  COMMUNICATION = 'COMMUNICATION',
  CYBER = 'CYBER'
}

export enum AssetStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED',
  DECOMMISSIONED = 'DECOMMISSIONED',
  DEPLOYED = 'DEPLOYED',
  RESERVE = 'RESERVE'
}

export enum ThreatLevel {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  SUBSTANTIAL = 'SUBSTANTIAL',
  SEVERE = 'SEVERE',
  CRITICAL = 'CRITICAL'
}

export enum ClassificationLevel {
  UNCLASSIFIED = 'UNCLASSIFIED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET',
  TOP_SECRET = 'TOP_SECRET'
}

export enum OperationalReadiness {
  C1 = 'C1', // Ready for deployment
  C2 = 'C2', // Substantially ready
  C3 = 'C3', // Marginally ready
  C4 = 'C4', // Not ready
  C5 = 'C5' // Training/Not available
}

export interface Personnel extends BaseEntity {
  serviceNumber: string;
  personalInfo: PersonnelInfo;
  rank: MilitaryRank;
  branch: MilitaryBranch;
  unit: string;
  position: string;
  securityClearance: SecurityClearanceLevel;
  specializations: Specialization[];
  certifications: MilitaryCertification[];
  deployments: Deployment[];
  medicalStatus: MedicalStatus;
  nextOfKin: NextOfKin;
  currentLocation?: Location;
  status: PersonnelStatus;
  readinessLevel: OperationalReadiness;
}

export interface PersonnelInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  nationality: string;
  socialSecurityNumber: string;
  emergencyContacts: EmergencyContact[];
  bloodType: string;
  allergies?: string[];
}

export interface MilitaryRank {
  grade: string;
  title: string;
  payGrade: string;
  promotionDate: Date;
  timeInGrade: number;
  eligibleForPromotion: boolean;
  nextPromotionDate?: Date;
}

export enum MilitaryBranch {
  ARMY = 'ARMY',
  NAVY = 'NAVY',
  AIR_FORCE = 'AIR_FORCE',
  MARINES = 'MARINES',
  COAST_GUARD = 'COAST_GUARD',
  SPACE_FORCE = 'SPACE_FORCE'
}

export interface Specialization {
  code: string;
  name: string;
  proficiencyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  certificationDate: Date;
  recertificationDate?: Date;
  instructor?: boolean;
}

export interface MilitaryCertification {
  name: string;
  issuingAuthority: string;
  certificationNumber: string;
  issuedDate: Date;
  expiryDate?: Date;
  classificationLevel: ClassificationLevel;
  prerequisites?: string[];
}

export interface Deployment extends BaseEntity {
  deploymentId: string;
  missionId: string;
  location: Location;
  startDate: Date;
  endDate?: Date;
  plannedEndDate: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  role: string;
  hazardousDuty: boolean;
  combatZone: boolean;
}

export interface MedicalStatus {
  physicalCategory: 'A' | 'B' | 'C' | 'D' | 'E';
  mentalCategory: 'A' | 'B' | 'C' | 'D' | 'E';
  lastPhysical: Date;
  nextPhysical: Date;
  medicalRestrictions?: string[];
  medications?: Medication[];
  injuries?: Injury[];
  fitnessScore: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
}

export interface Injury {
  type: string;
  description: string;
  dateOfInjury: Date;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  combatRelated: boolean;
  currentStatus: 'active' | 'healing' | 'recovered';
  restrictions?: string[];
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address: Address;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
}

export enum PersonnelStatus {
  ACTIVE_DUTY = 'ACTIVE_DUTY',
  RESERVE = 'RESERVE',
  NATIONAL_GUARD = 'NATIONAL_GUARD',
  RETIRED = 'RETIRED',
  DISCHARGED = 'DISCHARGED',
  AWOL = 'AWOL',
  PRISONER = 'PRISONER',
  MEDICAL_LEAVE = 'MEDICAL_LEAVE',
  ADMINISTRATIVE_LEAVE = 'ADMINISTRATIVE_LEAVE'
}

export interface MilitaryAsset extends BaseEntity {
  assetId: string;
  assetType: AssetType;
  designation: string;
  model: string;
  manufacturer?: string;
  serialNumber: string;
  status: AssetStatus;
  location: Location;
  assignedUnit?: string;
  classificationLevel: ClassificationLevel;
  specifications: AssetSpecifications;
  maintenance: MaintenanceRecord[];
  operationalHistory: OperationalRecord[];
  readinessLevel: OperationalReadiness;
  nextMaintenanceDate?: Date;
  estimatedValue: number;
}

export interface AssetSpecifications {
  weight?: number;
  dimensions?: Dimensions;
  range?: number;
  speed?: number;
  capacity?: number;
  fuelType?: string;
  powerSource?: string;
  communicationSystems?: string[];
  weapons?: WeaponSystem[];
  armor?: ArmorSpecification;
  sensors?: SensorSystem[];
  customSpecs?: Record<string, any>;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'meters' | 'feet';
}

export interface WeaponSystem {
  type: string;
  designation: string;
  caliber?: string;
  range: number;
  ammunition?: AmmunitionType[];
  mountType: string;
  classificationLevel: ClassificationLevel;
}

export interface AmmunitionType {
  type: string;
  caliber: string;
  quantity: number;
  storageLocation: string;
  expiryDate?: Date;
}

export interface ArmorSpecification {
  type: string;
  thickness: number;
  material: string;
  protectionLevel: string;
  coverage: string[];
}

export interface SensorSystem {
  type: string;
  model: string;
  range: number;
  frequency?: string;
  resolution?: string;
  classificationLevel: ClassificationLevel;
}

export interface MaintenanceRecord extends BaseEntity {
  assetId: string;
  maintenanceType: 'preventive' | 'corrective' | 'overhaul' | 'inspection';
  scheduledDate: Date;
  completedDate?: Date;
  performedBy: string[];
  description: string;
  partsReplaced?: SparePart[];
  hoursSpent: number;
  cost: number;
  nextMaintenanceHours?: number;
  nextMaintenanceDate?: Date;
  defectsFound?: Defect[];
  certifiedBy?: string;
}

export interface SparePart {
  partNumber: string;
  name: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  classificationLevel: ClassificationLevel;
}

export interface Defect {
  defectId: string;
  description: string;
  severity: 'minor' | 'major' | 'critical' | 'grounding';
  component: string;
  discoveredDate: Date;
  discoveredBy: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  correctiveAction?: string;
  resolvedDate?: Date;
  resolvedBy?: string;
}

export interface OperationalRecord extends BaseEntity {
  assetId: string;
  missionId?: string;
  operationType: 'training' | 'combat' | 'transport' | 'reconnaissance' | 'maintenance_flight';
  startTime: Date;
  endTime?: Date;
  duration: number;
  location: Location;
  crew: string[];
  fuelConsumed?: number;
  distanceTraveled?: number;
  incidents?: Incident[];
  performance: PerformanceMetrics;
}

export interface Incident extends BaseEntity {
  incidentId: string;
  type: 'accident' | 'near_miss' | 'equipment_failure' | 'security_breach' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: Location;
  timestamp: Date;
  reportedBy: string;
  involved: string[];
  injuries?: PersonnelInjury[];
  damageAssessment?: DamageAssessment;
  investigation?: Investigation;
  preventiveMeasures?: string[];
  lessonsLearned?: string[];
}

export interface PersonnelInjury {
  personnelId: string;
  injuryType: string;
  severity: 'minor' | 'serious' | 'critical' | 'fatal';
  medicalTreatment: string;
  hospitalizedDays?: number;
  returnToduty?: Date;
}

export interface DamageAssessment {
  assetId: string;
  damageLevel: 'none' | 'minor' | 'moderate' | 'major' | 'total_loss';
  estimatedCost: number;
  repairTime?: number;
  replacementRequired: boolean;
}

export interface Investigation extends BaseEntity {
  investigationId: string;
  leadInvestigator: string;
  team: string[];
  startDate: Date;
  completionDate?: Date;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  findings?: string[];
  rootCause?: string;
  recommendations?: string[];
  classificationLevel: ClassificationLevel;
}

export interface Mission extends BaseEntity {
  missionId: string;
  codename?: string;
  type: MissionType;
  classification: ClassificationLevel;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'approved' | 'active' | 'completed' | 'cancelled' | 'suspended';
  commander: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  location: Location;
  objectives: MissionObjective[];
  assignedPersonnel: string[];
  assignedAssets: string[];
  rules_of_engagement?: string;
  operationPlan: OperationPlan;
  riskAssessment: RiskAssessment;
  communications: CommunicationPlan;
  logistics: LogisticsPlan;
}

export interface MissionObjective {
  objectiveId: string;
  description: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metrics?: SuccessMetrics[];
}

export interface SuccessMetrics {
  metric: string;
  target: number;
  achieved?: number;
  unit: string;
}

export interface OperationPlan {
  phases: OperationPhase[];
  contingencies: Contingency[];
  timeline: Timeline[];
  coordinationProcedures: string[];
}

export interface OperationPhase {
  phaseNumber: number;
  name: string;
  description: string;
  duration: number;
  tasks: Task[];
  resources: ResourceRequirement[];
}

export interface Task {
  taskId: string;
  name: string;
  description: string;
  assignedTo: string[];
  startTime: Date;
  endTime: Date;
  dependencies?: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
}

export interface ResourceRequirement {
  resourceType: 'personnel' | 'asset' | 'supply';
  resourceId?: string;
  quantity: number;
  specifications?: Record<string, any>;
}

export interface Contingency {
  scenario: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'minor' | 'moderate' | 'major' | 'critical';
  response: string;
  alternativePlans?: string[];
}

export interface Timeline {
  event: string;
  time: Date;
  responsible: string;
  milestone: boolean;
}

export interface RiskAssessment extends BaseEntity {
  missionId: string;
  overallRiskLevel: ThreatLevel;
  risks: Risk[];
  mitigationStrategies: MitigationStrategy[];
  assessedBy: string;
  assessmentDate: Date;
  nextReview: Date;
}

export interface Risk {
  riskId: string;
  category: 'personnel' | 'equipment' | 'environmental' | 'enemy' | 'political';
  description: string;
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskLevel: ThreatLevel;
  triggers?: string[];
}

export interface MitigationStrategy {
  riskId: string;
  strategy: string;
  implementation: string[];
  responsible: string;
  timeline: Date;
  effectiveness: 'low' | 'medium' | 'high';
  cost?: number;
}

export interface CommunicationPlan {
  callSigns: CallSign[];
  frequencies: Frequency[];
  protocols: CommunicationProtocol[];
  backupPlans: BackupCommunication[];
  encryptionLevel: ClassificationLevel;
}

export interface CallSign {
  unit: string;
  callSign: string;
  alternates?: string[];
}

export interface Frequency {
  purpose: string;
  frequency: string;
  power: number;
  classification: ClassificationLevel;
}

export interface CommunicationProtocol {
  situation: string;
  procedure: string[];
  authentication?: string;
}

export interface BackupCommunication {
  primary_failure: string;
  backup_method: string;
  procedures: string[];
}

export interface LogisticsPlan {
  supplyRequirements: SupplyRequirement[];
  transportPlan: TransportPlan;
  medicalSupport: MedicalSupport;
  maintenanceSupport: MaintenanceSupport;
}

export interface SupplyRequirement {
  itemType: 'ammunition' | 'fuel' | 'food' | 'water' | 'medical' | 'spare_parts' | 'other';
  itemName: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  deliveryLocation: Location;
  classification: ClassificationLevel;
}

export interface TransportPlan {
  routes: Route[];
  vehicles: string[];
  timeline: Date[];
  securityEscort?: string[];
}

export interface Route {
  routeId: string;
  startLocation: Location;
  endLocation: Location;
  waypoints?: Location[];
  distance: number;
  estimatedTime: number;
  threatLevel: ThreatLevel;
  alternateRoutes?: string[];
}

export interface MedicalSupport {
  medicalPersonnel: string[];
  facilities: MedicalFacility[];
  evacuationPlan: EvacuationPlan;
  bloodSupply?: BloodSupply[];
}

export interface MedicalFacility {
  facilityId: string;
  type: 'field_hospital' | 'aid_station' | 'hospital' | 'medical_unit';
  location: Location;
  capacity: number;
  specialties: string[];
  equipment: MedicalEquipment[];
}

export interface MedicalEquipment {
  type: string;
  model: string;
  quantity: number;
  status: 'operational' | 'maintenance' | 'broken';
}

export interface EvacuationPlan {
  routes: EvacuationRoute[];
  procedures: string[];
  timeline: number;
  transportAssets: string[];
}

export interface EvacuationRoute {
  priority: number;
  startPoint: Location;
  endPoint: Location;
  transportMode: string;
  capacity: number;
  timeline: number;
}

export interface BloodSupply {
  bloodType: string;
  quantity: number;
  expiryDate: Date;
  location: string;
}

export interface MaintenanceSupport {
  maintenanceTeams: MaintenanceTeam[];
  spareParts: SparePart[];
  tools: MaintenanceTool[];
  facilities: MaintenanceFacility[];
}

export interface MaintenanceTeam {
  teamId: string;
  personnel: string[];
  specializations: string[];
  equipment: string[];
  availability: string;
}

export interface MaintenanceTool {
  toolId: string;
  type: string;
  model: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  location: string;
}

export interface MaintenanceFacility {
  facilityId: string;
  type: 'field_maintenance' | 'depot' | 'workshop';
  location: Location;
  capabilities: string[];
  capacity: number;
}

export interface Location {
  name?: string;
  coordinates: Coordinates;
  elevation?: number;
  timeZone: string;
  country?: string;
  region?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  format: 'decimal' | 'dms' | 'mgrs';
}

export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface PerformanceMetrics {
  fuelEfficiency?: number;
  systemAvailability: number;
  missionSuccess: boolean;
  timeOnTarget?: number;
  accuracy?: number;
  responsiveness: number;
  reliability: number;
}

// Intelligence and Security Types
export interface IntelligenceReport extends BaseEntity {
  reportId: string;
  classification: ClassificationLevel;
  source: IntelligenceSource;
  type: 'human' | 'signals' | 'imagery' | 'open_source';
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  credibility: '1' | '2' | '3' | '4' | '5' | '6';
  content: string;
  summary: string;
  dissemination: string[];
  expiryDate?: Date;
  relatedReports?: string[];
  keywords: string[];
  geoLocation?: Location;
}

export interface IntelligenceSource {
  sourceId: string;
  type: 'human' | 'technical' | 'open_source';
  reliability: string;
  accessLevel: SecurityClearanceLevel;
  lastContact?: Date;
}

export interface ThreatAssessment extends BaseEntity {
  threatId: string;
  threatType: 'conventional' | 'unconventional' | 'hybrid' | 'cyber' | 'terrorist';
  level: ThreatLevel;
  source: string;
  target: string;
  capability: ThreatCapability;
  intent: ThreatIntent;
  timeline: ThreatTimeline;
  countermeasures: string[];
  lastUpdated: Date;
  assessedBy: string;
  distributionList: string[];
}

export interface ThreatCapability {
  weaponSystems: string[];
  personnel: number;
  training: string;
  technology: string[];
  logistics: string;
  intelligence: string;
}

export interface ThreatIntent {
  objectives: string[];
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  indicators: string[];
  warnings: string[];
}

export interface ThreatTimeline {
  immediate: string[];
  shortTerm: string[]; // 0-30 days
  mediumTerm: string[]; // 30-180 days
  longTerm: string[]; // 180+ days
}

// Analytics and KPIs
export interface DefenceKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  period: string;
  category: 'readiness' | 'training' | 'maintenance' | 'budget' | 'personnel';
  classification: ClassificationLevel;
}
