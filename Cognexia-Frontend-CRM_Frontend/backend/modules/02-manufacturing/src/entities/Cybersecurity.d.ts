import { WorkCenter } from './WorkCenter';
export declare enum SecurityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    ULTRA_SECURE = "ultra_secure",
    QUANTUM_SECURE = "quantum_secure"
}
export declare enum ThreatLevel {
    MINIMAL = "minimal",
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    SEVERE = "severe",
    CRITICAL = "critical"
}
export declare enum IncidentStatus {
    DETECTED = "detected",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    MITIGATED = "mitigated",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum ComplianceFramework {
    NIST = "nist",
    ISO27001 = "iso27001",
    IEC62443 = "iec62443",
    SOC2 = "soc2",
    GDPR = "gdpr",
    HIPAA = "hipaa",
    PCI_DSS = "pci_dss",
    NERC_CIP = "nerc_cip"
}
export declare class Cybersecurity {
    id: string;
    securityCode: string;
    securityName: string;
    description: string;
    securityLevel: SecurityLevel;
    currentThreatLevel: ThreatLevel;
    complianceFramework: ComplianceFramework;
    securityInfrastructure: {
        firewalls: object[];
        intrusion: object[];
        antimalware: object[];
        encryption: object[];
        authentication: object[];
        authorization: object[];
        monitoring: object[];
        backup: object[];
    };
    networkSecurity: {
        segmentation: boolean;
        vlans: object[];
        dmz: boolean;
        vpn: object[];
        idsIps: object[];
        ddosProtection: boolean;
        trafficAnalysis: boolean;
        zeroTrust: boolean;
    };
    endpointSecurity: {
        antivirus: boolean;
        edr: boolean;
        deviceControl: boolean;
        patchManagement: boolean;
        privilegedAccess: boolean;
        mobileDeviceManagement: boolean;
        ueba: boolean;
    };
    identityManagement: {
        sso: boolean;
        mfa: boolean;
        pam: boolean;
        rbac: boolean;
        identityFederation: boolean;
        biometricAuth: boolean;
        zeroTrustAccess: boolean;
    };
    dataProtection: {
        encryption: object;
        dlp: boolean;
        backup: object;
        archival: object;
        dataClassification: object;
        privacyControls: object;
        anonymization: boolean;
        pseudonymization: boolean;
    };
    icsSecurity: {
        scadaSecurity: boolean;
        plcSecurity: boolean;
        hmiSecurity: boolean;
        industrialFirewall: boolean;
        protocolSecurity: object[];
        airGap: boolean;
        fieldDeviceSecurity: boolean;
    };
    iotSecurity: {
        deviceAuthentication: boolean;
        edgeComputing: boolean;
        meshNetworks: boolean;
        deviceManagement: boolean;
        firmwareSecurity: boolean;
        communicationSecurity: boolean;
        trustAnchors: boolean;
    };
    aiSecurity: {
        modelSecurity: boolean;
        dataPrivacy: boolean;
        adversarialDefense: boolean;
        federated: boolean;
        explainableAI: boolean;
        biasDetection: boolean;
        modelVerification: boolean;
    };
    quantumSecurityEnabled: boolean;
    quantumSecurity: {
        quantumKeyDistribution: boolean;
        postQuantumCryptography: boolean;
        quantumRandomGeneration: boolean;
        quantumEncryption: boolean;
        quantumAuthentication: boolean;
        quantumSigning: boolean;
    };
    blockchainSecurityEnabled: boolean;
    blockchainSecurity: {
        smartContractSecurity: boolean;
        consensusProtection: boolean;
        walletSecurity: boolean;
        transactionVerification: boolean;
        immutableAudit: boolean;
        decentralizedIdentity: boolean;
    };
    threatIntelligence: {
        feeds: string[];
        indicators: object[];
        attribution: object[];
        campaigns: object[];
        vulnerabilities: object[];
        mitreAttack: object[];
        threatHunting: boolean;
    };
    securityMonitoring: {
        siem: boolean;
        soar: boolean;
        ueba: boolean;
        realTimeMonitoring: boolean;
        anomalyDetection: boolean;
        threatDetection: boolean;
        incidentResponse: boolean;
    };
    vulnerabilityManagement: {
        scanning: boolean;
        assessment: object;
        penetrationTesting: boolean;
        redTeaming: boolean;
        bugBounty: boolean;
        patchManagement: object;
        riskAssessment: object;
    };
    incidentResponse: {
        playbooks: string[];
        team: object[];
        procedures: object[];
        communication: object;
        forensics: boolean;
        containment: object;
        recovery: object;
        lessonsLearned: object[];
    };
    securityTraining: {
        programs: string[];
        phishing: boolean;
        socialEngineering: boolean;
        compliance: object[];
        certifications: string[];
        metrics: object;
        simulations: boolean;
    };
    compliance: {
        frameworks: string[];
        audits: object[];
        assessments: object[];
        certifications: string[];
        policies: string[];
        procedures: string[];
        metrics: object;
    };
    riskManagement: {
        riskRegister: object[];
        assessments: object[];
        mitigation: object[];
        monitoring: object;
        reporting: object;
        treatment: object[];
        appetite: object;
    };
    securityMetrics: {
        incidents: number;
        vulnerabilities: number;
        patchingRate: number;
        trainingCompletion: number;
        complianceScore: number;
        riskScore: number;
        maturityLevel: number;
    };
    activeThreats: {
        threats: object[];
        incidents: object[];
        alerts: object[];
        investigations: object[];
        remediation: object[];
    };
    securityAutomation: {
        orchestration: boolean;
        playbooks: string[];
        workflows: object[];
        integration: object[];
        aiMl: boolean;
        responseAutomation: boolean;
    };
    businessContinuity: {
        drp: boolean;
        bcp: boolean;
        backup: object;
        recovery: object;
        testing: object[];
        rto: number;
        rpo: number;
    };
    vendorSecurity: {
        assessments: object[];
        contracts: object[];
        monitoring: boolean;
        riskManagement: object;
        compliance: object[];
        incidents: object[];
    };
    annualSecurityBudget: number;
    incidentCosts: number;
    complianceCosts: number;
    securityROI: {
        investments: number;
        avoidedCosts: number;
        productivity: number;
        reputation: number;
        compliance: number;
        roi: number;
    };
    securityArchitecture: {
        principles: string[];
        patterns: string[];
        controls: object[];
        frameworks: string[];
        standards: string[];
        reference: object;
    };
    emergingTechSecurity: {
        quantumComputing: boolean;
        artificialIntelligence: boolean;
        blockchain: boolean;
        iot: boolean;
        edge: boolean;
        cloud: boolean;
        containers: boolean;
        serverless: boolean;
    };
    securityCulture: {
        awareness: number;
        engagement: number;
        training: object;
        communication: object;
        leadership: object;
        metrics: object;
    };
    workCenterId: string;
    workCenter: WorkCenter;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    lastAuditedBy: string;
    lastAuditedAt: Date;
    getSecurityScore(): number;
    assessRiskLevel(): ThreatLevel;
    detectThreat(threatData: object): boolean;
    createIncident(incidentData: object): string;
    respondToIncident(incidentId: string, responseAction: object): boolean;
    runVulnerabilityAssessment(): object;
    implementQuantumSecurity(): boolean;
    enableBlockchainSecurity(): boolean;
    conductSecurityTraining(trainingType: string, participants: string[]): object;
    calculateComplianceScore(): number;
    generateSecurityReport(): object;
    private generateRecommendations;
    auditSecurity(auditorId: string): object;
    updateSecurityMetrics(metrics: object): void;
    clone(newSecurityCode: string): Partial<Cybersecurity>;
}
//# sourceMappingURL=Cybersecurity.d.ts.map