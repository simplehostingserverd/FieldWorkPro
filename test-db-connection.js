// test-db-connection.js
// Simple script to test the database connection

const { Client } = require('pg');

// Database configuration
const config = {
  host: 'localhost',
  port: 5432,
  database: 'fieldpro',
  user: 'fieldpro_user',
  password: 'fieldpro_password',
};

async function testConnection() {
  const client = new Client(config);
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Successfully connected to the FieldPro database!');
    
    // Test query - get list of tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nDatabase tables:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Test query - get sample data from organizations
    const orgRes = await client.query('SELECT id, name, email FROM organizations');
    console.log('\nOrganizations:');
    orgRes.rows.forEach(row => {
      console.log(`- ${row.name} (${row.email})`);
    });
    
    console.log('\nDatabase setup is working correctly!');
  } catch (err) {
    console.error('Error connecting to database:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
