-- Seed realistic data for FieldPro application
-- Clear existing data first
DELETE FROM payments;
DELETE FROM invoices;
DELETE FROM jobs;
DELETE FROM equipment;
DELETE FROM inventory;
DELETE FROM customers;
DELETE FROM users;
DELETE FROM organizations;

-- Insert organizations
INSERT INTO organizations (id, name, address, phone, email, website) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'ProField Services LLC', '1234 Industrial Blvd, Austin, TX 78701', '512-555-0100', 'contact@profieldservices.com', 'www.profieldservices.com'),
('550e8400-e29b-41d4-a716-446655440001', 'Elite HVAC Solutions', '5678 Commerce Dr, Dallas, TX 75201', '214-555-0200', 'info@elitehvac.com', 'www.elitehvac.com');

-- Insert users with proper bcrypt hashes
INSERT INTO users (id, organization_id, first_name, last_name, email, phone, role, password_hash) VALUES 
-- ProField Services users
('97392eae-95c9-468c-92eb-9b40ac632d41', '550e8400-e29b-41d4-a716-446655440000', 'John', 'Admin', 'admin@fieldpro.com', '512-555-0101', 'admin', '$2b$10$sKCcLdDF7nU8IQx1RGE5vuUdxUXNSSjJjdIRGQCgkAyMltzYz.2Zu'),
('2046f851-b15e-479a-b4a2-58a0a0255020', '550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Manager', 'manager@fieldpro.com', '512-555-0102', 'manager', '$2b$10$dmtB/A5beDMOsGL3n3AKoOVUERroIXOCD5YolfQwVwQPopoURj1jS'),
('8307030d-bbd5-42ea-90f4-9b67426dd2b6', '550e8400-e29b-41d4-a716-446655440000', 'Mike', 'Rodriguez', 'tech@fieldpro.com', '512-555-0103', 'technician', '$2b$10$W89U34xxsb35oxmhTT97Z.30HajEitHYQCg.AOjYbLqqHsqjYdtq2'),
('8307030d-bbd5-42ea-90f4-9b67426dd2b7', '550e8400-e29b-41d4-a716-446655440000', 'David', 'Johnson', 'david.johnson@fieldpro.com', '512-555-0104', 'technician', '$2b$10$W89U34xxsb35oxmhTT97Z.30HajEitHYQCg.AOjYbLqqHsqjYdtq2'),
('8307030d-bbd5-42ea-90f4-9b67426dd2b8', '550e8400-e29b-41d4-a716-446655440000', 'Lisa', 'Chen', 'lisa.chen@fieldpro.com', '512-555-0105', 'technician', '$2b$10$W89U34xxsb35oxmhTT97Z.30HajEitHYQCg.AOjYbLqqHsqjYdtq2');

-- Insert customers
INSERT INTO customers (id, organization_id, first_name, last_name, email, phone, address, city, state, zip_code, notes) VALUES 
-- Residential customers
('c1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'Robert', 'Smith', 'robert.smith@email.com', '512-555-1001', '123 Oak Street', 'Austin', 'TX', '78701', 'Preferred customer - always pays on time'),
('c1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'Jennifer', 'Davis', 'jennifer.davis@email.com', '512-555-1002', '456 Pine Avenue', 'Austin', 'TX', '78702', 'Has two HVAC units - main and guest house'),
('c1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'Michael', 'Wilson', 'michael.wilson@email.com', '512-555-1003', '789 Maple Drive', 'Austin', 'TX', '78703', 'New construction - warranty work'),
('c1000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'Emily', 'Brown', 'emily.brown@email.com', '512-555-1004', '321 Cedar Lane', 'Austin', 'TX', '78704', 'Senior citizen discount applied'),
('c1000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'James', 'Taylor', 'james.taylor@email.com', '512-555-1005', '654 Birch Court', 'Austin', 'TX', '78705', 'Commercial property manager'),
-- Commercial customers
('c1000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'Maria', 'Garcia', 'maria.garcia@restaurant.com', '512-555-1006', '987 Business Blvd', 'Austin', 'TX', '78706', 'Restaurant - requires after-hours service'),
('c1000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', 'Thomas', 'Anderson', 'thomas.anderson@office.com', '512-555-1007', '147 Corporate Way', 'Austin', 'TX', '78707', 'Office building - 24/7 HVAC requirements'),
('c1000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', 'Linda', 'Martinez', 'linda.martinez@retail.com', '512-555-1008', '258 Shopping Center Dr', 'Austin', 'TX', '78708', 'Retail store - seasonal maintenance contract'),
('c1000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', 'Christopher', 'Lee', 'chris.lee@warehouse.com', '512-555-1009', '369 Industrial Park', 'Austin', 'TX', '78709', 'Large warehouse - multiple units'),
('c1000000-0000-0000-0000-000000000010', '550e8400-e29b-41d4-a716-446655440000', 'Amanda', 'White', 'amanda.white@medical.com', '512-555-1010', '741 Medical Plaza', 'Austin', 'TX', '78710', 'Medical facility - critical temperature control');

-- Insert inventory items (using gen_random_uuid() for IDs)
INSERT INTO inventory (organization_id, name, description, sku, category, unit_cost, unit_price, quantity_in_stock, reorder_level) VALUES
-- HVAC Parts
('550e8400-e29b-41d4-a716-446655440000', 'Air Filter 16x25x1', 'Standard pleated air filter', 'AF-16-25-1', 'HVAC', 8.50, 18.99, 150, 25),
('550e8400-e29b-41d4-a716-446655440000', 'Air Filter 20x25x1', 'Standard pleated air filter', 'AF-20-25-1', 'HVAC', 9.75, 21.99, 120, 20),
('550e8400-e29b-41d4-a716-446655440000', 'Thermostat Digital', 'Programmable digital thermostat', 'TH-DIG-001', 'HVAC', 45.00, 89.99, 35, 10),
('550e8400-e29b-41d4-a716-446655440000', 'Capacitor 45/5 MFD', 'Dual run capacitor 45/5 MFD 440V', 'CAP-45-5', 'HVAC', 12.50, 28.99, 75, 15),
('550e8400-e29b-41d4-a716-446655440000', 'Contactor 30A', '30 Amp 24V coil contactor', 'CON-30A', 'HVAC', 18.75, 42.99, 45, 10),
('550e8400-e29b-41d4-a716-446655440000', 'Refrigerant R-410A', 'R-410A refrigerant 25lb cylinder', 'REF-410A-25', 'HVAC', 125.00, 275.00, 12, 3),
('550e8400-e29b-41d4-a716-446655440000', 'Ductwork 6" Round', '6 inch round galvanized ductwork per foot', 'DUCT-6R', 'HVAC', 3.25, 7.50, 200, 50),
('550e8400-e29b-41d4-a716-446655440000', 'Blower Motor 1/2 HP', '1/2 HP blower motor 115V', 'BM-05HP', 'HVAC', 185.00, 395.00, 8, 2),
-- Tools and Supplies
('550e8400-e29b-41d4-a716-446655440000', 'Wire Nuts Assorted', 'Assorted wire nuts pack of 100', 'WN-ASST', 'Electrical', 5.25, 12.99, 85, 20),
('550e8400-e29b-41d4-a716-446655440000', 'Electrical Tape', 'Black electrical tape 3/4" x 60ft', 'ET-BLK', 'Electrical', 2.15, 4.99, 95, 25);

-- Insert equipment
INSERT INTO equipment (organization_id, name, description, serial_number, category, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Service Van #1', 'Ford Transit 250 - Primary service vehicle', 'FT250-2023-001', 'Vehicle', 'in_use'),
('550e8400-e29b-41d4-a716-446655440000', 'Service Van #2', 'Ford Transit 250 - Secondary service vehicle', 'FT250-2023-002', 'Vehicle', 'in_use'),
('550e8400-e29b-41d4-a716-446655440000', 'Service Van #3', 'Ford Transit 250 - Backup service vehicle', 'FT250-2022-003', 'Vehicle', 'available'),
('550e8400-e29b-41d4-a716-446655440000', 'Manifold Gauge Set #1', 'Digital manifold gauge set with hoses', 'MGS-DIG-001', 'Tools', 'in_use'),
('550e8400-e29b-41d4-a716-446655440000', 'Manifold Gauge Set #2', 'Digital manifold gauge set with hoses', 'MGS-DIG-002', 'Tools', 'in_use'),
('550e8400-e29b-41d4-a716-446655440000', 'Recovery Machine', 'Refrigerant recovery machine', 'REC-MACH-001', 'Tools', 'available'),
('550e8400-e29b-41d4-a716-446655440000', 'Vacuum Pump', '6 CFM vacuum pump', 'VAC-PUMP-001', 'Tools', 'in_use'),
('550e8400-e29b-41d4-a716-446655440000', 'Multimeter Digital', 'Digital multimeter with leads', 'MM-DIG-001', 'Tools', 'available'),
('550e8400-e29b-41d4-a716-446655440000', 'Drill Set Professional', 'Professional cordless drill set', 'DRILL-PRO-001', 'Tools', 'in_use'),
('550e8400-e29b-41d4-a716-446655440000', 'Laptop Field Service', 'Rugged laptop for field technicians', 'LAPTOP-001', 'Electronics', 'in_use');

-- Insert jobs
INSERT INTO jobs (organization_id, customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code, notes) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000001', '8307030d-bbd5-42ea-90f4-9b67426dd2b6', 'AC Unit Maintenance', 'Annual maintenance on central AC unit - clean coils, replace filter, check refrigerant levels', 'completed', 'medium', '2024-07-15', '09:00:00', '11:30:00', '123 Oak Street', 'Austin', 'TX', '78701', 'Found low refrigerant, added 2lbs R-410A. Customer satisfied.'),
('j1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000002', '8307030d-bbd5-42ea-90f4-9b67426dd2b7', 'Thermostat Replacement', 'Replace old thermostat with programmable digital unit', 'completed', 'medium', '2024-07-18', '14:00:00', '15:30:00', '456 Pine Avenue', 'Austin', 'TX', '78702', 90, 90, 'Installation completed successfully. Customer trained on new features.'),
('j1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000003', '8307030d-bbd5-42ea-90f4-9b67426dd2b6', 'Emergency AC Repair', 'AC unit not cooling - emergency service call', 'completed', 'high', '2024-07-20', '16:30:00', '18:45:00', '789 Maple Drive', 'Austin', 'TX', '78703', 90, 135, 'Replaced faulty capacitor. System restored to full operation.'),
('j1000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000004', '8307030d-bbd5-42ea-90f4-9b67426dd2b8', 'Ductwork Inspection', 'Inspect and clean ductwork system', 'in_progress', 'medium', '2024-08-02', '10:00:00', '13:00:00', '321 Cedar Lane', 'Austin', 'TX', '78704', 180, NULL, 'Currently in progress - found some minor leaks to seal.'),
('j1000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000005', '8307030d-bbd5-42ea-90f4-9b67426dd2b6', 'Commercial HVAC Service', 'Quarterly maintenance on commercial HVAC system', 'scheduled', 'medium', '2024-08-05', '08:00:00', '12:00:00', '654 Birch Court', 'Austin', 'TX', '78705', 240, NULL, 'Scheduled quarterly maintenance for commercial property.'),
('j1000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000006', '8307030d-bbd5-42ea-90f4-9b67426dd2b7', 'Restaurant AC Emergency', 'Restaurant AC failed during lunch rush', 'scheduled', 'high', '2024-08-03', '11:00:00', '14:00:00', '987 Business Blvd', 'Austin', 'TX', '78706', 180, NULL, 'Emergency repair for restaurant - priority service.'),
('j1000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000007', '8307030d-bbd5-42ea-90f4-9b67426dd2b8', 'Office Building Maintenance', 'Monthly maintenance on office building HVAC', 'scheduled', 'low', '2024-08-10', '07:00:00', '11:00:00', '147 Corporate Way', 'Austin', 'TX', '78707', 240, NULL, 'Regular monthly maintenance contract.'),
('j1000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000008', '8307030d-bbd5-42ea-90f4-9b67426dd2b6', 'Retail Store AC Install', 'Install new AC unit for retail expansion', 'scheduled', 'medium', '2024-08-12', '09:00:00', '17:00:00', '258 Shopping Center Dr', 'Austin', 'TX', '78708', 480, NULL, 'New installation for store expansion project.'),
('j1000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000009', '8307030d-bbd5-42ea-90f4-9b67426dd2b7', 'Warehouse HVAC Repair', 'Multiple units down in warehouse facility', 'scheduled', 'high', '2024-08-04', '06:00:00', '18:00:00', '369 Industrial Park', 'Austin', 'TX', '78709', 720, NULL, 'Multiple unit repair - full day job.'),
('j1000000-0000-0000-0000-000000000010', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000010', '8307030d-bbd5-42ea-90f4-9b67426dd2b8', 'Medical Facility Critical Repair', 'Critical temperature control system repair', 'scheduled', 'high', '2024-08-03', '05:00:00', '09:00:00', '741 Medical Plaza', 'Austin', 'TX', '78710', 240, NULL, 'Critical repair for medical facility - early morning service.');

-- Insert invoices
INSERT INTO invoices (id, organization_id, customer_id, job_id, invoice_number, issue_date, due_date, subtotal, tax_amount, total_amount, status, notes) VALUES
('inv1000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000001', 'INV-2024-001', '2024-07-15', '2024-08-14', 285.00, 23.28, 308.28, 'paid', 'Annual maintenance completed successfully'),
('inv1000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000002', 'j1000000-0000-0000-0000-000000000002', 'INV-2024-002', '2024-07-18', '2024-08-17', 189.99, 15.52, 205.51, 'paid', 'Thermostat replacement and installation'),
('inv1000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000003', 'j1000000-0000-0000-0000-000000000003', 'INV-2024-003', '2024-07-20', '2024-08-19', 178.99, 14.62, 193.61, 'paid', 'Emergency repair - capacitor replacement'),
('inv1000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000004', 'j1000000-0000-0000-0000-000000000004', 'INV-2024-004', '2024-08-02', '2024-09-01', 425.00, 34.75, 459.75, 'pending', 'Ductwork inspection and cleaning'),
('inv1000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000006', NULL, 'INV-2024-005', '2024-07-25', '2024-08-24', 1250.00, 102.13, 1352.13, 'overdue', 'Monthly service contract - Restaurant'),
('inv1000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000007', NULL, 'INV-2024-006', '2024-07-30', '2024-08-29', 850.00, 69.45, 919.45, 'sent', 'Office building maintenance contract'),
('inv1000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000008', NULL, 'INV-2024-007', '2024-07-28', '2024-08-27', 675.50, 55.17, 730.67, 'draft', 'Retail store seasonal maintenance'),
('inv1000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000009', NULL, 'INV-2024-008', '2024-07-22', '2024-08-21', 2150.00, 175.63, 2325.63, 'paid', 'Warehouse quarterly maintenance'),
('inv1000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000010', NULL, 'INV-2024-009', '2024-07-26', '2024-08-25', 1875.00, 153.13, 2028.13, 'sent', 'Medical facility maintenance contract'),
('inv1000-0000-0000-0000-000000000010', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000005', NULL, 'INV-2024-010', '2024-07-31', '2024-08-30', 495.00, 40.46, 535.46, 'pending', 'Commercial property maintenance');

-- Insert payments
INSERT INTO payments (id, organization_id, customer_id, invoice_id, amount, payment_date, payment_method, reference_number, notes) VALUES
('p1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000001', 'inv1000-0000-0000-0000-000000000001', 308.28, '2024-07-20', 'credit_card', 'CC-789456123', 'Paid via credit card online'),
('p1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000002', 'inv1000-0000-0000-0000-000000000002', 205.51, '2024-07-25', 'check', 'CHK-1234', 'Check payment received'),
('p1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000003', 'inv1000-0000-0000-0000-000000000003', 193.61, '2024-07-22', 'cash', 'CASH-001', 'Cash payment on completion'),
('p1000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000009', 'inv1000-0000-0000-0000-000000000008', 2325.63, '2024-07-30', 'bank_transfer', 'ACH-987654321', 'ACH transfer from business account'),
('p1000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000001', NULL, 150.00, '2024-07-10', 'credit_card', 'CC-555666777', 'Partial payment on account'),
('p1000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000002', NULL, 100.00, '2024-07-12', 'check', 'CHK-5678', 'Payment on account'),
('p1000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000005', NULL, 250.00, '2024-07-15', 'credit_card', 'CC-111222333', 'Advance payment'),
('p1000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000007', NULL, 500.00, '2024-07-18', 'bank_transfer', 'ACH-123456789', 'Monthly contract payment'),
('p1000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000008', NULL, 300.00, '2024-07-20', 'check', 'CHK-9999', 'Partial payment'),
('p1000000-0000-0000-0000-000000000010', '550e8400-e29b-41d4-a716-446655440000', 'c1000000-0000-0000-0000-000000000010', NULL, 1000.00, '2024-07-25', 'bank_transfer', 'ACH-456789123', 'Contract deposit payment');
