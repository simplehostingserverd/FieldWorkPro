const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'fieldpro_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fieldpro_db',
  password: process.env.DB_PASSWORD || 'fieldpro_password',
  port: process.env.DB_PORT || 5432,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executed successfully:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Database connection test completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
