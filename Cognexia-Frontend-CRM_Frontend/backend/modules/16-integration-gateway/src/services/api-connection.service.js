"use strict";
// Industry 5.0 ERP Backend - API Connection Service
// Managing external API connections, authentication, and requests
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var APIConnectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIConnectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const APIConnection_1 = require("../entities/APIConnection");
const IntegrationLog_1 = require("../entities/IntegrationLog");
const APICredential_1 = require("../entities/APICredential");
let APIConnectionService = APIConnectionService_1 = class APIConnectionService {
    constructor(connectionRepository, logRepository, credentialRepository, httpService) {
        this.connectionRepository = connectionRepository;
        this.logRepository = logRepository;
        this.credentialRepository = credentialRepository;
        this.httpService = httpService;
        this.logger = new common_1.Logger(APIConnectionService_1.name);
    }
    async createConnection(createDto, user) {
        try {
            this.logger.log(`Creating new API connection: ${createDto.name}`);
            const connection = this.connectionRepository.create({
                ...createDto,
                createdBy: user?.id,
                status: 'inactive',
                lastTested: null,
            });
            const savedConnection = await this.connectionRepository.save(connection);
            // Create associated credentials if provided
            if (createDto.credentials) {
                await this.createCredentials(savedConnection.id, createDto.credentials);
            }
            await this.logActivity('CONNECTION_CREATED', `API connection ${createDto.name} created`, savedConnection.id);
            return savedConnection;
        }
        catch (error) {
            this.logger.error(`Error creating API connection: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to create API connection');
        }
    }
    async getConnections(query) {
        try {
            const queryBuilder = this.connectionRepository.createQueryBuilder('connection')
                .leftJoinAndSelect('connection.credentials', 'credentials');
            if (query.status) {
                queryBuilder.andWhere('connection.status = :status', { status: query.status });
            }
            if (query.protocol) {
                queryBuilder.andWhere('connection.protocol = :protocol', { protocol: query.protocol });
            }
            if (query.userId) {
                queryBuilder.andWhere('connection.createdBy = :userId', { userId: query.userId });
            }
            if (query.page && query.limit) {
                queryBuilder
                    .skip((query.page - 1) * query.limit)
                    .take(query.limit);
            }
            const connections = await queryBuilder.getMany();
            // Remove sensitive credential data
            return connections.map(conn => ({
                ...conn,
                credentials: conn.credentials?.map(cred => ({ ...cred, value: '[HIDDEN]' }))
            }));
        }
        catch (error) {
            this.logger.error(`Error fetching API connections: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to fetch API connections');
        }
    }
    async getConnectionById(id) {
        try {
            const connection = await this.connectionRepository.findOne({
                where: { id },
                relations: ['credentials', 'logs']
            });
            if (!connection) {
                return null;
            }
            // Hide sensitive credential values
            if (connection.credentials) {
                connection.credentials = connection.credentials.map(cred => ({
                    ...cred,
                    value: '[HIDDEN]'
                }));
            }
            return connection;
        }
        catch (error) {
            this.logger.error(`Error fetching API connection ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to fetch API connection');
        }
    }
    async updateConnection(id, updateDto, user) {
        try {
            const connection = await this.connectionRepository.findOne({ where: { id } });
            if (!connection) {
                throw new common_1.NotFoundException('API connection not found');
            }
            Object.assign(connection, {
                ...updateDto,
                updatedAt: new Date(),
                updatedBy: user?.id,
            });
            const savedConnection = await this.connectionRepository.save(connection);
            // Update credentials if provided
            if (updateDto.credentials) {
                await this.updateCredentials(id, updateDto.credentials);
            }
            await this.logActivity('CONNECTION_UPDATED', `API connection ${connection.name} updated`, id);
            return savedConnection;
        }
        catch (error) {
            this.logger.error(`Error updating API connection ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to update API connection');
        }
    }
    async deleteConnection(id, user) {
        try {
            const connection = await this.connectionRepository.findOne({ where: { id } });
            if (!connection) {
                throw new common_1.NotFoundException('API connection not found');
            }
            // Delete associated credentials
            await this.credentialRepository.delete({ connectionId: id });
            // Delete the connection
            await this.connectionRepository.delete(id);
            await this.logActivity('CONNECTION_DELETED', `API connection ${connection.name} deleted`, id);
        }
        catch (error) {
            this.logger.error(`Error deleting API connection ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to delete API connection');
        }
    }
    async testConnection(id) {
        const startTime = Date.now();
        try {
            const connection = await this.connectionRepository.findOne({
                where: { id },
                relations: ['credentials']
            });
            if (!connection) {
                throw new common_1.NotFoundException('API connection not found');
            }
            // Prepare test request
            const testEndpoint = connection.testEndpoint || connection.baseUrl + '/health';
            const headers = await this.buildHeaders(connection);
            // Execute test request
            const response = await this.httpService.axiosRef.get(testEndpoint, {
                headers,
                timeout: 10000,
                validateStatus: () => true // Don't throw on non-2xx status codes
            });
            const latency = Date.now() - startTime;
            const success = response.status >= 200 && response.status < 300;
            // Update connection status
            await this.connectionRepository.update(id, {
                status: success ? 'active' : 'error',
                lastTested: new Date(),
                lastTestResult: success ? 'success' : 'failed'
            });
            const result = {
                success,
                latency,
                status: response.status.toString(),
                message: success ? 'Connection test successful' : `HTTP ${response.status}: ${response.statusText}`,
                timestamp: new Date()
            };
            await this.logActivity(success ? 'CONNECTION_TEST_SUCCESS' : 'CONNECTION_TEST_FAILED', `Connection test result: ${result.message}`, id);
            return result;
        }
        catch (error) {
            const latency = Date.now() - startTime;
            this.logger.error(`Connection test failed for ${id}: ${error.message}`, error.stack);
            await this.connectionRepository.update(id, {
                status: 'error',
                lastTested: new Date(),
                lastTestResult: 'failed'
            });
            const result = {
                success: false,
                latency,
                status: 'error',
                message: error.message,
                timestamp: new Date()
            };
            await this.logActivity('CONNECTION_TEST_FAILED', `Connection test failed: ${error.message}`, id);
            return result;
        }
    }
    async executeRequest(id, requestDto) {
        try {
            const connection = await this.connectionRepository.findOne({
                where: { id },
                relations: ['credentials']
            });
            if (!connection) {
                throw new common_1.NotFoundException('API connection not found');
            }
            if (connection.status !== 'active') {
                throw new common_1.BadRequestException('API connection is not active');
            }
            const url = `${connection.baseUrl}${requestDto.endpoint}`;
            const headers = {
                ...await this.buildHeaders(connection),
                ...requestDto.headers
            };
            const response = await this.httpService.axiosRef.request({
                method: requestDto.method.toLowerCase(),
                url,
                headers,
                data: requestDto.body,
                timeout: requestDto.timeout || 30000
            });
            await this.logActivity('REQUEST_EXECUTED', `API request executed: ${requestDto.method} ${requestDto.endpoint}`, id);
            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data
            };
        }
        catch (error) {
            this.logger.error(`API request execution failed for ${id}: ${error.message}`, error.stack);
            await this.logActivity('REQUEST_FAILED', `API request failed: ${error.message}`, id);
            throw new common_1.BadRequestException(`API request failed: ${error.message}`);
        }
    }
    async getConnectionLogs(id, filters) {
        try {
            const queryBuilder = this.logRepository.createQueryBuilder('log')
                .where('log.connectionId = :id', { id })
                .orderBy('log.timestamp', 'DESC');
            if (filters?.from) {
                queryBuilder.andWhere('log.timestamp >= :from', { from: filters.from });
            }
            if (filters?.to) {
                queryBuilder.andWhere('log.timestamp <= :to', { to: filters.to });
            }
            if (filters?.level) {
                queryBuilder.andWhere('log.level = :level', { level: filters.level });
            }
            return await queryBuilder.limit(100).getMany();
        }
        catch (error) {
            this.logger.error(`Error fetching logs for connection ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to fetch connection logs');
        }
    }
    async createCredentials(connectionId, credentials) {
        const credentialEntities = credentials.map(cred => this.credentialRepository.create({
            ...cred,
            connectionId,
            encrypted: true // Implement encryption in production
        }));
        await this.credentialRepository.save(credentialEntities);
    }
    async updateCredentials(connectionId, credentials) {
        // Delete existing credentials
        await this.credentialRepository.delete({ connectionId });
        // Create new credentials
        await this.createCredentials(connectionId, credentials);
    }
    async buildHeaders(connection) {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Industry5.0-ERP-Integration-Gateway'
        };
        // Add authentication headers based on credentials
        if (connection.credentials) {
            for (const credential of connection.credentials) {
                switch (credential.type) {
                    case 'bearer_token':
                        headers['Authorization'] = `Bearer ${credential.value}`;
                        break;
                    case 'api_key':
                        headers[credential.keyName || 'X-API-Key'] = credential.value;
                        break;
                    case 'basic_auth':
                        const [username, password] = credential.value.split(':');
                        headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
                        break;
                }
            }
        }
        return headers;
    }
    async logActivity(activity, message, connectionId) {
        try {
            const log = this.logRepository.create({
                connectionId,
                activity,
                message,
                level: 'info',
                timestamp: new Date()
            });
            await this.logRepository.save(log);
        }
        catch (error) {
            this.logger.error(`Failed to log activity: ${error.message}`, error.stack);
        }
    }
};
exports.APIConnectionService = APIConnectionService;
exports.APIConnectionService = APIConnectionService = APIConnectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(APIConnection_1.APIConnection)),
    __param(1, (0, typeorm_1.InjectRepository)(IntegrationLog_1.IntegrationLog)),
    __param(2, (0, typeorm_1.InjectRepository)(APICredential_1.APICredential)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService])
], APIConnectionService);
//# sourceMappingURL=api-connection.service.js.map