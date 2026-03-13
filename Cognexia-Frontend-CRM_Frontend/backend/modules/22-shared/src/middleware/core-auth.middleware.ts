import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  }
};
