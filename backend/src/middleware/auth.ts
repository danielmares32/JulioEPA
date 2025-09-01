import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

// Simple in-memory user cache with TTL
interface CachedUser {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiry: number;
}

const userCache = new Map<string, CachedUser>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    
    // Check cache first
    const cached = userCache.get(userId);
    if (cached && cached.expiry > Date.now()) {
      req.user = cached.user;
      return next();
    }
    
    // Get user from database to ensure they still exist and are active
    const result = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      // Remove from cache if user not found
      userCache.delete(userId);
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    const user = result.rows[0];
    
    // Cache the user data
    userCache.set(userId, {
      user,
      expiry: Date.now() + CACHE_TTL
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Cache management functions
export const clearUserCache = (userId?: string) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
};

export const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [userId, cached] of userCache.entries()) {
    if (cached.expiry <= now) {
      userCache.delete(userId);
    }
  }
};

// Clean expired cache every 10 minutes
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// Get cache statistics
export const getUserCacheStats = () => {
  return {
    size: userCache.size,
    entries: Array.from(userCache.keys()).length
  };
};