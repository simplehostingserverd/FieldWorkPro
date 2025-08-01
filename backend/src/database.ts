// Database configuration
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'fieldpro_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fieldpro',
  password: process.env.DB_PASSWORD || 'fieldpro_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default {
  query,
};
