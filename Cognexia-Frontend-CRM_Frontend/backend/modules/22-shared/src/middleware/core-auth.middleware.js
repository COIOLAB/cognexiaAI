"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // Skip authentication for health check and public endpoints
    const publicPaths = ['/health', '/api-docs'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
    }
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        // For development, allow requests without token
        if (process.env.NODE_ENV !== 'production') {
            req.user = {
                id: 'dev_user_001',
                username: 'developer',
                role: 'SUPER_ADMIN',
                permissions: ['*']
            };
            return next();
        }
        return res.status(401).json({
            success: false,
            message: 'Access token is required',
            timestamp: new Date().toISOString(),
            requestId: req.requestId
        });
    }
    try {
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            timestamp: new Date().toISOString(),
            requestId: req.requestId
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=core-auth.middleware.js.map