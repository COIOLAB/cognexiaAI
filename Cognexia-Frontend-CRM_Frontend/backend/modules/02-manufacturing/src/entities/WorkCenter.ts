// Industry 5.0 ERP Backend - Manufacturing Module
// WorkCenter Entity - Represents production work centers in manufacturing
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductionLine } from './ProductionLine';
import { WorkOrder } from './WorkOrder';
import { OperationLog } from './OperationLog';
import { IoTDevice } from './IoTDevice';
import { DigitalTwin } from './DigitalTwin';
import { RoutingOperation } from './RoutingOperation';
import { EquipmentMaintenance } from './EquipmentMaintenance';

export enum WorkCenterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BREAKDOWN = 'breakdown',
  SETUP = 'setup',
  CLEANING = 'cleaning',
  CALIBRATION = 'calibration',
  VALIDATION = 'validation',
  STERILIZATION = 'sterilization',
  SANITIZATION = 'sanitization',
}

export enum WorkCenterType {
  // General Manufacturing
  MACHINING = 'machining',
  ASSEMBLY = 'assembly',
  INSPECTION = 'inspection',
  PACKAGING = 'packaging',
  TESTING = 'testing',
  WELDING = 'welding',
  PAINTING = 'painting',
  HEAT_TREATMENT = 'heat_treatment',
  
  // Chemical & Petrochemical
  MIXING = 'mixing',
  BLENDING = 'blending',
  REACTION = 'reaction',
  DISTILLATION = 'distillation',
  SEPARATION = 'separation',
  CRYSTALLIZATION = 'crystallization',
  FILTRATION = 'filtration',
  DRYING = 'drying',
  COOLING = 'cooling',
  HEATING = 'heating',
  
  // Pharmaceutical
  SYNTHESIS = 'synthesis',
  FERMENTATION = 'fermentation',
  PURIFICATION = 'purification',
  TABLETTING = 'tabletting',
  CAPSULATION = 'capsulation',
  COATING = 'coating',
  STERILIZATION = 'sterilization',
  LYOPHILIZATION = 'lyophilization',
  
  // Food & Beverage / FMCG
  COOKING = 'cooking',
  BAKING = 'baking',
  PASTEURIZATION = 'pasteurization',
  HOMOGENIZATION = 'homogenization',
  BOTTLING = 'bottling',
  CANNING = 'canning',
  LABELING = 'labeling',
  SEALING = 'sealing',
  
  // Automotive
  STAMPING = 'stamping',
  FORGING = 'forging',
  CASTING = 'casting',
  MOLDING = 'molding',
  ELECTROPLATING = 'electroplating',
  ANODIZING = 'anodizing',
  
  // Defense
  PRECISION_MACHINING = 'precision_machining',
  BALLISTIC_TESTING = 'ballistic_testing',
  ARMOR_ASSEMBLY = 'armor_assembly',
  ELECTRONICS_ASSEMBLY = 'electronics_assembly',
  
  // Refinery
  CRACKING = 'cracking',
  HYDROGENATION = 'hydrogenation',
  REFORMING = 'reforming',
  ALKYLATION = 'alkylation',
  DESULFURIZATION = 'desulfurization',
  
  // Pesticide
  FORMULATION = 'formulation',
  GRANULATION = 'granulation',
  EMULSIFICATION = 'emulsification',
  SPRAY_DRYING = 'spray_drying',
  
  // Steel Manufacturing
  BLAST_FURNACE = 'blast_furnace',
  STEEL_MAKING = 'steel_making',
  CONTINUOUS_CASTING = 'continuous_casting',
  HOT_ROLLING = 'hot_rolling',
  COLD_ROLLING = 'cold_rolling',
  GALVANIZING = 'galvanizing',
  PICKLING = 'pickling',
  ANNEALING = 'annealing',
  TEMPERING = 'tempering',
  QUENCHING = 'quenching',
  
  // Electronics & Telecommunications
  PCB_MANUFACTURING = 'pcb_manufacturing',
  COMPONENT_MOUNTING = 'component_mounting',
  SOLDERING = 'soldering',
  WAVE_SOLDERING = 'wave_soldering',
  REFLOW_SOLDERING = 'reflow_soldering',
  IC_PACKAGING = 'ic_packaging',
  SEMICONDUCTOR_FAB = 'semiconductor_fab',
  WAFER_PROCESSING = 'wafer_processing',
  CHIP_BONDING = 'chip_bonding',
  TESTING_ELECTRONICS = 'testing_electronics',
  BURN_IN_TESTING = 'burn_in_testing',
  FUNCTIONAL_TESTING = 'functional_testing',
  
  // Electrical Industry
  WINDING = 'winding',
  INSULATION = 'insulation',
  CABLE_MANUFACTURING = 'cable_manufacturing',
  TRANSFORMER_ASSEMBLY = 'transformer_assembly',
  MOTOR_ASSEMBLY = 'motor_assembly',
  GENERATOR_ASSEMBLY = 'generator_assembly',
  SWITCHGEAR_ASSEMBLY = 'switchgear_assembly',
  PANEL_ASSEMBLY = 'panel_assembly',
  WIRE_DRAWING = 'wire_drawing',
  CONDUCTOR_STRANDING = 'conductor_stranding',
  
  // Consumer Goods
  APPLIANCE_ASSEMBLY = 'appliance_assembly',
  FURNITURE_ASSEMBLY = 'furniture_assembly',
  UPHOLSTERY = 'upholstery',
  WOODWORKING = 'woodworking',
  SAWING = 'sawing',
  SANDING = 'sanding',
  FINISHING = 'finishing',
  VARNISHING = 'varnishing',
  LAMINATING = 'laminating',
  VENEER_APPLICATION = 'veneer_application',
  
  // Textile Industry
  SPINNING = 'spinning',
  WEAVING = 'weaving',
  KNITTING = 'knitting',
  DYEING = 'dyeing',
  PRINTING_TEXTILE = 'printing_textile',
  CUTTING_TEXTILE = 'cutting_textile',
  SEWING = 'sewing',
  EMBROIDERY = 'embroidery',
  FABRIC_FINISHING = 'fabric_finishing',
  
  // Paper & Pulp
  PULPING = 'pulping',
  PAPER_MAKING = 'paper_making',
  CALENDERING = 'calendering',
  PAPER_COATING = 'paper_coating',
  PAPER_CONVERTING = 'paper_converting',
  PRINTING_PAPER = 'printing_paper',
  
  // Plastics & Polymers
  INJECTION_MOLDING = 'injection_molding',
  BLOW_MOLDING = 'blow_molding',
  EXTRUSION = 'extrusion',
  THERMOFORMING = 'thermoforming',
  COMPRESSION_MOLDING = 'compression_molding',
  ROTATIONAL_MOLDING = 'rotational_molding',
  POLYMER_PROCESSING = 'polymer_processing',
  
  // Cement Industry
  RAW_MATERIAL_PREPARATION = 'raw_material_preparation',
  KILN_OPERATION = 'kiln_operation',
  CLINKER_COOLING = 'clinker_cooling',
  CEMENT_GRINDING = 'cement_grinding',
  CEMENT_PACKING = 'cement_packing',
  
  // Glass Industry
  GLASS_MELTING = 'glass_melting',
  GLASS_FORMING = 'glass_forming',
  GLASS_CUTTING = 'glass_cutting',
  GLASS_TEMPERING = 'glass_tempering',
  GLASS_LAMINATING = 'glass_laminating',
  GLASS_COATING = 'glass_coating',
  
  // Rubber Industry
  RUBBER_MIXING = 'rubber_mixing',
  VULCANIZATION = 'vulcanization',
  TIRE_MANUFACTURING = 'tire_manufacturing',
  RUBBER_MOLDING = 'rubber_molding',
  RUBBER_EXTRUSION = 'rubber_extrusion',
  
  // Leather Industry
  TANNING = 'tanning',
  LEATHER_FINISHING = 'leather_finishing',
  LEATHER_CUTTING = 'leather_cutting',
  LEATHER_STITCHING = 'leather_stitching',
  
  // Mining & Metals
  ORE_CRUSHING = 'ore_crushing',
  MINERAL_PROCESSING = 'mineral_processing',
  FLOTATION = 'flotation',
  SMELTING = 'smelting',
  REFINING_METALS = 'refining_metals',
  ELECTROLYSIS = 'electrolysis',
  
  // Shipbuilding
  HULL_CONSTRUCTION = 'hull_construction',
  MARINE_WELDING = 'marine_welding',
  SHIP_ASSEMBLY = 'ship_assembly',
  MARINE_PAINTING = 'marine_painting',
  
  // Aerospace
  COMPOSITE_MANUFACTURING = 'composite_manufacturing',
  AEROSPACE_MACHINING = 'aerospace_machining',
  AIRCRAFT_ASSEMBLY = 'aircraft_assembly',
  TURBINE_MANUFACTURING = 'turbine_manufacturing',
  
  // Renewable Energy
  SOLAR_PANEL_MANUFACTURING = 'solar_panel_manufacturing',
  WIND_TURBINE_ASSEMBLY = 'wind_turbine_assembly',
  BATTERY_MANUFACTURING = 'battery_manufacturing',
  FUEL_CELL_ASSEMBLY = 'fuel_cell_assembly',
  
  // General Support
  STORAGE = 'storage',
  MATERIAL_HANDLING = 'material_handling',
  QUALITY_CONTROL = 'quality_control',
  MAINTENANCE = 'maintenance',
  WASTE_TREATMENT = 'waste_treatment',
}

@Entity('work_centers')
@Index(['code'], { unique: true })
@Index(['status'])
@Index(['type'])
@Index(['productionLineId'])
export class WorkCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkCenterType,
    default: WorkCenterType.MACHINING,
  })
  type: WorkCenterType;

  @Column({
    type: 'enum',
    enum: WorkCenterStatus,
    default: WorkCenterStatus.ACTIVE,
  })
  @Index()
  status: WorkCenterStatus;

  // Location Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  building: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  area: string;

  // Capacity and Performance
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyCapacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyCapacity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  efficiency: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  utilization: number; // Percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  setupTime: number; // in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  teardownTime: number; // in minutes

  // Cost Information
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  operatorCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overheadCost: number;

  // Equipment and Resources
  @Column({ type: 'jsonb', nullable: true })
  equipment: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    manufacturer: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  tools: {
    id: string;
    name: string;
    type: string;
    quantity: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  capabilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: {
    name: string;
    authority: string;
    validUntil: Date;
  }[];

  // Staffing Information
  @Column({ type: 'integer', default: 0 })
  requiredOperators: number;

  @Column({ type: 'integer', default: 0 })
  currentOperators: number;

  @Column({ type: 'jsonb', nullable: true })
  skillsRequired: string[];

  // Quality and Safety
  @Column({ type: 'jsonb', nullable: true })
  qualityStandards: {
    standard: string;
    version: string;
    compliance: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  safetyRequirements: {
    requirement: string;
    level: string;
    compliant: boolean;
  }[];

  // IoT and Industry 5.0 Features
  @Column({ type: 'jsonb', nullable: true })
  iotSensors: {
    id: string;
    type: string;
    status: string;
    lastReading: Date;
    value: number;
    unit: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  aiMetrics: {
    predictedEfficiency: number;
    anomalyScore: number;
    maintenanceProbability: number;
    lastAnalysis: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  digitalTwin: {
    id: string;
    status: string;
    lastSync: Date;
    simulationRunning: boolean;
  };

  // Industry-specific fields
  @Column({ type: 'varchar', length: 50, default: 'general' })
  industryType: string; // All manufacturing industries supported

  @Column({ type: 'jsonb', nullable: true })
  industrySpecific: {
    // Pharmaceutical
    cleanRoomClass?: string;
    gmpCompliant?: boolean;
    sterileEnvironment?: boolean;
    validationStatus?: string;
    
    // Chemical/Refinery
    hazardClassification?: string[];
    pressureRating?: number;
    temperatureRange?: { min: number; max: number };
    explosionProof?: boolean;
    
    // Food/FMCG
    haccpCompliant?: boolean;
    allergenFree?: boolean;
    shelfLifeImpact?: boolean;
    sanitizationRequired?: boolean;
    
    // Defense
    securityClearance?: string;
    itarRestricted?: boolean;
    precisionLevel?: string;
    qualityAssurance?: string[];
    
    // Automotive
    isccCertified?: boolean;
    tsCompliant?: boolean;
    autoGradeStandard?: string;
    
    // Pesticide
    toxicityLevel?: string;
    containmentLevel?: number;
    disposalRequirements?: string[];
    
    // Steel Manufacturing
    furnaceType?: string;
    carbonContent?: number;
    alloySteelGrade?: string;
    rollingTemperature?: number;
    galvanizingCompliant?: boolean;
    
    // Electronics & Telecommunications
    esdProtection?: boolean;
    cleanRoomRequired?: boolean;
    leadFreeCompliant?: boolean;
    rohsCompliant?: boolean;
    semiconductorGrade?: string;
    
    // Electrical Industry
    voltageRating?: number;
    insulationClass?: string;
    iecCompliant?: boolean;
    ieeeStandards?: string[];
    
    // Consumer Goods
    durabilityTesting?: boolean;
    energyEfficiency?: string;
    recyclingCompliant?: boolean;
    
    // Textile Industry
    fiberType?: string[];
    dyeCompliant?: boolean;
    fabricWeight?: number;
    organicCertified?: boolean;
    
    // Paper & Pulp
    paperGrade?: string;
    brightnessLevel?: number;
    recycledContent?: number;
    fscCertified?: boolean;
    
    // Plastics & Polymers
    polymerType?: string;
    moldingPressure?: number;
    recyclableGrade?: number;
    biodegradable?: boolean;
    
    // Cement Industry
    cementType?: string;
    compressiveStrength?: number;
    clinkerRatio?: number;
    
    // Glass Industry
    glassType?: string;
    thermalResistance?: number;
    opticalClarity?: number;
    
    // Rubber Industry
    rubberType?: string;
    vulcanizationTemp?: number;
    durometer?: number;
    
    // Leather Industry
    tanningType?: string;
    chromeContent?: number;
    leatherGrade?: string;
    
    // Mining & Metals
    oreType?: string[];
    metalPurity?: number;
    extractionMethod?: string;
    environmentalCompliance?: boolean;
    
    // Shipbuilding
    marineGrade?: boolean;
    corrosionResistance?: string;
    classificationSociety?: string;
    
    // Aerospace
    aerospaceCertification?: string[];
    materialTraceability?: boolean;
    nadcapCompliant?: boolean;
    
    // Renewable Energy
    efficiencyRating?: number;
    weatherResistance?: string;
    recyclingCompliance?: boolean;
  };

  // Relationships
  @Column({ type: 'uuid', nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine, (productionLine) => productionLine.workCenters)
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.workCenter)
  workOrders: WorkOrder[];

  @OneToMany(() => OperationLog, (log) => log.workCenter)
  operationLogs: OperationLog[];

  @OneToMany(() => IoTDevice, (device) => device.workCenter)
  iotDevices: IoTDevice[];

  @OneToMany(() => DigitalTwin, (digitalTwin) => digitalTwin.workCenter)
  digitalTwins: DigitalTwin[];

  @OneToMany(() => RoutingOperation, (routingOperation) => routingOperation.workCenter)
  routingOperations: RoutingOperation[];

  @OneToMany(() => EquipmentMaintenance, (maintenance) => maintenance.workCenter)
  maintenanceRecords: EquipmentMaintenance[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Business Logic Methods
  isOperational(): boolean {
    return this.status === WorkCenterStatus.ACTIVE;
  }

  isAvailable(): boolean {
    return (
      this.status === WorkCenterStatus.ACTIVE &&
      this.currentOperators >= this.requiredOperators
    );
  }

  calculateEfficiencyScore(): number {
    return (this.efficiency * this.utilization) / 100;
  }

  getCurrentUtilization(): number {
    // This would be calculated based on current work orders
    return this.utilization;
  }

  getMaintenanceStatus(): string {
    if (this.status === WorkCenterStatus.MAINTENANCE) {
      return 'Under Maintenance';
    }
    if (this.status === WorkCenterStatus.BREAKDOWN) {
      return 'Equipment Breakdown';
    }
    return 'Operational';
  }

  canHandleOperation(operationType: string): boolean {
    return this.capabilities && this.capabilities.includes(operationType);
  }

  estimateOperationTime(operationType: string, quantity: number): number {
    // Calculate based on hourly capacity and setup time
    const processingTime = quantity / this.hourlyCapacity * 60; // in minutes
    return processingTime + this.setupTime + this.teardownTime;
  }

  calculateOperationCost(operationType: string, duration: number): number {
    const hours = duration / 60;
    return hours * (this.hourlyRate + this.operatorCost + this.overheadCost);
  }

  // Industry-specific methods
  isPharmaceuticalCompliant(): boolean {
    return this.industryType === 'pharmaceutical' &&
           this.industrySpecific?.gmpCompliant === true &&
           this.industrySpecific?.validationStatus === 'validated';
  }

  isFoodSafeCompliant(): boolean {
    return (this.industryType === 'food' || this.industryType === 'fmcg') &&
           this.industrySpecific?.haccpCompliant === true;
  }

  isChemicalSafetyCompliant(): boolean {
    return (this.industryType === 'chemical' || this.industryType === 'refinery' || this.industryType === 'pesticide') &&
           this.industrySpecific?.explosionProof === true &&
           (this.industrySpecific?.hazardClassification?.length ?? 0) > 0;
  }

  isDefenseSecurityCompliant(): boolean {
    return this.industryType === 'defense' &&
           this.industrySpecific?.itarRestricted === true &&
           this.industrySpecific?.securityClearance !== undefined;
  }

  isAutomotiveQualityCompliant(): boolean {
    return this.industryType === 'automotive' &&
           this.industrySpecific?.tsCompliant === true &&
           this.industrySpecific?.isccCertified === true;
  }

  requiresSpecialHandling(): boolean {
    return this.industrySpecific?.toxicityLevel === 'high' ||
           this.industrySpecific?.hazardClassification?.includes('toxic') ||
           (this.industrySpecific?.containmentLevel ?? 0) > 3;
  }

  canProcessMaterial(materialType: string, industryType: string): boolean {
    if (this.industryType !== industryType) return false;
    return this.capabilities?.includes(materialType) || false;
  }

  getCleaningRequirement(): string {
    if (this.industrySpecific?.sterileEnvironment) return 'sterilization';
    if (this.industrySpecific?.sanitizationRequired) return 'sanitization';
    if (this.industrySpecific?.haccpCompliant) return 'food_grade_cleaning';
    return 'standard_cleaning';
  }

  getValidationStatus(): string {
    return this.industrySpecific?.validationStatus || 'not_validated';
  }

  isExplosionProofRequired(): boolean {
    return this.industrySpecific?.explosionProof === true ||
           this.industrySpecific?.hazardClassification?.includes('explosive') === true;
  }
}
