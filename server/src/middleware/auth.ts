import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { User, UserRole } from '../types/index.js';

const JWT_SECRET = 'telecom-network-secret-key-2024';

interface AuthenticatedRequest extends Request {
  user?: User;
}

function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      regionCode: user.regionCode,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未提供认证令牌' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: '无效或已过期的认证令牌' });
  }
}

function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未认证' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: '权限不足' });
      return;
    }

    next();
  };
}

function canAccessRegion(user: User, regionCode: string): boolean {
  if (user.role === 'headquarters') {
    return true;
  }

  if (user.role === 'province') {
    const userProvinceCode = user.regionCode.substring(0, 2);
    const targetProvinceCode = regionCode.substring(0, 2);
    return userProvinceCode === targetProvinceCode;
  }

  if (user.role === 'city') {
    const userCityCode = user.regionCode.substring(0, 4);
    const targetCityCode = regionCode.substring(0, 4);
    return userCityCode === targetCityCode;
  }

  return false;
}

export {
  JWT_SECRET,
  generateToken,
  authenticate,
  requireRole,
  canAccessRegion,
  AuthenticatedRequest,
};
