import { TwinType, TwinStatus } from '../entities/DigitalTwin';
export declare class CreateDigitalTwinDto {
    twinCode: string;
    twinName: string;
    description?: string;
    type: TwinType;
    status?: TwinStatus;
    physicalAsset: object;
    digitalModel: object;
    dataSources?: object;
    realTimeSync?: object;
    aiIntegration?: object;
    performance?: number;
    accuracy?: number;
    simulationParameters?: object;
    physicsModels?: object;
    analytics?: object;
    digitalThread?: object;
    lifecycle?: object;
    resourceManagement?: object;
    quantumComputingEnabled?: boolean;
    quantumComputing?: object;
    blockchainEnabled?: boolean;
    blockchain?: object;
    cybersecuritySettings?: object;
    edgeComputing?: object;
    cloudComputing?: object;
    createdBy?: string;
}
//# sourceMappingURL=create-digital-twin.dto.d.ts.map