export declare enum WorkCenterType {
    GENERAL = "general",
    REACTION = "reaction",
    SEPARATION = "separation",
    MIXING = "mixing",
    HEATING = "heating",
    COOLING = "cooling",
    DRYING = "drying",
    CRYSTALLIZATION = "crystallization",
    DISTILLATION = "distillation",
    EXTRACTION = "extraction",
    FILTRATION = "filtration",
    CENTRIFUGATION = "centrifugation",
    TABLETTING = "tabletting",
    CAPSULE_FILLING = "capsule_filling",
    COATING = "coating",
    GRANULATION = "granulation",
    BLENDING = "blending",
    STERILIZATION = "sterilization",
    LYOPHILIZATION = "lyophilization",
    MICRONIZATION = "micronization",
    ASSEMBLY = "assembly",
    MACHINING = "machining",
    WELDING = "welding",
    PAINTING = "painting",
    TESTING = "testing",
    INSPECTION = "inspection",
    PACKAGING = "packaging",
    STAMPING = "stamping",
    FORGING = "forging",
    CASTING = "casting",
    HEAT_TREATMENT = "heat_treatment",
    SURFACE_TREATMENT = "surface_treatment",
    CUTTING = "cutting",
    DRILLING = "drilling",
    GRINDING = "grinding",
    POLISHING = "polishing",
    BLAST_FURNACE = "blast_furnace",
    ELECTRIC_ARC_FURNACE = "electric_arc_furnace",
    LADLE_FURNACE = "ladle_furnace",
    CONTINUOUS_CASTING = "continuous_casting",
    HOT_ROLLING = "hot_rolling",
    COLD_ROLLING = "cold_rolling",
    GALVANIZING = "galvanizing",
    PICKLING = "pickling",
    PCB_FABRICATION = "pcb_fabrication",
    SMT_ASSEMBLY = "smt_assembly",
    WAVE_SOLDERING = "wave_soldering",
    REFLOW_SOLDERING = "reflow_soldering",
    ICT_TESTING = "ict_testing",
    FUNCTIONAL_TESTING = "functional_testing",
    SEMICONDUCTOR_FAB = "semiconductor_fab",
    WAFER_PROCESSING = "wafer_processing",
    DIE_BONDING = "die_bonding",
    WIRE_BONDING = "wire_bonding",
    ENCAPSULATION = "encapsulation",
    TRANSFORMER_WINDING = "transformer_winding",
    MOTOR_ASSEMBLY = "motor_assembly",
    CABLE_MANUFACTURING = "cable_manufacturing",
    SWITCH_ASSEMBLY = "switch_assembly",
    PANEL_ASSEMBLY = "panel_assembly",
    ELECTRICAL_TESTING = "electrical_testing",
    INSULATION_TESTING = "insulation_testing",
    APPLIANCE_ASSEMBLY = "appliance_assembly",
    FURNITURE_ASSEMBLY = "furniture_assembly",
    WOOD_PROCESSING = "wood_processing",
    UPHOLSTERY = "upholstery",
    FINISHING = "finishing",
    QUALITY_CONTROL = "quality_control",
    SPINNING = "spinning",
    WEAVING = "weaving",
    KNITTING = "knitting",
    DYEING = "dyeing",
    PRINTING = "printing",
    TEXTILE_FINISHING = "textile_finishing",
    CUTTING_SEWING = "cutting_sewing",
    EMBROIDERY = "embroidery",
    AEROSPACE_MACHINING = "aerospace_machining",
    COMPOSITE_MANUFACTURING = "composite_manufacturing",
    PRECISION_ASSEMBLY = "precision_assembly",
    NDT_TESTING = "ndt_testing",
    FINAL_INSPECTION = "final_inspection",
    FLIGHT_TESTING = "flight_testing"
}
export declare enum IndustryType {
    GENERAL = "general",
    REFINERY = "refinery",
    CHEMICAL = "chemical",
    PHARMACEUTICAL = "pharmaceutical",
    AUTOMOTIVE = "automotive",
    DEFENSE = "defense",
    FMCG = "fmcg",
    PESTICIDE = "pesticide",
    STEEL = "steel",
    ELECTRONICS = "electronics",
    TELECOMMUNICATIONS = "telecommunications",
    ELECTRICAL = "electrical",
    CONSUMER_GOODS = "consumer_goods",
    TEXTILE = "textile",
    PAPER = "paper",
    PLASTICS = "plastics",
    CEMENT = "cement",
    GLASS = "glass",
    RUBBER = "rubber",
    LEATHER = "leather",
    MINING = "mining",
    METALS = "metals",
    SHIPBUILDING = "shipbuilding",
    AEROSPACE = "aerospace",
    RENEWABLE_ENERGY = "renewable_energy"
}
export declare enum WorkCenterStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    BREAKDOWN = "breakdown",
    SETUP = "setup"
}
declare class SafetyRequirements {
    explosionProof?: boolean;
    hazardClassification?: string[];
    pressureRating?: number;
    temperatureRange?: {
        min: number;
        max: number;
    };
}
declare class ComplianceInfo {
    iso?: string[];
    regulations?: string[];
    lastAudit?: string;
}
export declare class CreateWorkCenterDto {
    code: string;
    name: string;
    type: WorkCenterType;
    industryType: IndustryType;
    status: WorkCenterStatus;
    description?: string;
    location?: string;
    capacity?: number;
    efficiency?: number;
    availability?: number;
    quality?: number;
    oeeScore?: number;
    isOperational?: boolean;
    capabilities?: string[];
    safetyCompliance?: boolean;
    gmpCompliant?: boolean;
    hazmatCompliant?: boolean;
    safetyRequirements?: SafetyRequirements;
    compliance?: ComplianceInfo;
    industrySpecific?: Record<string, any>;
    metadata?: Record<string, any>;
}
export {};
//# sourceMappingURL=create-work-center.dto.d.ts.map