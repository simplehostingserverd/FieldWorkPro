// Authentication middleware
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token) as { id: string; email: string };
      req.user = decoded;
      next();
    } catch (tokenError) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
    return;
  }
};

export default authenticate;
