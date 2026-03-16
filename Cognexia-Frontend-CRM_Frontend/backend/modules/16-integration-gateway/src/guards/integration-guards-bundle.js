"use strict";
// Industry 5.0 ERP Backend - Integration Gateway Guards Bundle
// Security, authentication, rate limiting, and validation guards
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidationGuard = exports.RateLimitGuard = exports.APIAuthenticationGuard = exports.IntegrationSecurityGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
// ========== Integration Security Guard ==========
let IntegrationSecurityGuard = class IntegrationSecurityGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Basic security validation
        const userAgent = request.headers['user-agent'];
        if (!userAgent || userAgent.includes('curl')) {
            // Allow for development but log
            console.log('Warning: Basic user agent detected');
        }
        // Check for required security headers
        const authorization = request.headers.authorization;
        if (!authorization && process.env.NODE_ENV === 'production') {
            throw new common_1.UnauthorizedException('Missing authorization header');
        }
        // Add basic user context if not exists
        if (!request.user) {
            request.user = {
                id: 'system-user',
                role: 'integration',
                permissions: ['integration:read', 'integration:write']
            };
        }
        return true;
    }
};
exports.IntegrationSecurityGuard = IntegrationSecurityGuard;
exports.IntegrationSecurityGuard = IntegrationSecurityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], IntegrationSecurityGuard);
// ========== API Authentication Guard ==========
let APIAuthenticationGuard = class APIAuthenticationGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Check for API key or bearer token
        const apiKey = request.headers['x-api-key'];
        const authorization = request.headers.authorization;
        if (!apiKey && !authorization) {
            // In development, allow without strict auth
            if (process.env.NODE_ENV === 'development') {
                console.log('Warning: No authentication provided, allowing in development mode');
                return true;
            }
            throw new common_1.UnauthorizedException('API key or authorization token required');
        }
        // Validate API key format (basic validation)
        if (apiKey && apiKey.length < 10) {
            throw new common_1.UnauthorizedException('Invalid API key format');
        }
        // Validate bearer token format
        if (authorization && !authorization.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Invalid authorization format');
        }
        return true;
    }
};
exports.APIAuthenticationGuard = APIAuthenticationGuard;
exports.APIAuthenticationGuard = APIAuthenticationGuard = __decorate([
    (0, common_1.Injectable)()
], APIAuthenticationGuard);
// ========== Rate Limit Guard ==========
let RateLimitGuard = class RateLimitGuard {
    constructor() {
        this.requestCounts = new Map();
        this.DEFAULT_LIMIT = 1000;
        this.WINDOW_MS = 3600000; // 1 hour
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Get client identifier (IP + API key)
        const clientId = this.getClientId(request);
        const now = Date.now();
        // Clean up expired entries
        this.cleanup(now);
        // Get or initialize client data
        const clientData = this.requestCounts.get(clientId) || {
            count: 0,
            resetTime: now + this.WINDOW_MS
        };
        // Check if rate limit exceeded
        if (clientData.count >= this.DEFAULT_LIMIT) {
            throw new common_1.BadRequestException('Rate limit exceeded. Try again later.');
        }
        // Increment counter
        clientData.count++;
        this.requestCounts.set(clientId, clientData);
        // Add rate limit headers to response
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-RateLimit-Limit', this.DEFAULT_LIMIT);
        response.setHeader('X-RateLimit-Remaining', this.DEFAULT_LIMIT - clientData.count);
        response.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());
        return true;
    }
    getClientId(request) {
        const ip = request.ip || request.socket.remoteAddress || 'unknown';
        const apiKey = request.headers['x-api-key'];
        return `${ip}:${apiKey || 'anonymous'}`;
    }
    cleanup(now) {
        for (const [clientId, data] of this.requestCounts.entries()) {
            if (now > data.resetTime) {
                this.requestCounts.delete(clientId);
            }
        }
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)()
], RateLimitGuard);
// ========== Data Validation Guard ==========
let DataValidationGuard = class DataValidationGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Validate request has proper content-type for POST/PUT requests
        const method = request.method;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const contentType = request.headers['content-type'];
            if (!contentType) {
                throw new common_1.BadRequestException('Content-Type header is required');
            }
            if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
                throw new common_1.BadRequestException('Unsupported Content-Type. Use application/json or multipart/form-data');
            }
            // Basic body validation
            if (contentType.includes('application/json') && !request.body) {
                throw new common_1.BadRequestException('Request body is required for JSON requests');
            }
        }
        // Validate required query parameters for GET requests
        if (method === 'GET') {
            const requiredParams = this.getRequiredParams(request.path);
            for (const param of requiredParams) {
                if (!request.query[param]) {
                    throw new common_1.BadRequestException(`Required query parameter missing: ${param}`);
                }
            }
        }
        return true;
    }
    getRequiredParams(path) {
        // Define required parameters based on path patterns
        if (path.includes('/sync')) {
            return []; // No required params for sync endpoints in this example
        }
        if (path.includes('/analytics')) {
            return []; // Could require 'timeRange' or other params
        }
        return [];
    }
};
exports.DataValidationGuard = DataValidationGuard;
exports.DataValidationGuard = DataValidationGuard = __decorate([
    (0, common_1.Injectable)()
], DataValidationGuard);
//# sourceMappingURL=integration-guards-bundle.js.map