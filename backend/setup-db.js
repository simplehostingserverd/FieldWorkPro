const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connect to PostgreSQL server (not specific database)
const adminPool = new Pool({
  user: 'fieldpro_user',
  host: 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: 'fieldpro_password',
  port: 5432,
});

// Pool for the actual database
const dbPool = new Pool({
  user: 'fieldpro_user',
  host: 'localhost',
  database: 'fieldpro',
  password: 'fieldpro_password',
  port: 5432,
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up FieldPro database...');

    // Drop and recreate database for clean setup
    const adminClient = await adminPool.connect();
    try {
      // Terminate existing connections to the database
      await adminClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = 'fieldpro' AND pid <> pg_backend_pid()
      `);

      // Drop database if it exists
      await adminClient.query('DROP DATABASE IF EXISTS fieldpro');
      console.log('🗑️  Dropped existing database "fieldpro"');

      // Create fresh database
      await adminClient.query('CREATE DATABASE fieldpro');
      console.log('✅ Database "fieldpro" created successfully');
    } catch (error) {
      console.error('Error managing database:', error.message);
      throw error;
    }
    adminClient.release();
    await adminPool.end();

    // Connect to the actual database and run schema
    console.log('📋 Running database schema...');
    const dbClient = await dbPool.connect();

    // Read and execute the init.sql file
    const initSqlPath = path.join(__dirname, '..', 'database', 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      await dbClient.query(initSql);
      console.log('✅ Database schema created successfully');
    } else {
      console.log('⚠️  init.sql file not found, creating basic tables...');

      // Create basic tables if init.sql doesn't exist
      await dbClient.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO organizations (name, email) VALUES
        ('Acme Field Services', 'contact@acmefieldservices.com')
        ON CONFLICT (email) DO NOTHING;

        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(20) NOT NULL DEFAULT 'technician',
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Basic tables created');
    }

    dbClient.release();
    await dbPool.end();

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
