// Authentication service
import bcrypt from 'bcrypt';
import { UserAuth, CreateUser } from './User';
import { generateToken, verifyToken } from './auth';
import { query } from './database';

// In a real application, use at least 10 rounds
const SALT_ROUNDS = 10;

export const registerUser = async (userData: CreateUser) => {
  try {
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [
      userData.email,
    ]);

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Get the first organization (for demo purposes)
    const orgResult = await query('SELECT id FROM organizations LIMIT 1');
    const organizationId = orgResult.rows[0]?.id;

    if (!organizationId) {
      throw new Error('No organization found. Please contact administrator.');
    }

    // Create new user
    const result = await query(
      'INSERT INTO users (organization_id, first_name, last_name, email, phone, role, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id, first_name, last_name, email, role',
      [
        organizationId,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.phone,
        userData.role,
        hashedPassword,
      ]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    throw new Error(`Error registering user: ${error.message}`);
  }
};

export const loginUser = async (credentials: UserAuth) => {
  try {
    // Find user by email
    const result = await query(
      'SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE email = $1',
      [credentials.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

export const verifyUserToken = async (token: string) => {
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default {
  registerUser,
  loginUser,
  verifyUserToken,
};
