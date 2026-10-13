-- LifeDrone: Seed Data for Prakasam District, Andhra Pradesh, India
-- Note: Demo & illustrative data for pilot simulation

USE lifedrone;

-- 1. HOSPITALS SEED
INSERT INTO hospitals (id, name, code, address, district, state, latitude, longitude, contact_phone, contact_email, emergency_contact, is_approved) VALUES
(1, 'RIMS Government General Hospital', 'HOSP-RIMS-ONG', 'Collectorate Road, RIMS Campus, Ongole', 'Prakasam', 'Andhra Pradesh', 15.5057000, 80.0499000, '+91-8592-280100', 'emergency@rimsongole.in', 'Dr. Ramesh K. (Chief Medical Officer)', TRUE),
(2, 'KIMS Hospital & Research Centre', 'HOSP-KIMS-ONG', 'NH-16 Bypass Road, Muktinuthalapadu, Ongole', 'Prakasam', 'Andhra Pradesh', 15.5186000, 80.0355000, '+91-8592-234567', 'icu@kimsongole.org', 'Dr. Suresh V. (Emergency Head)', TRUE),
(3, 'Area Hospital Chirala', 'HOSP-CHIRALA-AH', 'Bypass Road, Near Clock Tower, Chirala', 'Prakasam', 'Andhra Pradesh', 15.8246000, 80.3522000, '+91-8594-222100', 'trauma@areahospitalchirala.gov.in', 'Dr. Radhika N. (Resident Doctor)', TRUE),
(4, 'Area Hospital Markapur', 'HOSP-MARKAPUR-AH', 'Station Road, Beside Sub-Jail, Markapur', 'Prakasam', 'Andhra Pradesh', 15.7350000, 79.2700000, '+91-8596-224400', 'er@areahospitalmarkapur.gov.in', 'Dr. Srinivas T. (Casualty In-Charge)', TRUE),
(5, 'Area Hospital Kandukur', 'HOSP-KANDUKUR-AH', 'Pamur Road, Opposite Police Station, Kandukur', 'Prakasam', 'Andhra Pradesh', 15.2167000, 79.9042000, '+91-8598-223300', 'duty@kandukurgovthosp.in', 'Dr. Madhav Rao (Emergency Ward)', TRUE);

-- 2. BLOOD BANKS SEED
INSERT INTO blood_banks (id, name, code, address, district, state, latitude, longitude, contact_phone, contact_email, license_number, is_approved) VALUES
(1, 'Indian Red Cross Society Blood Centre', 'BB-RC-ONG', 'Red Cross Bhavan, Lawyerpet, Ongole', 'Prakasam', 'Andhra Pradesh', 15.5030000, 80.0450000, '+91-8592-233445', 'info@redcrossongole.org', 'AP-PRAKASAM-BB-041', TRUE),
(2, 'RIMS Model Blood Bank', 'BB-RIMS-ONG', '1st Floor, Clinical Diagnostic Block, RIMS, Ongole', 'Prakasam', 'Andhra Pradesh', 15.5060000, 80.0510000, '+91-8592-280145', 'bloodcentre@rimsongole.in', 'AP-PRAKASAM-BB-019', TRUE),
(3, 'Rotary Club Central Blood Bank Chirala', 'BB-ROT-CHIRALA', 'Rotary Complex, Gandhi Road, Chirala', 'Prakasam', 'Andhra Pradesh', 15.8200000, 80.3500000, '+91-8594-233990', 'donations@chiralarotaryblood.org', 'AP-PRAKASAM-BB-088', TRUE),
(4, 'Markapur Regional Blood Storage & Centre', 'BB-REG-MARKAPUR', 'Hospital Road, NGO Colony, Markapur', 'Prakasam', 'Andhra Pradesh', 15.7330000, 79.2680000, '+91-8596-225588', 'contact@markapurblood.org', 'AP-PRAKASAM-BB-102', TRUE);

-- 3. USERS SEED (password for all: Password@123)
-- Hash: $2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm
INSERT INTO users (id, institution_type, institution_id, full_name, email, password_hash, role, phone_number, is_active) VALUES
-- Hospital 1: RIMS Ongole
(1, 'HOSPITAL', 1, 'Dr. Ramesh Kumar', 'hospital.admin@lifedrone.io', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'HOSPITAL_ADMIN', '+91-9876543210', TRUE),
(2, 'HOSPITAL', 1, 'Nurse Anita Sharma', 'hospital.receiver@lifedrone.io', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'HOSPITAL_RECEIVER', '+91-9876543211', TRUE),
-- Blood Bank 1: Indian Red Cross Society Ongole
(3, 'BLOOD_BANK', 1, 'Dr. B. V. Reddy', 'bloodbank.admin@lifedrone.io', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'BLOOD_BANK_ADMIN', '+91-9876543220', TRUE),
(4, 'BLOOD_BANK', 1, 'Officer Kavitha Raman', 'bloodbank.authorizer@lifedrone.io', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'BLOOD_BANK_AUTHORIZER', '+91-9876543221', TRUE),
-- Additional Hospital 2 (KIMS) users
(5, 'HOSPITAL', 2, 'Dr. Suresh Varma', 'admin@kimsongole.org', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'HOSPITAL_ADMIN', '+91-9876543212', TRUE),
(6, 'HOSPITAL', 2, 'Staff Incharge Mohan', 'receiver@kimsongole.org', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'HOSPITAL_RECEIVER', '+91-9876543213', TRUE),
-- Additional Blood Bank 2 (RIMS Model Blood Bank) users
(7, 'BLOOD_BANK', 2, 'Dr. Prakash Narayan', 'admin@rimsblood.org', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'BLOOD_BANK_ADMIN', '+91-9876543222', TRUE),
(8, 'BLOOD_BANK', 2, 'Quality In-charge Deepa', 'auth@rimsblood.org', '$2b$10$rl8nERLPhqVKxmvZUSiQheS4DAXARge5K/1PkZv4DStpoJsdFZgQm', 'BLOOD_BANK_AUTHORIZER', '+91-9876543223', TRUE);

-- 4. BLOOD INVENTORY SEED
INSERT INTO blood_inventory (id, blood_bank_id, blood_group, blood_component, available_quantity, reserved_quantity, unit, batch_number, collection_date, expiry_date, storage_temperature, storage_requirement, status) VALUES
-- Red Cross Ongole (Bank 1)
(1, 1, 'O+', 'Packed Red Blood Cells', 14, 0, 'Units', 'PRBC-2026-089', DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_ADD(CURDATE(), INTERVAL 29 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(2, 1, 'O-', 'Packed Red Blood Cells', 6, 0, 'Units', 'PRBC-2026-092', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_ADD(CURDATE(), INTERVAL 31 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(3, 1, 'A+', 'Packed Red Blood Cells', 18, 0, 'Units', 'PRBC-2026-095', DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_ADD(CURDATE(), INTERVAL 27 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(4, 1, 'A-', 'Packed Red Blood Cells', 4, 0, 'Units', 'PRBC-2026-097', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 33 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(5, 1, 'B+', 'Packed Red Blood Cells', 22, 0, 'Units', 'PRBC-2026-101', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(6, 1, 'B-', 'Packed Red Blood Cells', 5, 0, 'Units', 'PRBC-2026-103', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 32 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(7, 1, 'AB+', 'Packed Red Blood Cells', 8, 0, 'Units', 'PRBC-2026-108', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 28 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(8, 1, 'AB-', 'Packed Red Blood Cells', 3, 0, 'Units', 'PRBC-2026-110', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 34 DAY), '+2°C to +6°C', 'Monitored refrigerated blood storage chamber', 'AVAILABLE'),
(9, 1, 'O+', 'Platelets', 9, 0, 'Units', 'PLT-2026-201', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), '+20°C to +24°C', 'Continuous agitation platelet incubator', 'AVAILABLE'),
(10, 1, 'B+', 'Platelets', 7, 0, 'Units', 'PLT-2026-204', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), '+20°C to +24°C', 'Continuous agitation platelet incubator', 'AVAILABLE'),
(11, 1, 'O+', 'Fresh Frozen Plasma', 16, 0, 'Units', 'FFP-2026-302', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 340 DAY), '-18°C or below', 'Ultra-low deep freezer', 'AVAILABLE'),
(12, 1, 'A+', 'Whole Blood', 11, 0, 'Units', 'WB-2026-401', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), '+2°C to +6°C', 'Quarantine and inspected blood bank storage', 'AVAILABLE'),

-- RIMS Model Blood Bank (Bank 2)
(13, 2, 'O+', 'Packed Red Blood Cells', 20, 0, 'Units', 'RIMS-PRBC-01', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 32 DAY), '+2°C to +6°C', 'Hospital certified blood storage unit', 'AVAILABLE'),
(14, 2, 'O-', 'Packed Red Blood Cells', 8, 0, 'Units', 'RIMS-PRBC-02', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 33 DAY), '+2°C to +6°C', 'Hospital certified blood storage unit', 'AVAILABLE'),
(15, 2, 'B+', 'Packed Red Blood Cells', 15, 0, 'Units', 'RIMS-PRBC-03', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_ADD(CURDATE(), INTERVAL 31 DAY), '+2°C to +6°C', 'Hospital certified blood storage unit', 'AVAILABLE'),
(16, 2, 'AB+', 'Platelets', 5, 0, 'Units', 'RIMS-PLT-01', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), '+20°C to +24°C', 'Continuous agitation platelet incubator', 'AVAILABLE'),

-- Chirala Rotary Blood Bank (Bank 3)
(17, 3, 'O+', 'Packed Red Blood Cells', 12, 0, 'Units', 'ROT-PRBC-01', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), '+2°C to +6°C', 'Standard blood bank refrigerator', 'AVAILABLE'),
(18, 3, 'A+', 'Packed Red Blood Cells', 10, 0, 'Units', 'ROT-PRBC-02', DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_ADD(CURDATE(), INTERVAL 29 DAY), '+2°C to +6°C', 'Standard blood bank refrigerator', 'AVAILABLE');

-- 5. ROUTE NODES (Prakasam Drone Flight Corridors)
INSERT INTO route_nodes (id, node_code, name, latitude, longitude, altitude_meters, node_type, entity_id) VALUES
('1', 'VERT-BB-RC', 'Red Cross Ongole Vertiport', 15.5030000, 80.0450000, 45, 'BLOOD_BANK_VERTIPORT', 1),
('2', 'VERT-HOSP-RIMS', 'RIMS Hospital Helipad/Vertipad', 15.5057000, 80.0499000, 50, 'HOSPITAL_VERTIPORT', 1),
('3', 'VERT-HOSP-KIMS', 'KIMS Hospital Vertiport', 15.5186000, 80.0355000, 55, 'HOSPITAL_VERTIPORT', 2),
('4', 'VERT-BB-RIMS', 'RIMS Blood Bank Pad', 15.5060000, 80.0510000, 48, 'BLOOD_BANK_VERTIPORT', 2),
('5', 'WP-ONG-NORTH', 'Ongole North Aerial Waypoint', 15.5350000, 80.0600000, 75, 'CORRIDOR_WAYPOINT', NULL),
('6', 'WP-ONG-SOUTH', 'Ongole South Aerial Corridor', 15.4800000, 80.0300000, 75, 'CORRIDOR_WAYPOINT', NULL),
('7', 'WP-MED-CORR-1', 'Central Medical Skyway Node Alpha', 15.5100000, 80.0420000, 80, 'CORRIDOR_WAYPOINT', NULL),
('8', 'WP-CHIRALA-ENTRY', 'Chirala Approach Waypoint', 15.8050000, 80.3300000, 85, 'CORRIDOR_WAYPOINT', NULL),
('9', 'VERT-HOSP-CHIRALA', 'Area Hospital Chirala Drone Deck', 15.8246000, 80.3522000, 50, 'HOSPITAL_VERTIPORT', 3),
('10', 'VERT-BB-CHIRALA', 'Chirala Rotary Blood Bank Pad', 15.8200000, 80.3500000, 45, 'BLOOD_BANK_VERTIPORT', 3),
('11', 'WP-MARKAPUR-ENTRY', 'Markapur Eastern Valley Skyway', 15.7200000, 79.3100000, 95, 'CORRIDOR_WAYPOINT', NULL),
('12', 'VERT-HOSP-MARKAPUR', 'Area Hospital Markapur Vertiport', 15.7350000, 79.2700000, 55, 'HOSPITAL_VERTIPORT', 4);

-- 6. ROUTE EDGES (Airspace Corridors with distances in km)
INSERT INTO route_edges (from_node_code, to_node_code, distance_km, airspace_corridor_name, max_altitude_m, is_active) VALUES
('VERT-BB-RC', 'WP-MED-CORR-1', 0.85, 'Ongole Inner Medical Link 1', 90, TRUE),
('WP-MED-CORR-1', 'VERT-BB-RC', 0.85, 'Ongole Inner Medical Link 1 Return', 90, TRUE),
('WP-MED-CORR-1', 'VERT-HOSP-RIMS', 1.05, 'RIMS Emergency Aerial Inbound', 90, TRUE),
('VERT-HOSP-RIMS', 'WP-MED-CORR-1', 1.05, 'RIMS Emergency Aerial Outbound', 90, TRUE),
('VERT-BB-RC', 'VERT-HOSP-RIMS', 1.25, 'Direct Downtown Ongole Emergency Link', 80, TRUE),
('VERT-HOSP-RIMS', 'VERT-BB-RC', 1.25, 'Direct Downtown Ongole Emergency Link Return', 80, TRUE),
('WP-MED-CORR-1', 'VERT-HOSP-KIMS', 1.95, 'KIMS Inbound Medical Corridor', 100, TRUE),
('VERT-HOSP-KIMS', 'WP-MED-CORR-1', 1.95, 'KIMS Outbound Medical Corridor', 100, TRUE),
('VERT-BB-RC', 'VERT-HOSP-KIMS', 2.30, 'Red Cross to KIMS Direct Corridor', 95, TRUE),
('VERT-HOSP-KIMS', 'VERT-BB-RC', 2.30, 'KIMS to Red Cross Direct Corridor', 95, TRUE),
('VERT-BB-RIMS', 'VERT-HOSP-RIMS', 0.20, 'RIMS Campus Internal Drone Shuttle', 50, TRUE),
('VERT-HOSP-RIMS', 'VERT-BB-RIMS', 0.20, 'RIMS Campus Internal Drone Shuttle Return', 50, TRUE),
('VERT-HOSP-RIMS', 'WP-ONG-NORTH', 3.45, 'Ongole Coastal-East Outbound Corridor', 110, TRUE),
('WP-ONG-NORTH', 'VERT-HOSP-RIMS', 3.45, 'Ongole Coastal-East Inbound Corridor', 110, TRUE),
('WP-ONG-NORTH', 'WP-CHIRALA-ENTRY', 42.10, 'Ongole-Chirala Coastal Medical Skyway', 120, TRUE),
('WP-CHIRALA-ENTRY', 'WP-ONG-NORTH', 42.10, 'Chirala-Ongole Coastal Medical Skyway Return', 120, TRUE),
('WP-CHIRALA-ENTRY', 'VERT-HOSP-CHIRALA', 3.10, 'Chirala Vertiport Final Approach', 80, TRUE),
('VERT-HOSP-CHIRALA', 'WP-CHIRALA-ENTRY', 3.10, 'Chirala Vertiport Departure', 80, TRUE),
('VERT-BB-CHIRALA', 'VERT-HOSP-CHIRALA', 0.70, 'Chirala Blood Bank to Area Hospital Direct', 70, TRUE),
('VERT-HOSP-CHIRALA', 'VERT-BB-CHIRALA', 0.70, 'Chirala Area Hospital to Blood Bank Direct', 70, TRUE),
('WP-MED-CORR-1', 'WP-MARKAPUR-ENTRY', 88.50, 'Nallamala Medical Aerial Trunk Line', 140, TRUE),
('WP-MARKAPUR-ENTRY', 'WP-MED-CORR-1', 88.50, 'Nallamala Medical Aerial Trunk Line Return', 140, TRUE),
('WP-MARKAPUR-ENTRY', 'VERT-HOSP-MARKAPUR', 4.50, 'Markapur Area Hospital Final Approach', 85, TRUE),
('VERT-HOSP-MARKAPUR', 'WP-MARKAPUR-ENTRY', 4.50, 'Markapur Area Hospital Departure', 85, TRUE);

-- 7. INITIAL DEMO REQUEST (ACCEPTED -> PREPARED / ACTIVE SIMULATION)
INSERT INTO blood_requests (id, request_number, hospital_id, blood_bank_id, requested_by_user_id, designated_receiver_id, patient_reference, blood_group, blood_component, quantity, unit, urgency, required_by_time, remarks, status) VALUES
(1, 'REQ-202610-001', 1, 1, 1, 2, 'PT-RIMS-9921 (ICU Bed 04)', 'O+', 'Packed Red Blood Cells', 2, 'Units', 'CRITICAL_EMERGENCY', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'Emergency massive transfusion protocol initiated for acute hemothorax trauma case.', 'DISPATCHED'),
(2, 'REQ-202610-002', 2, 1, 5, 6, 'PT-KIMS-8842 (OB-GYN OT)', 'B+', 'Packed Red Blood Cells', 1, 'Units', 'URGENT', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Postpartum hemorrhage standby order.', 'ACCEPTED'),
(3, 'REQ-202610-003', 1, 1, 1, 2, 'PT-RIMS-9930 (Hematology)', 'O+', 'Platelets', 2, 'Units', 'ROUTINE', DATE_ADD(NOW(), INTERVAL 6 HOUR), 'Severe thrombocytopenia patient transfusion.', 'PENDING');

-- 8. INVENTORY RESERVATION FOR ACTIVE REQUEST 1 & 2
INSERT INTO inventory_reservations (id, blood_request_id, inventory_id, reserved_quantity, status, reserved_at) VALUES
(1, 1, 1, 2, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, 2, 5, 1, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 10 MINUTE));

UPDATE blood_inventory SET available_quantity = available_quantity - 2, reserved_quantity = reserved_quantity + 2 WHERE id = 1;
UPDATE blood_inventory SET available_quantity = available_quantity - 1, reserved_quantity = reserved_quantity + 1 WHERE id = 5;

-- 9. DELIVERY ROUTE FOR DEMO DISPATCH
INSERT INTO delivery_routes (id, blood_bank_id, hospital_id, route_name, total_distance_km, estimated_flight_minutes, waypoints_json) VALUES
(1, 1, 1, 'Red Cross Ongole -> RIMS Ongole Direct Corridor', 1.25, 3, '[
  {"code": "VERT-BB-RC", "name": "Red Cross Ongole Vertiport", "lat": 15.5030, "lng": 80.0450, "altitude": 45},
  {"code": "WP-MED-CORR-1", "name": "Central Medical Skyway Node Alpha", "lat": 15.5100, "lng": 80.0420, "altitude": 80},
  {"code": "VERT-HOSP-RIMS", "name": "RIMS Hospital Helipad/Vertipad", "lat": 15.5057, "lng": 80.0499, "altitude": 50}
]');

-- 10. DEMO DELIVERY
INSERT INTO deliveries (id, delivery_reference, blood_request_id, origin_blood_bank_id, destination_hospital_id, route_id, drone_identifier, dispatch_time, delivery_status, eta_minutes, distance_km, current_lat, current_lng, current_step_index, tracking_mode) VALUES
(1, 'DEL-202610-001', 1, 1, 1, 1, 'LD-HEXA-01 (Apex Lifter)', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 'IN_TRANSIT', 3, 1.25, 15.5075, 80.0460, 1, 'SIMULATED');

-- 11. PASSKEY FOR DEMO DELIVERY 1 (Demo Plaintext Passkey: 749281)
-- SHA-256 hash of "749281" + salt "demo_salt_lifedrone_2026": 
-- echo -n "749281demo_salt_lifedrone_2026" | sha256
-- 6279f67a2fec173262846cb4a4be14b2d56d4b434ee47be5255476f578dd0137
INSERT INTO delivery_passkeys (id, delivery_id, passkey_hash, passkey_salt, expiration_timestamp, attempts_count) VALUES
(1, 1, '6279f67a2fec173262846cb4a4be14b2d56d4b434ee47be5255476f578dd0137', 'demo_salt_lifedrone_2026', DATE_ADD(NOW(), INTERVAL 60 MINUTE), 0);

-- 12. INITIAL DELIVERY EVENTS
INSERT INTO delivery_events (delivery_id, event_type, latitude, longitude, altitude_meters, speed_kmh, battery_pct, status, remarks) VALUES
(1, 'DISPATCHED', 15.5030, 80.0450, 45, 0.00, 99, 'Dispatched', 'Flight pre-checks cleared. Medical cold box locked at 3.8°C.'),
(1, 'STATUS_UPDATE', 15.5075, 80.0460, 78, 62.50, 96, 'In Transit', 'Cruising at corridor altitude. GPS fix lock 18 satellites.');

-- 13. AUDIT LOGS INITIAL RECORD
INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES
(4, 'BLOOD_BANK_AUTHORIZER', 'DISPATCH_CONFIRMED', 'DELIVERY', 1, '{"drone": "LD-HEXA-01", "temp_initial": 3.8, "mode": "SIMULATED"}');
