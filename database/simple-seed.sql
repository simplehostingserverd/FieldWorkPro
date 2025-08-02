-- Simple seed data for FieldPro application
-- Add realistic customers
INSERT INTO customers (organization_id, first_name, last_name, email, phone, address, city, state, zip_code, notes) VALUES 
((SELECT id FROM organizations LIMIT 1), 'Robert', 'Smith', 'robert.smith@email.com', '512-555-1001', '123 Oak Street', 'Austin', 'TX', '78701', 'Preferred customer - always pays on time'),
((SELECT id FROM organizations LIMIT 1), 'Jennifer', 'Davis', 'jennifer.davis@email.com', '512-555-1002', '456 Pine Avenue', 'Austin', 'TX', '78702', 'Has two HVAC units - main and guest house'),
((SELECT id FROM organizations LIMIT 1), 'Michael', 'Wilson', 'michael.wilson@email.com', '512-555-1003', '789 Maple Drive', 'Austin', 'TX', '78703', 'New construction - warranty work'),
((SELECT id FROM organizations LIMIT 1), 'Emily', 'Brown', 'emily.brown@email.com', '512-555-1004', '321 Cedar Lane', 'Austin', 'TX', '78704', 'Senior citizen discount applied'),
((SELECT id FROM organizations LIMIT 1), 'James', 'Taylor', 'james.taylor@email.com', '512-555-1005', '654 Birch Court', 'Austin', 'TX', '78705', 'Commercial property manager'),
((SELECT id FROM organizations LIMIT 1), 'Maria', 'Garcia', 'maria.garcia@restaurant.com', '512-555-1006', '987 Business Blvd', 'Austin', 'TX', '78706', 'Restaurant - requires after-hours service'),
((SELECT id FROM organizations LIMIT 1), 'Thomas', 'Anderson', 'thomas.anderson@office.com', '512-555-1007', '147 Corporate Way', 'Austin', 'TX', '78707', 'Office building - 24/7 HVAC requirements'),
((SELECT id FROM organizations LIMIT 1), 'Linda', 'Martinez', 'linda.martinez@retail.com', '512-555-1008', '258 Shopping Center Dr', 'Austin', 'TX', '78708', 'Retail store - seasonal maintenance contract'),
((SELECT id FROM organizations LIMIT 1), 'Christopher', 'Lee', 'chris.lee@warehouse.com', '512-555-1009', '369 Industrial Park', 'Austin', 'TX', '78709', 'Large warehouse - multiple units'),
((SELECT id FROM organizations LIMIT 1), 'Amanda', 'White', 'amanda.white@medical.com', '512-555-1010', '741 Medical Plaza', 'Austin', 'TX', '78710', 'Medical facility - critical temperature control');

-- Add inventory items
INSERT INTO inventory (organization_id, name, description, sku, category, unit_cost, unit_price, quantity_in_stock, reorder_level) VALUES 
((SELECT id FROM organizations LIMIT 1), 'Air Filter 16x25x1', 'Standard pleated air filter', 'AF-16-25-1', 'HVAC', 8.50, 18.99, 150, 25),
((SELECT id FROM organizations LIMIT 1), 'Air Filter 20x25x1', 'Standard pleated air filter', 'AF-20-25-1', 'HVAC', 9.75, 21.99, 120, 20),
((SELECT id FROM organizations LIMIT 1), 'Thermostat Digital', 'Programmable digital thermostat', 'TH-DIG-001', 'HVAC', 45.00, 89.99, 35, 10),
((SELECT id FROM organizations LIMIT 1), 'Capacitor 45/5 MFD', 'Dual run capacitor 45/5 MFD 440V', 'CAP-45-5', 'HVAC', 12.50, 28.99, 75, 15),
((SELECT id FROM organizations LIMIT 1), 'Contactor 30A', '30 Amp 24V coil contactor', 'CON-30A', 'HVAC', 18.75, 42.99, 45, 10),
((SELECT id FROM organizations LIMIT 1), 'Refrigerant R-410A', 'R-410A refrigerant 25lb cylinder', 'REF-410A-25', 'HVAC', 125.00, 275.00, 12, 3),
((SELECT id FROM organizations LIMIT 1), 'Ductwork 6" Round', '6 inch round galvanized ductwork per foot', 'DUCT-6R', 'HVAC', 3.25, 7.50, 200, 50),
((SELECT id FROM organizations LIMIT 1), 'Blower Motor 1/2 HP', '1/2 HP blower motor 115V', 'BM-05HP', 'HVAC', 185.00, 395.00, 8, 2),
((SELECT id FROM organizations LIMIT 1), 'Wire Nuts Assorted', 'Assorted wire nuts pack of 100', 'WN-ASST', 'Electrical', 5.25, 12.99, 85, 20),
((SELECT id FROM organizations LIMIT 1), 'Electrical Tape', 'Black electrical tape 3/4" x 60ft', 'ET-BLK', 'Electrical', 2.15, 4.99, 95, 25);

-- Add equipment
INSERT INTO equipment (organization_id, name, description, serial_number, category, status) VALUES 
((SELECT id FROM organizations LIMIT 1), 'Service Van #1', 'Ford Transit 250 - Primary service vehicle', 'FT250-2023-001', 'Vehicle', 'in_use'),
((SELECT id FROM organizations LIMIT 1), 'Service Van #2', 'Ford Transit 250 - Secondary service vehicle', 'FT250-2023-002', 'Vehicle', 'in_use'),
((SELECT id FROM organizations LIMIT 1), 'Service Van #3', 'Ford Transit 250 - Backup service vehicle', 'FT250-2022-003', 'Vehicle', 'available'),
((SELECT id FROM organizations LIMIT 1), 'Manifold Gauge Set #1', 'Digital manifold gauge set with hoses', 'MGS-DIG-001', 'Tools', 'in_use'),
((SELECT id FROM organizations LIMIT 1), 'Manifold Gauge Set #2', 'Digital manifold gauge set with hoses', 'MGS-DIG-002', 'Tools', 'in_use'),
((SELECT id FROM organizations LIMIT 1), 'Recovery Machine', 'Refrigerant recovery machine', 'REC-MACH-001', 'Tools', 'available'),
((SELECT id FROM organizations LIMIT 1), 'Vacuum Pump', '6 CFM vacuum pump', 'VAC-PUMP-001', 'Tools', 'in_use'),
((SELECT id FROM organizations LIMIT 1), 'Multimeter Digital', 'Digital multimeter with leads', 'MM-DIG-001', 'Tools', 'available'),
((SELECT id FROM organizations LIMIT 1), 'Drill Set Professional', 'Professional cordless drill set', 'DRILL-PRO-001', 'Tools', 'in_use'),
((SELECT id FROM organizations LIMIT 1), 'Laptop Field Service', 'Rugged laptop for field technicians', 'LAPTOP-001', 'Electronics', 'in_use');

-- Add jobs
INSERT INTO jobs (organization_id, customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code, notes) VALUES 
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'robert.smith@email.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'AC Unit Maintenance', 'Annual maintenance on central AC unit', 'completed', 'medium', '2024-07-15', '09:00:00', '11:30:00', '123 Oak Street', 'Austin', 'TX', '78701', 'Maintenance completed successfully'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'jennifer.davis@email.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Thermostat Replacement', 'Replace old thermostat with digital unit', 'completed', 'medium', '2024-07-18', '14:00:00', '15:30:00', '456 Pine Avenue', 'Austin', 'TX', '78702', 'Installation completed successfully'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'michael.wilson@email.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Emergency AC Repair', 'AC unit not cooling - emergency service', 'completed', 'high', '2024-07-20', '16:30:00', '18:45:00', '789 Maple Drive', 'Austin', 'TX', '78703', 'Replaced faulty capacitor'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'emily.brown@email.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Ductwork Inspection', 'Inspect and clean ductwork system', 'in_progress', 'medium', '2024-08-02', '10:00:00', '13:00:00', '321 Cedar Lane', 'Austin', 'TX', '78704', 'Currently in progress'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'james.taylor@email.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Commercial HVAC Service', 'Quarterly maintenance on commercial HVAC', 'scheduled', 'medium', '2024-08-05', '08:00:00', '12:00:00', '654 Birch Court', 'Austin', 'TX', '78705', 'Scheduled quarterly maintenance'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'maria.garcia@restaurant.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Restaurant AC Emergency', 'Restaurant AC failed during lunch rush', 'scheduled', 'high', '2024-08-03', '11:00:00', '14:00:00', '987 Business Blvd', 'Austin', 'TX', '78706', 'Emergency repair for restaurant'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'thomas.anderson@office.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Office Building Maintenance', 'Monthly maintenance on office building HVAC', 'scheduled', 'low', '2024-08-10', '07:00:00', '11:00:00', '147 Corporate Way', 'Austin', 'TX', '78707', 'Regular monthly maintenance'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'linda.martinez@retail.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Retail Store AC Install', 'Install new AC unit for retail expansion', 'scheduled', 'medium', '2024-08-12', '09:00:00', '17:00:00', '258 Shopping Center Dr', 'Austin', 'TX', '78708', 'New installation project'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'chris.lee@warehouse.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Warehouse HVAC Repair', 'Multiple units down in warehouse', 'scheduled', 'high', '2024-08-04', '06:00:00', '18:00:00', '369 Industrial Park', 'Austin', 'TX', '78709', 'Multiple unit repair'),
((SELECT id FROM organizations LIMIT 1), (SELECT id FROM customers WHERE email = 'amanda.white@medical.com'), (SELECT id FROM users WHERE role = 'technician' LIMIT 1), 'Medical Facility Critical Repair', 'Critical temperature control system repair', 'scheduled', 'high', '2024-08-03', '05:00:00', '09:00:00', '741 Medical Plaza', 'Austin', 'TX', '78710', 'Critical repair for medical facility');
