import { ProductionLine } from './ProductionLine';
import { WorkOrder } from './WorkOrder';
import { OperationLog } from './OperationLog';
import { IoTDevice } from './IoTDevice';
import { DigitalTwin } from './DigitalTwin';
import { RoutingOperation } from './RoutingOperation';
import { EquipmentMaintenance } from './EquipmentMaintenance';
export declare enum WorkCenterStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    BREAKDOWN = "breakdown",
    SETUP = "setup",
    CLEANING = "cleaning",
    CALIBRATION = "calibration",
    VALIDATION = "validation",
    STERILIZATION = "sterilization",
    SANITIZATION = "sanitization"
}
export declare enum WorkCenterType {
    MACHINING = "machining",
    ASSEMBLY = "assembly",
    INSPECTION = "inspection",
    PACKAGING = "packaging",
    TESTING = "testing",
    WELDING = "welding",
    PAINTING = "painting",
    HEAT_TREATMENT = "heat_treatment",
    MIXING = "mixing",
    BLENDING = "blending",
    REACTION = "reaction",
    DISTILLATION = "distillation",
    SEPARATION = "separation",
    CRYSTALLIZATION = "crystallization",
    FILTRATION = "filtration",
    DRYING = "drying",
    COOLING = "cooling",
    HEATING = "heating",
    SYNTHESIS = "synthesis",
    FERMENTATION = "fermentation",
    PURIFICATION = "purification",
    TABLETTING = "tabletting",
    CAPSULATION = "capsulation",
    COATING = "coating",
    STERILIZATION = "sterilization",
    LYOPHILIZATION = "lyophilization",
    COOKING = "cooking",
    BAKING = "baking",
    PASTEURIZATION = "pasteurization",
    HOMOGENIZATION = "homogenization",
    BOTTLING = "bottling",
    CANNING = "canning",
    LABELING = "labeling",
    SEALING = "sealing",
    STAMPING = "stamping",
    FORGING = "forging",
    CASTING = "casting",
    MOLDING = "molding",
    ELECTROPLATING = "electroplating",
    ANODIZING = "anodizing",
    PRECISION_MACHINING = "precision_machining",
    BALLISTIC_TESTING = "ballistic_testing",
    ARMOR_ASSEMBLY = "armor_assembly",
    ELECTRONICS_ASSEMBLY = "electronics_assembly",
    CRACKING = "cracking",
    HYDROGENATION = "hydrogenation",
    REFORMING = "reforming",
    ALKYLATION = "alkylation",
    DESULFURIZATION = "desulfurization",
    FORMULATION = "formulation",
    GRANULATION = "granulation",
    EMULSIFICATION = "emulsification",
    SPRAY_DRYING = "spray_drying",
    BLAST_FURNACE = "blast_furnace",
    STEEL_MAKING = "steel_making",
    CONTINUOUS_CASTING = "continuous_casting",
    HOT_ROLLING = "hot_rolling",
    COLD_ROLLING = "cold_rolling",
    GALVANIZING = "galvanizing",
    PICKLING = "pickling",
    ANNEALING = "annealing",
    TEMPERING = "tempering",
    QUENCHING = "quenching",
    PCB_MANUFACTURING = "pcb_manufacturing",
    COMPONENT_MOUNTING = "component_mounting",
    SOLDERING = "soldering",
    WAVE_SOLDERING = "wave_soldering",
    REFLOW_SOLDERING = "reflow_soldering",
    IC_PACKAGING = "ic_packaging",
    SEMICONDUCTOR_FAB = "semiconductor_fab",
    WAFER_PROCESSING = "wafer_processing",
    CHIP_BONDING = "chip_bonding",
    TESTING_ELECTRONICS = "testing_electronics",
    BURN_IN_TESTING = "burn_in_testing",
    FUNCTIONAL_TESTING = "functional_testing",
    WINDING = "winding",
    INSULATION = "insulation",
    CABLE_MANUFACTURING = "cable_manufacturing",
    TRANSFORMER_ASSEMBLY = "transformer_assembly",
    MOTOR_ASSEMBLY = "motor_assembly",
    GENERATOR_ASSEMBLY = "generator_assembly",
    SWITCHGEAR_ASSEMBLY = "switchgear_assembly",
    PANEL_ASSEMBLY = "panel_assembly",
    WIRE_DRAWING = "wire_drawing",
    CONDUCTOR_STRANDING = "conductor_stranding",
    APPLIANCE_ASSEMBLY = "appliance_assembly",
    FURNITURE_ASSEMBLY = "furniture_assembly",
    UPHOLSTERY = "upholstery",
    WOODWORKING = "woodworking",
    SAWING = "sawing",
    SANDING = "sanding",
    FINISHING = "finishing",
    VARNISHING = "varnishing",
    LAMINATING = "laminating",
    VENEER_APPLICATION = "veneer_application",
    SPINNING = "spinning",
    WEAVING = "weaving",
    KNITTING = "knitting",
    DYEING = "dyeing",
    PRINTING_TEXTILE = "printing_textile",
    CUTTING_TEXTILE = "cutting_textile",
    SEWING = "sewing",
    EMBROIDERY = "embroidery",
    FABRIC_FINISHING = "fabric_finishing",
    PULPING = "pulping",
    PAPER_MAKING = "paper_making",
    CALENDERING = "calendering",
    PAPER_COATING = "paper_coating",
    PAPER_CONVERTING = "paper_converting",
    PRINTING_PAPER = "printing_paper",
    INJECTION_MOLDING = "injection_molding",
    BLOW_MOLDING = "blow_molding",
    EXTRUSION = "extrusion",
    THERMOFORMING = "thermoforming",
    COMPRESSION_MOLDING = "compression_molding",
    ROTATIONAL_MOLDING = "rotational_molding",
    POLYMER_PROCESSING = "polymer_processing",
    RAW_MATERIAL_PREPARATION = "raw_material_preparation",
    KILN_OPERATION = "kiln_operation",
    CLINKER_COOLING = "clinker_cooling",
    CEMENT_GRINDING = "cement_grinding",
    CEMENT_PACKING = "cement_packing",
    GLASS_MELTING = "glass_melting",
    GLASS_FORMING = "glass_forming",
    GLASS_CUTTING = "glass_cutting",
    GLASS_TEMPERING = "glass_tempering",
    GLASS_LAMINATING = "glass_laminating",
    GLASS_COATING = "glass_coating",
    RUBBER_MIXING = "rubber_mixing",
    VULCANIZATION = "vulcanization",
    TIRE_MANUFACTURING = "tire_manufacturing",
    RUBBER_MOLDING = "rubber_molding",
    RUBBER_EXTRUSION = "rubber_extrusion",
    TANNING = "tanning",
    LEATHER_FINISHING = "leather_finishing",
    LEATHER_CUTTING = "leather_cutting",
    LEATHER_STITCHING = "leather_stitching",
    ORE_CRUSHING = "ore_crushing",
    MINERAL_PROCESSING = "mineral_processing",
    FLOTATION = "flotation",
    SMELTING = "smelting",
    REFINING_METALS = "refining_metals",
    ELECTROLYSIS = "electrolysis",
    HULL_CONSTRUCTION = "hull_construction",
    MARINE_WELDING = "marine_welding",
    SHIP_ASSEMBLY = "ship_assembly",
    MARINE_PAINTING = "marine_painting",
    COMPOSITE_MANUFACTURING = "composite_manufacturing",
    AEROSPACE_MACHINING = "aerospace_machining",
    AIRCRAFT_ASSEMBLY = "aircraft_assembly",
    TURBINE_MANUFACTURING = "turbine_manufacturing",
    SOLAR_PANEL_MANUFACTURING = "solar_panel_manufacturing",
    WIND_TURBINE_ASSEMBLY = "wind_turbine_assembly",
    BATTERY_MANUFACTURING = "battery_manufacturing",
    FUEL_CELL_ASSEMBLY = "fuel_cell_assembly",
    STORAGE = "storage",
    MATERIAL_HANDLING = "material_handling",
    QUALITY_CONTROL = "quality_control",
    MAINTENANCE = "maintenance",
    WASTE_TREATMENT = "waste_treatment"
}
export declare class WorkCenter {
    id: string;
    code: string;
    name: string;
    description: string;
    type: WorkCenterType;
    status: WorkCenterStatus;
    location: string;
    building: string;
    floor: string;
    area: string;
    hourlyCapacity: number;
    dailyCapacity: number;
    efficiency: number;
    utilization: number;
    setupTime: number;
    teardownTime: number;
    hourlyRate: number;
    operatorCost: number;
    overheadCost: number;
    equipment: {
        id: string;
        name: string;
        model: string;
        serialNumber: string;
        manufacturer: string;
    }[];
    tools: {
        id: string;
        name: string;
        type: string;
        quantity: number;
    }[];
    capabilities: string[];
    certifications: {
        name: string;
        authority: string;
        validUntil: Date;
    }[];
    requiredOperators: number;
    currentOperators: number;
    skillsRequired: string[];
    qualityStandards: {
        standard: string;
        version: string;
        compliance: boolean;
    }[];
    safetyRequirements: {
        requirement: string;
        level: string;
        compliant: boolean;
    }[];
    iotSensors: {
        id: string;
        type: string;
        status: string;
        lastReading: Date;
        value: number;
        unit: string;
    }[];
    aiMetrics: {
        predictedEfficiency: number;
        anomalyScore: number;
        maintenanceProbability: number;
        lastAnalysis: Date;
    };
    digitalTwin: {
        id: string;
        status: string;
        lastSync: Date;
        simulationRunning: boolean;
    };
    industryType: string;
    industrySpecific: {
        cleanRoomClass?: string;
        gmpCompliant?: boolean;
        sterileEnvironment?: boolean;
        validationStatus?: string;
        hazardClassification?: string[];
        pressureRating?: number;
        temperatureRange?: {
            min: number;
            max: number;
        };
        explosionProof?: boolean;
        haccpCompliant?: boolean;
        allergenFree?: boolean;
        shelfLifeImpact?: boolean;
        sanitizationRequired?: boolean;
        securityClearance?: string;
        itarRestricted?: boolean;
        precisionLevel?: string;
        qualityAssurance?: string[];
        isccCertified?: boolean;
        tsCompliant?: boolean;
        autoGradeStandard?: string;
        toxicityLevel?: string;
        containmentLevel?: number;
        disposalRequirements?: string[];
        furnaceType?: string;
        carbonContent?: number;
        alloySteelGrade?: string;
        rollingTemperature?: number;
        galvanizingCompliant?: boolean;
        esdProtection?: boolean;
        cleanRoomRequired?: boolean;
        leadFreeCompliant?: boolean;
        rohsCompliant?: boolean;
        semiconductorGrade?: string;
        voltageRating?: number;
        insulationClass?: string;
        iecCompliant?: boolean;
        ieeeStandards?: string[];
        durabilityTesting?: boolean;
        energyEfficiency?: string;
        recyclingCompliant?: boolean;
        fiberType?: string[];
        dyeCompliant?: boolean;
        fabricWeight?: number;
        organicCertified?: boolean;
        paperGrade?: string;
        brightnessLevel?: number;
        recycledContent?: number;
        fscCertified?: boolean;
        polymerType?: string;
        moldingPressure?: number;
        recyclableGrade?: number;
        biodegradable?: boolean;
        cementType?: string;
        compressiveStrength?: number;
        clinkerRatio?: number;
        glassType?: string;
        thermalResistance?: number;
        opticalClarity?: number;
        rubberType?: string;
        vulcanizationTemp?: number;
        durometer?: number;
        tanningType?: string;
        chromeContent?: number;
        leatherGrade?: string;
        oreType?: string[];
        metalPurity?: number;
        extractionMethod?: string;
        environmentalCompliance?: boolean;
        marineGrade?: boolean;
        corrosionResistance?: string;
        classificationSociety?: string;
        aerospaceCertification?: string[];
        materialTraceability?: boolean;
        nadcapCompliant?: boolean;
        efficiencyRating?: number;
        weatherResistance?: string;
        recyclingCompliance?: boolean;
    };
    productionLineId: string;
    productionLine: ProductionLine;
    workOrders: WorkOrder[];
    operationLogs: OperationLog[];
    iotDevices: IoTDevice[];
    digitalTwins: DigitalTwin[];
    routingOperations: RoutingOperation[];
    maintenanceRecords: EquipmentMaintenance[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isOperational(): boolean;
    isAvailable(): boolean;
    calculateEfficiencyScore(): number;
    getCurrentUtilization(): number;
    getMaintenanceStatus(): string;
    canHandleOperation(operationType: string): boolean;
    estimateOperationTime(operationType: string, quantity: number): number;
    calculateOperationCost(operationType: string, duration: number): number;
    isPharmaceuticalCompliant(): boolean;
    isFoodSafeCompliant(): boolean;
    isChemicalSafetyCompliant(): boolean;
    isDefenseSecurityCompliant(): boolean;
    isAutomotiveQualityCompliant(): boolean;
    requiresSpecialHandling(): boolean;
    canProcessMaterial(materialType: string, industryType: string): boolean;
    getCleaningRequirement(): string;
    getValidationStatus(): string;
    isExplosionProofRequired(): boolean;
}
//# sourceMappingURL=WorkCenter.d.ts.map