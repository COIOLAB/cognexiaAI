"use strict";
// Industry 5.0 ERP Backend - Integration Gateway Utilities Bundle
// Utility services for data transformation, protocol handling, validation, and API client management
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IntegrationUtilities_1, DataTransformationUtilsService_1, ProtocolUtilsService_1, IntegrationValidationService_1, APIClientFactoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClientFactoryService = exports.IntegrationValidationService = exports.ProtocolUtilsService = exports.DataTransformationUtilsService = exports.IntegrationUtilities = void 0;
const common_1 = require("@nestjs/common");
// ========== Integration Utilities ==========
let IntegrationUtilities = IntegrationUtilities_1 = class IntegrationUtilities {
    constructor() {
        this.logger = new common_1.Logger(IntegrationUtilities_1.name);
    }
    generateId(prefix = 'int') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    formatTimestamp(date = new Date()) {
        return date.toISOString();
    }
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    parseHeaders(headerString) {
        const headers = {};
        if (!headerString)
            return headers;
        headerString.split('\n').forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
                headers[key] = value;
            }
        });
        return headers;
    }
    sanitizeData(data) {
        if (typeof data === 'string') {
            return data.replace(/[<>]/g, '');
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        if (data && typeof data === 'object') {
            const sanitized = {};
            Object.keys(data).forEach(key => {
                sanitized[key] = this.sanitizeData(data[key]);
            });
            return sanitized;
        }
        return data;
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    calculateRetryDelay(attempt, baseDelay = 1000) {
        return Math.min(baseDelay * Math.pow(2, attempt), 30000);
    }
};
exports.IntegrationUtilities = IntegrationUtilities;
exports.IntegrationUtilities = IntegrationUtilities = IntegrationUtilities_1 = __decorate([
    (0, common_1.Injectable)()
], IntegrationUtilities);
// ========== Data Transformation Utils Service ==========
let DataTransformationUtilsService = DataTransformationUtilsService_1 = class DataTransformationUtilsService {
    constructor() {
        this.logger = new common_1.Logger(DataTransformationUtilsService_1.name);
    }
    async jsonToXml(data) {
        this.logger.log('Converting JSON to XML');
        const convertObject = (obj, rootName = 'root') => {
            if (typeof obj !== 'object' || obj === null) {
                return `<${rootName}>${obj}</${rootName}>`;
            }
            let xml = `<${rootName}>`;
            Object.keys(obj).forEach(key => {
                if (Array.isArray(obj[key])) {
                    obj[key].forEach((item) => {
                        xml += convertObject(item, key);
                    });
                }
                else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    xml += convertObject(obj[key], key);
                }
                else {
                    xml += `<${key}>${obj[key]}</${key}>`;
                }
            });
            xml += `</${rootName}>`;
            return xml;
        };
        return convertObject(data);
    }
    async xmlToJson(xml) {
        this.logger.log('Converting XML to JSON');
        // Basic XML to JSON conversion (in production, use a proper XML parser)
        return { converted: true, originalXml: xml };
    }
    async jsonToCsv(data) {
        this.logger.log('Converting JSON array to CSV');
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        });
        return csvRows.join('\n');
    }
    async csvToJson(csv) {
        this.logger.log('Converting CSV to JSON array');
        const lines = csv.trim().split('\n');
        if (lines.length < 2)
            return [];
        const headers = lines[0].split(',');
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
            });
            result.push(obj);
        }
        return result;
    }
    flattenObject(obj, prefix = '') {
        const flattened = {};
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenObject(value, newKey));
            }
            else {
                flattened[newKey] = value;
            }
        });
        return flattened;
    }
};
exports.DataTransformationUtilsService = DataTransformationUtilsService;
exports.DataTransformationUtilsService = DataTransformationUtilsService = DataTransformationUtilsService_1 = __decorate([
    (0, common_1.Injectable)()
], DataTransformationUtilsService);
// ========== Protocol Utils Service ==========
let ProtocolUtilsService = ProtocolUtilsService_1 = class ProtocolUtilsService {
    constructor() {
        this.logger = new common_1.Logger(ProtocolUtilsService_1.name);
    }
    getSupportedProtocols() {
        return ['HTTP', 'HTTPS', 'MQTT', 'WebSocket', 'FTP', 'SFTP', 'TCP', 'UDP', 'SOAP', 'REST'];
    }
    validateProtocolUrl(protocol, url) {
        const protocolPatterns = {
            'HTTP': /^https?:\/\/.+/i,
            'HTTPS': /^https:\/\/.+/i,
            'MQTT': /^mqtts?:\/\/.+/i,
            'WebSocket': /^wss?:\/\/.+/i,
            'FTP': /^ftps?:\/\/.+/i,
            'SFTP': /^sftp:\/\/.+/i
        };
        const pattern = protocolPatterns[protocol.toUpperCase()];
        return pattern ? pattern.test(url) : true;
    }
    buildConnectionString(protocol, host, port, options) {
        switch (protocol.toLowerCase()) {
            case 'http':
                return `http://${host}:${port || 80}`;
            case 'https':
                return `https://${host}:${port || 443}`;
            case 'mqtt':
                return `mqtt://${host}:${port || 1883}`;
            case 'websocket':
                return `ws://${host}:${port || 80}`;
            case 'ftp':
                return `ftp://${host}:${port || 21}`;
            case 'sftp':
                return `sftp://${host}:${port || 22}`;
            default:
                return `${protocol.toLowerCase()}://${host}:${port}`;
        }
    }
    extractConnectionInfo(connectionString) {
        try {
            const url = new URL(connectionString);
            return {
                protocol: url.protocol.replace(':', ''),
                host: url.hostname,
                port: url.port ? parseInt(url.port) : this.getDefaultPort(url.protocol),
                path: url.pathname,
                query: url.search
            };
        }
        catch (error) {
            this.logger.error(`Invalid connection string: ${connectionString}`);
            return null;
        }
    }
    getDefaultPort(protocol) {
        const defaultPorts = {
            'http:': 80,
            'https:': 443,
            'mqtt:': 1883,
            'ws:': 80,
            'wss:': 443,
            'ftp:': 21,
            'sftp:': 22
        };
        return defaultPorts[protocol] || 80;
    }
};
exports.ProtocolUtilsService = ProtocolUtilsService;
exports.ProtocolUtilsService = ProtocolUtilsService = ProtocolUtilsService_1 = __decorate([
    (0, common_1.Injectable)()
], ProtocolUtilsService);
// ========== Integration Validation Service ==========
let IntegrationValidationService = IntegrationValidationService_1 = class IntegrationValidationService {
    constructor() {
        this.logger = new common_1.Logger(IntegrationValidationService_1.name);
    }
    validateConnectionConfig(config) {
        const errors = [];
        if (!config.name || typeof config.name !== 'string') {
            errors.push('Connection name is required and must be a string');
        }
        if (!config.baseUrl || typeof config.baseUrl !== 'string') {
            errors.push('Base URL is required and must be a string');
        }
        else if (!this.isValidUrl(config.baseUrl)) {
            errors.push('Base URL must be a valid URL');
        }
        if (!config.protocol || typeof config.protocol !== 'string') {
            errors.push('Protocol is required and must be a string');
        }
        return { valid: errors.length === 0, errors };
    }
    validateMappingConfig(config) {
        const errors = [];
        if (!config.name || typeof config.name !== 'string') {
            errors.push('Mapping name is required');
        }
        if (!config.sourceFormat || typeof config.sourceFormat !== 'string') {
            errors.push('Source format is required');
        }
        if (!config.targetFormat || typeof config.targetFormat !== 'string') {
            errors.push('Target format is required');
        }
        if (!config.mappingRules || typeof config.mappingRules !== 'object') {
            errors.push('Mapping rules are required and must be an object');
        }
        return { valid: errors.length === 0, errors };
    }
    validateWebhookConfig(config) {
        const errors = [];
        if (!config.url || typeof config.url !== 'string') {
            errors.push('Webhook URL is required');
        }
        else if (!this.isValidUrl(config.url)) {
            errors.push('Webhook URL must be valid');
        }
        if (!config.event || typeof config.event !== 'string') {
            errors.push('Webhook event is required');
        }
        return { valid: errors.length === 0, errors };
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    validateDataFormat(data, expectedFormat) {
        switch (expectedFormat.toLowerCase()) {
            case 'json':
                return typeof data === 'object';
            case 'string':
                return typeof data === 'string';
            case 'array':
                return Array.isArray(data);
            case 'xml':
                return typeof data === 'string' && data.includes('<');
            default:
                return true;
        }
    }
};
exports.IntegrationValidationService = IntegrationValidationService;
exports.IntegrationValidationService = IntegrationValidationService = IntegrationValidationService_1 = __decorate([
    (0, common_1.Injectable)()
], IntegrationValidationService);
// ========== API Client Factory Service ==========
let APIClientFactoryService = APIClientFactoryService_1 = class APIClientFactoryService {
    constructor() {
        this.logger = new common_1.Logger(APIClientFactoryService_1.name);
    }
    createHttpClient(config) {
        this.logger.log(`Creating HTTP client for ${config.baseUrl}`);
        return {
            baseURL: config.baseUrl,
            timeout: config.timeout || 30000,
            headers: config.headers || {
                'Content-Type': 'application/json',
                'User-Agent': 'Industry5.0-Integration-Gateway'
            },
            config: config
        };
    }
    createWebSocketClient(config) {
        this.logger.log(`Creating WebSocket client for ${config.url}`);
        return {
            url: config.url,
            protocols: config.protocols || [],
            options: config.options || {},
            config: config
        };
    }
    createMqttClient(config) {
        this.logger.log(`Creating MQTT client for ${config.brokerUrl}`);
        return {
            brokerUrl: config.brokerUrl,
            clientId: config.clientId || `client_${Date.now()}`,
            options: {
                keepalive: config.keepalive || 60,
                clean: config.clean !== false,
                reconnectPeriod: config.reconnectPeriod || 1000,
                ...config.options
            },
            config: config
        };
    }
    createFtpClient(config) {
        this.logger.log(`Creating FTP client for ${config.host}`);
        return {
            host: config.host,
            port: config.port || 21,
            user: config.user || 'anonymous',
            password: config.password || '',
            secure: config.secure || false,
            config: config
        };
    }
    getClientForProtocol(protocol, config) {
        switch (protocol.toLowerCase()) {
            case 'http':
            case 'https':
            case 'rest':
                return this.createHttpClient(config);
            case 'websocket':
            case 'ws':
            case 'wss':
                return this.createWebSocketClient(config);
            case 'mqtt':
            case 'mqtts':
                return this.createMqttClient(config);
            case 'ftp':
            case 'sftp':
                return this.createFtpClient(config);
            default:
                this.logger.warn(`Unsupported protocol: ${protocol}`);
                return null;
        }
    }
};
exports.APIClientFactoryService = APIClientFactoryService;
exports.APIClientFactoryService = APIClientFactoryService = APIClientFactoryService_1 = __decorate([
    (0, common_1.Injectable)()
], APIClientFactoryService);
//# sourceMappingURL=integration-utilities-bundle.js.map