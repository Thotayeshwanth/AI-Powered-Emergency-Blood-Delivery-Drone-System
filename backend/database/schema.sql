-- LifeDrone: AI-Powered Emergency Blood Delivery Management System Using Drones
-- Database Schema for MySQL 8.x / 9.x
-- Character Set: utf8mb4

CREATE DATABASE IF NOT EXISTS lifedrone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lifedrone;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS contact_inquiries;
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS notification_jobs;
DROP TABLE IF EXISTS delivery_passkeys;
DROP TABLE IF EXISTS delivery_events;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS delivery_routes;
DROP TABLE IF EXISTS inventory_reservations;
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS blood_inventory;
DROP TABLE IF EXISTS route_edges;
DROP TABLE IF EXISTS route_nodes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS blood_banks;
DROP TABLE IF EXISTS hospitals;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. HOSPITALS
CREATE TABLE hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    district VARCHAR(60) NOT NULL DEFAULT 'Prakasam',
    state VARCHAR(60) NOT NULL DEFAULT 'Andhra Pradesh',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    emergency_contact VARCHAR(100),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hospitals_district (district),
    INDEX idx_hospitals_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BLOOD BANKS
CREATE TABLE blood_banks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    district VARCHAR(60) NOT NULL DEFAULT 'Prakasam',
    state VARCHAR(60) NOT NULL DEFAULT 'Andhra Pradesh',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blood_banks_district (district),
    INDEX idx_blood_banks_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_type ENUM('HOSPITAL', 'BLOOD_BANK', 'ADMIN') NOT NULL,
    institution_id INT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('HOSPITAL_ADMIN', 'HOSPITAL_RECEIVER', 'BLOOD_BANK_ADMIN', 'BLOOD_BANK_AUTHORIZER') NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_institution (institution_type, institution_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BLOOD INVENTORY
CREATE TABLE blood_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    blood_component ENUM('Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL DEFAULT 'Units',
    batch_number VARCHAR(50) NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    storage_temperature VARCHAR(50) DEFAULT '+2°C to +6°C',
    storage_requirement TEXT,
    status ENUM('AVAILABLE', 'LOW_STOCK', 'EXPIRED', 'DISCARDED') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE,
    INDEX idx_inventory_bank (blood_bank_id),
    INDEX idx_inventory_group_comp (blood_group, blood_component),
    INDEX idx_inventory_expiry (expiry_date),
    INDEX idx_inventory_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BLOOD REQUESTS
CREATE TABLE blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(30) NOT NULL UNIQUE,
    hospital_id INT NOT NULL,
    blood_bank_id INT NOT NULL,
    requested_by_user_id INT NOT NULL,
    designated_receiver_id INT NOT NULL,
    patient_reference VARCHAR(60) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    blood_component ENUM('Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'Units',
    urgency ENUM('ROUTINE', 'URGENT', 'CRITICAL_EMERGENCY') NOT NULL DEFAULT 'URGENT',
    required_by_time DATETIME NOT NULL,
    remarks TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (designated_receiver_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_requests_hospital (hospital_id),
    INDEX idx_requests_blood_bank (blood_bank_id),
    INDEX idx_requests_status (status),
    INDEX idx_requests_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. INVENTORY RESERVATIONS
CREATE TABLE inventory_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_request_id INT NOT NULL,
    inventory_id INT NOT NULL,
    reserved_quantity INT NOT NULL,
    status ENUM('ACTIVE', 'RELEASED_FOR_DELIVERY', 'CANCELLED_AND_RESTORED') DEFAULT 'ACTIVE',
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL,
    FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES blood_inventory(id) ON DELETE CASCADE,
    INDEX idx_reservations_req (blood_request_id),
    INDEX idx_reservations_inv (inventory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ROUTE NODES (Prakasam corridor waypoints)
CREATE TABLE route_nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude_meters INT DEFAULT 60,
    node_type ENUM('HOSPITAL_VERTIPORT', 'BLOOD_BANK_VERTIPORT', 'CORRIDOR_WAYPOINT', 'RELAY_STATION') NOT NULL,
    entity_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ROUTE EDGES (Direct flight corridors between nodes)
CREATE TABLE route_edges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_node_code VARCHAR(20) NOT NULL,
    to_node_code VARCHAR(20) NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    airspace_corridor_name VARCHAR(100),
    max_altitude_m INT DEFAULT 120,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (from_node_code) REFERENCES route_nodes(node_code) ON DELETE CASCADE,
    FOREIGN KEY (to_node_code) REFERENCES route_nodes(node_code) ON DELETE CASCADE,
    INDEX idx_edges_from (from_node_code),
    INDEX idx_edges_to (to_node_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. DELIVERY ROUTES (Calculated A* route snapshots)
CREATE TABLE delivery_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    hospital_id INT NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    total_distance_km DECIMAL(6, 2) NOT NULL,
    estimated_flight_minutes INT NOT NULL,
    waypoints_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE RESTRICT,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. DELIVERIES
CREATE TABLE deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_reference VARCHAR(30) NOT NULL UNIQUE,
    blood_request_id INT NOT NULL UNIQUE,
    origin_blood_bank_id INT NOT NULL,
    destination_hospital_id INT NOT NULL,
    route_id INT NULL,
    drone_identifier VARCHAR(40) NOT NULL DEFAULT 'LD-HEXA-01',
    dispatch_time DATETIME NULL,
    arrival_time DATETIME NULL,
    completion_time DATETIME NULL,
    delivery_status ENUM('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    eta_minutes INT DEFAULT 0,
    distance_km DECIMAL(6, 2) DEFAULT 0.00,
    current_lat DECIMAL(10, 7) NULL,
    current_lng DECIMAL(10, 7) NULL,
    current_step_index INT DEFAULT 0,
    tracking_mode ENUM('SIMULATED', 'TELEMETRY_CONNECTED') NOT NULL DEFAULT 'SIMULATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (origin_blood_bank_id) REFERENCES blood_banks(id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
    FOREIGN KEY (route_id) REFERENCES delivery_routes(id) ON DELETE SET NULL,
    INDEX idx_deliveries_status (delivery_status),
    INDEX idx_deliveries_req (blood_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. DELIVERY EVENTS
CREATE TABLE delivery_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    event_type ENUM('DISPATCHED', 'WAYPOINT_REACHED', 'STATUS_UPDATE', 'ARRIVED_AT_VERTIPORT', 'HANDOVER_VERIFIED', 'EMERGENCY_HOLD') NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude_meters INT DEFAULT 60,
    speed_kmh DECIMAL(5, 2) DEFAULT 65.00,
    battery_pct INT DEFAULT 98,
    status VARCHAR(50) NOT NULL,
    remarks TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    INDEX idx_events_delivery (delivery_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. DELIVERY PASSKEYS
CREATE TABLE delivery_passkeys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL UNIQUE,
    passkey_hash VARCHAR(255) NOT NULL,
    passkey_salt VARCHAR(64) NOT NULL,
    expiration_timestamp DATETIME NOT NULL,
    used_timestamp DATETIME NULL,
    used_by_user_id INT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    attempts_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_passkeys_delivery (delivery_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. NOTIFICATION JOBS (e.g. 5-minute tracking updates)
CREATE TABLE notification_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    recipient_email VARCHAR(120) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    job_type ENUM('FIVE_MINUTE_PROGRESS', 'DISPATCH_ALERT', 'ARRIVAL_ALERT', 'HANDOVER_RECEIPT') NOT NULL,
    interval_minutes INT DEFAULT 5,
    last_sent_at DATETIME NULL,
    next_run_at DATETIME NOT NULL,
    status ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED') DEFAULT 'ACTIVE',
    failure_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    INDEX idx_jobs_status_next (status, next_run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. EMAIL LOGS
CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(120) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    template_name VARCHAR(60) NOT NULL,
    status ENUM('SENT', 'SIMULATED', 'FAILED') NOT NULL,
    error_message TEXT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_recipient (recipient_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CONTACT INQUIRIES
CREATE TABLE contact_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    organization_type ENUM('Hospital', 'Blood Bank', 'Healthcare Organization', 'Technology Partner', 'Individual', 'Other') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    consent_given BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. AUDIT LOGS
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NULL,
    actor_role VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id INT NULL,
    metadata_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_actor (actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
