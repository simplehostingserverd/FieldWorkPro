// Authentication controller
import { Request, Response } from 'express';
import { UserAuth, CreateUser } from '../models/User';
import { generateToken } from '../config/auth';

// Mock database for demonstration
const users: any[] = [];

export const register = async (req: Request, res: Response) => {
  try {
    const userData: CreateUser = req.body;
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user (in a real app, hash the password)
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    
    // Generate JWT token
    const token = generateToken({ id: newUser.id, email: newUser.email });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const credentials: UserAuth = req.body;
    
    // Find user (in a real app, validate hashed password)
    const user = users.find(user => 
      user.email === credentials.email && 
      user.password === credentials.password
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a real app, invalidate the token
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};

export default {
  register,
  login,
  logout
};
