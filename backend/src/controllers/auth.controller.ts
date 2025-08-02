// Authentication controller using database
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      message: 'Login successful',
      ...result
    });
  } catch (error: any) {
    res.status(401).json({ 
      message: error.message || 'Login failed' 
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a real app, you might want to blacklist the token
    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Logout failed' 
    });
  }
};
