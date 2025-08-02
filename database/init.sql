-- FieldPro Database Initialization Script
-- This script creates the initial database schema

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'technician')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'ach', 'other')),
    payment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    unit_cost DECIMAL(10, 2),
    unit_price DECIMAL(10, 2),
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add integration fields to existing tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS quickbooks_id VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS hubspot_contact_id VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS qb_created_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS qb_updated_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_created_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS hubspot_synced_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_number VARCHAR(50) UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_duration INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS actual_duration INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS parts_cost DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_signature TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS technician_notes TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hubspot_deal_id VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hubspot_synced_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS ferguson_sku VARCHAR(100);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    serial_number VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    purchase_date DATE,
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_technician_id ON jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_organization_id ON inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_equipment_organization_id ON equipment(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_serial_number ON equipment(serial_number);

-- Insert sample data for testing
INSERT INTO organizations (name, email) VALUES 
('Acme Field Services', 'contact@acmefieldservices.com'),
('Global Maintenance Corp', 'info@globalmaintenance.com');

-- Insert sample users with real bcrypt hashes
-- Passwords: admin123, manager123, tech123
INSERT INTO users (organization_id, first_name, last_name, email, phone, role, password_hash) VALUES
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'John', 'Admin', 'admin@fieldpro.com', '555-1234', 'admin', '$2b$10$sKCcLdDF7nU8IQx1RGE5vuUdxUXNSSjJjdIRGQCgkAyMltzYz.2Zu'),
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Jane', 'Manager', 'manager@fieldpro.com', '555-5678', 'manager', '$2b$10$dmtB/A5beDMOsGL3n3AKoOVUERroIXOCD5YolfQwVwQPopoURj1jS'),
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Bob', 'Technician', 'tech@fieldpro.com', '555-9012', 'technician', '$2b$10$W89U34xxsb35oxmhTT97Z.30HajEitHYQCg.AOjYbLqqHsqjYdtq2');

-- Insert sample customers
INSERT INTO customers (organization_id, first_name, last_name, email, phone, address, city, state, zip_code) VALUES 
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Alice', 'Smith', 'alice@example.com', '555-1111', '123 Main St', 'Anytown', 'CA', '12345'),
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Charlie', 'Brown', 'charlie@example.com', '555-2222', '456 Oak Ave', 'Another City', 'NY', '67890');

-- Insert sample jobs
INSERT INTO jobs (organization_id, customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code) VALUES 
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 
 (SELECT id FROM customers WHERE email = 'alice@example.com'), 
 (SELECT id FROM users WHERE email = 'tech@acmefieldservices.com'), 
 'AC Installation', 
 'Install new air conditioning unit in living room', 
 'scheduled', 
 'high', 
 CURRENT_DATE + INTERVAL '1 day', 
 '09:00:00', 
 '12:00:00', 
 '123 Main St', 
 'Anytown', 
 'CA', 
 '12345');

-- Insert sample inventory items
INSERT INTO inventory (organization_id, name, description, sku, category, unit_cost, unit_price, quantity_in_stock) VALUES 
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Air Filter', 'Standard HVAC air filter', 'AF-STD-001', 'HVAC', 5.99, 12.99, 50),
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Thermostat', 'Digital programmable thermostat', 'TH-DIG-001', 'HVAC', 25.50, 49.99, 25);

-- Insert sample equipment
INSERT INTO equipment (organization_id, name, description, serial_number, category, status) VALUES 
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Drill Set', 'Professional drill set with accessories', 'DR-PRO-001', 'Tools', 'available'),
((SELECT id FROM organizations WHERE name = 'Acme Field Services'), 'Laptop', 'Field service laptop for technicians', 'LP-FLD-001', 'Electronics', 'in_use');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
