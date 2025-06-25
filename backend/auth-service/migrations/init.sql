-- Membuat database jika belum ada
CREATE DATABASE IF NOT EXISTS auth_db;

-- Gunakan database auth_db
USE auth_db;

-- Membuat tabel roles
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_name (name),
    INDEX idx_is_system (is_system)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuat tabel permissions
CREATE TABLE IF NOT EXISTS permissions (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_name (name),
    INDEX idx_resource_action (resource, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuat tabel role_permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
    id CHAR(36) PRIMARY KEY,
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuat tabel users
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'local',
    provider_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- Legacy field for backward compatibility
    role_id CHAR(36), -- New field for role-based access control
    verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_provider_id (provider, provider_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuat tabel login_histories
CREATE TABLE IF NOT EXISTS login_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    ip VARCHAR(50),
    user_agent VARCHAR(255),
    device_info VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    failure_reason VARCHAR(255),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuat tabel user_activities
CREATE TABLE IF NOT EXISTS user_activities (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    details JSON,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuat tabel refresh_tokens (opsional, jika tidak menggunakan Redis)
-- CREATE TABLE IF NOT EXISTS refresh_tokens (
--     id CHAR(36) PRIMARY KEY,
--     user_id CHAR(36) NOT NULL,
--     token VARCHAR(255) NOT NULL,
--     expires_at TIMESTAMP NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_token (token),
--     INDEX idx_user_id (user_id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT IGNORE INTO roles (id, name, display_name, description, is_system) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Administrator', 'Full system access with all permissions', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'user', 'Regular User', 'Standard user with basic permissions', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'moderator', 'Moderator', 'Moderate user access with some administrative permissions', TRUE);

-- Insert default permissions
INSERT IGNORE INTO permissions (id, name, display_name, description, resource, action) VALUES
-- User permissions
('650e8400-e29b-41d4-a716-446655440001', 'user.read', 'Read Users', 'View user information', 'user', 'read'),
('650e8400-e29b-41d4-a716-446655440002', 'user.create', 'Create Users', 'Create new users', 'user', 'create'),
('650e8400-e29b-41d4-a716-446655440003', 'user.update', 'Update Users', 'Modify user information', 'user', 'update'),
('650e8400-e29b-41d4-a716-446655440004', 'user.delete', 'Delete Users', 'Remove users from system', 'user', 'delete'),
-- Role permissions
('650e8400-e29b-41d4-a716-446655440005', 'role.read', 'Read Roles', 'View role information', 'role', 'read'),
('650e8400-e29b-41d4-a716-446655440006', 'role.create', 'Create Roles', 'Create new roles', 'role', 'create'),
('650e8400-e29b-41d4-a716-446655440007', 'role.update', 'Update Roles', 'Modify role information', 'role', 'update'),
('650e8400-e29b-41d4-a716-446655440008', 'role.delete', 'Delete Roles', 'Remove roles from system', 'role', 'delete'),
-- Permission permissions
('650e8400-e29b-41d4-a716-446655440009', 'permission.read', 'Read Permissions', 'View permission information', 'permission', 'read'),
('650e8400-e29b-41d4-a716-446655440010', 'permission.create', 'Create Permissions', 'Create new permissions', 'permission', 'create'),
('650e8400-e29b-41d4-a716-446655440011', 'permission.update', 'Update Permissions', 'Modify permission information', 'permission', 'update'),
('650e8400-e29b-41d4-a716-446655440012', 'permission.delete', 'Delete Permissions', 'Remove permissions from system', 'permission', 'delete'),
-- Profile permissions
('650e8400-e29b-41d4-a716-446655440013', 'profile.read', 'Read Profile', 'View own profile', 'profile', 'read'),
('650e8400-e29b-41d4-a716-446655440014', 'profile.update', 'Update Profile', 'Modify own profile', 'profile', 'update');

-- Assign permissions to admin role (all permissions)
INSERT IGNORE INTO role_permissions (id, role_id, permission_id) 
SELECT 
    CONCAT('750e8400-e29b-41d4-a716-44665544', LPAD(ROW_NUMBER() OVER (ORDER BY p.id), 4, '0')) as id,
    '550e8400-e29b-41d4-a716-446655440001' as role_id,
    p.id as permission_id
FROM permissions p;

-- Assign basic permissions to user role
INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES
('750e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440013'), -- profile.read
('750e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440014'); -- profile.update

-- Assign moderate permissions to moderator role
INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES
('750e8400-e29b-41d4-a716-446655442001', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001'), -- user.read
('750e8400-e29b-41d4-a716-446655442002', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003'), -- user.update
('750e8400-e29b-41d4-a716-446655442003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005'), -- role.read
('750e8400-e29b-41d4-a716-446655442004', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009'), -- permission.read
('750e8400-e29b-41d4-a716-446655442005', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013'), -- profile.read
('750e8400-e29b-41d4-a716-446655442006', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440014'); -- profile.update