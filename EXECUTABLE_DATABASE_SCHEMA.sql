-- ================================================================================
-- TRAVELQUEST DATABASE SCHEMA - EXECUTABLE SQL FILE
-- Execute this file in phpMyAdmin or MySQL client
-- ================================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS travelquest_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE travelquest_db;

-- ================================================================================
-- 1. LOOKUP/REFERENCE TABLES
-- ================================================================================

-- User Roles
CREATE TABLE user_roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'admin, user, moderator',
    role_name VARCHAR(50) NOT NULL,
    description TEXT NULL,
    permissions JSON NULL COMMENT 'Store role permissions as JSON',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_code (role_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User role definitions';

-- User Status
CREATE TABLE user_statuses (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    status_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'active, inactive, suspended, banned',
    status_name VARCHAR(50) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Destination Categories
CREATE TABLE destination_categories (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'hotel, agri_farm, historical, nature',
    category_name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NULL COMMENT 'Emoji or icon identifier',
    color VARCHAR(50) NULL COMMENT 'CSS color code',
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_code (category_code),
    INDEX idx_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reward Categories
CREATE TABLE reward_categories (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'food_beverage, accommodation, experience',
    category_name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_code (category_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Badge Categories
CREATE TABLE badge_categories (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'travel, agriculture, nature, culture',
    category_name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Destination Status
CREATE TABLE destination_statuses (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    status_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'active, inactive, pending, archived',
    status_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 2. CORE USER MANAGEMENT
-- ================================================================================

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id TINYINT UNSIGNED NOT NULL DEFAULT 2 COMMENT 'FK to user_roles, default=user',
    status_id TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'FK to user_statuses',
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    remember_token VARCHAR(100) NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NULL,
    phone VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
    avatar_url VARCHAR(500) NULL,
    total_points INT UNSIGNED DEFAULT 0 COMMENT 'Total loyalty points earned',
    level INT UNSIGNED DEFAULT 1 COMMENT 'User level based on activities',
    preferences JSON NULL COMMENT 'User preferences and settings',
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    two_factor_secret TEXT NULL,
    two_factor_recovery_codes TEXT NULL,
    two_factor_confirmed_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
    FOREIGN KEY (role_id) REFERENCES user_roles(id) ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES user_statuses(id) ON UPDATE CASCADE,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role_status (role_id, status_id),
    INDEX idx_points (total_points),
    INDEX idx_level (level),
    INDEX idx_created (created_at),
    INDEX idx_deleted (deleted_at),
    FULLTEXT idx_fulltext_name (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Main user accounts table';

-- User Addresses
CREATE TABLE user_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    address_type ENUM('home', 'work', 'other') DEFAULT 'home',
    street_address VARCHAR(255) NULL,
    barangay VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    province VARCHAR(100) NULL,
    region VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) DEFAULT 'Philippines',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 3. DESTINATION MANAGEMENT (With Geolocation)
-- ================================================================================

CREATE TABLE destinations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id TINYINT UNSIGNED NOT NULL COMMENT 'FK to destination_categories',
    status_id TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'FK to destination_statuses',
    created_by BIGINT UNSIGNED NULL COMMENT 'Admin who created this',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL COMMENT 'URL-friendly name',
    description TEXT NULL COMMENT 'Short description',
    full_description LONGTEXT NULL COMMENT 'Full detailed description',
    street_address VARCHAR(255) NULL,
    barangay VARCHAR(100) NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) DEFAULT 'Philippines',
    latitude DECIMAL(10, 8) NOT NULL COMMENT 'Latitude coordinate',
    longitude DECIMAL(11, 8) NOT NULL COMMENT 'Longitude coordinate',
    location POINT NOT NULL COMMENT 'Spatial point for efficient queries',
    contact_number VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(500) NULL,
    points_reward INT UNSIGNED DEFAULT 50 COMMENT 'Points awarded for visiting',
    visit_radius INT UNSIGNED DEFAULT 100 COMMENT 'Check-in radius in meters',
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_visits INT UNSIGNED DEFAULT 0,
    total_reviews INT UNSIGNED DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    meta_keywords VARCHAR(500) NULL,
    qr_code VARCHAR(100) UNIQUE NULL COMMENT 'Unique QR code identifier',
    qr_code_image_url VARCHAR(500) NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
    FOREIGN KEY (category_id) REFERENCES destination_categories(id) ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES destination_statuses(id) ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status_id),
    INDEX idx_slug (slug),
    INDEX idx_city_province (city, province),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    INDEX idx_points (points_reward),
    INDEX idx_rating (average_rating),
    INDEX idx_created (created_at),
    INDEX idx_qr_code (qr_code),
    SPATIAL INDEX idx_location (location),
    INDEX idx_category_active (category_id, is_active),
    INDEX idx_featured_active (is_featured, is_active),
    INDEX idx_location_search (city, province, region),
    FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Travel destinations with geolocation';

-- Triggers for destinations
DELIMITER //
CREATE TRIGGER before_destination_insert 
BEFORE INSERT ON destinations
FOR EACH ROW
BEGIN
    SET NEW.location = POINT(NEW.longitude, NEW.latitude);
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(NEW.name, ' ', '-'), ',', ''));
    END IF;
END//

CREATE TRIGGER before_destination_update 
BEFORE UPDATE ON destinations
FOR EACH ROW
BEGIN
    IF NEW.latitude != OLD.latitude OR NEW.longitude != OLD.longitude THEN
        SET NEW.location = POINT(NEW.longitude, NEW.latitude);
    END IF;
END//
DELIMITER ;

-- Destination Images
CREATE TABLE destination_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_path VARCHAR(500) NULL COMMENT 'Server file path',
    title VARCHAR(255) NULL,
    alt_text VARCHAR(255) NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    file_size INT UNSIGNED NULL COMMENT 'Size in bytes',
    mime_type VARCHAR(50) NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_destination (destination_id),
    INDEX idx_primary (is_primary),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Destination Amenities
CREATE TABLE destination_amenities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NULL,
    category VARCHAR(50) NULL COMMENT 'facilities, services, features',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Destination Amenities Junction
CREATE TABLE destination_amenity_pivot (
    destination_id BIGINT UNSIGNED NOT NULL,
    amenity_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (destination_id, amenity_id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES destination_amenities(id) ON DELETE CASCADE,
    INDEX idx_destination (destination_id),
    INDEX idx_amenity (amenity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Operating Hours
CREATE TABLE destination_operating_hours (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL COMMENT '1=Monday, 7=Sunday',
    opens_at TIME NULL,
    closes_at TIME NULL,
    is_closed BOOLEAN DEFAULT FALSE COMMENT 'Closed this day',
    notes VARCHAR(255) NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_destination_day (destination_id, day_of_week),
    INDEX idx_destination (destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 4. CHECK-IN SYSTEM
-- ================================================================================

CREATE TABLE user_checkins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    destination_id BIGINT UNSIGNED NOT NULL,
    checkin_method ENUM('qr_code', 'gps', 'manual') DEFAULT 'qr_code',
    qr_code_scanned VARCHAR(100) NULL,
    user_latitude DECIMAL(10, 8) NULL COMMENT 'User location at check-in',
    user_longitude DECIMAL(11, 8) NULL COMMENT 'User location at check-in',
    distance_from_destination INT NULL COMMENT 'Distance in meters',
    points_earned INT UNSIGNED DEFAULT 0,
    bonus_points INT UNSIGNED DEFAULT 0 COMMENT 'Extra points from promotions',
    photo_url VARCHAR(500) NULL COMMENT 'User photo at location',
    notes TEXT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    verified_by BIGINT UNSIGNED NULL COMMENT 'Admin who verified',
    verified_at TIMESTAMP NULL,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_destination (destination_id),
    INDEX idx_checkin_date (checked_in_at),
    INDEX idx_points (points_earned),
    INDEX idx_method (checkin_method),
    INDEX idx_user_checkins (user_id, checked_in_at DESC),
    INDEX idx_destination_checkins (destination_id, checked_in_at DESC),
    UNIQUE KEY unique_daily_checkin (user_id, destination_id, DATE(checked_in_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Visit Statistics
CREATE TABLE user_visit_stats (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    total_checkins INT UNSIGNED DEFAULT 0,
    unique_destinations INT UNSIGNED DEFAULT 0,
    total_points_earned INT UNSIGNED DEFAULT 0,
    favorite_category_id TINYINT UNSIGNED NULL,
    last_checkin_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (favorite_category_id) REFERENCES destination_categories(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user (user_id),
    INDEX idx_total_checkins (total_checkins),
    INDEX idx_total_points (total_points_earned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 5. BADGES & ACHIEVEMENTS
-- ================================================================================

CREATE TABLE badges (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id TINYINT UNSIGNED NULL COMMENT 'FK to badge_categories',
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NULL COMMENT 'Emoji or image path',
    color VARCHAR(50) NULL COMMENT 'Badge color hex',
    requirement_type ENUM('visits', 'points', 'checkins', 'categories', 'custom') NOT NULL,
    requirement_value INT UNSIGNED NOT NULL COMMENT 'Number needed to unlock',
    requirement_details JSON NULL COMMENT 'Additional requirements',
    points_reward INT UNSIGNED DEFAULT 0,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE COMMENT 'Hidden until earned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES badge_categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_rarity (rarity),
    INDEX idx_active (is_active),
    INDEX idx_requirement (requirement_type, requirement_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Badges
CREATE TABLE user_badges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    badge_id INT UNSIGNED NOT NULL,
    progress INT UNSIGNED DEFAULT 0 COMMENT 'Current progress toward badge',
    is_earned BOOLEAN DEFAULT FALSE,
    earned_at TIMESTAMP NULL,
    points_awarded INT UNSIGNED DEFAULT 0,
    is_favorited BOOLEAN DEFAULT FALSE,
    is_displayed BOOLEAN DEFAULT FALSE COMMENT 'Show on profile',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_id),
    INDEX idx_user (user_id),
    INDEX idx_badge (badge_id),
    INDEX idx_earned (is_earned),
    INDEX idx_earned_date (earned_at),
    INDEX idx_user_earned (user_id, is_earned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 6. REWARDS & REDEMPTIONS
-- ================================================================================

CREATE TABLE rewards (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id TINYINT UNSIGNED NOT NULL COMMENT 'FK to reward_categories',
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    terms_conditions TEXT NULL,
    points_required INT UNSIGNED NOT NULL,
    stock_quantity INT UNSIGNED DEFAULT 0,
    stock_unlimited BOOLEAN DEFAULT FALSE,
    max_redemptions_per_user INT UNSIGNED DEFAULT 1,
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    redemption_period_days INT UNSIGNED DEFAULT 30 COMMENT 'Days to use after redemption',
    partner_name VARCHAR(255) NULL,
    partner_logo_url VARCHAR(500) NULL,
    partner_contact VARCHAR(255) NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    total_redeemed INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES reward_categories(id) ON UPDATE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_points (points_required),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_validity (valid_from, valid_until),
    FULLTEXT idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Reward Redemptions
CREATE TABLE user_reward_redemptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    reward_id BIGINT UNSIGNED NOT NULL,
    points_spent INT UNSIGNED NOT NULL,
    redemption_code VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique code to claim reward',
    status ENUM('pending', 'active', 'used', 'expired', 'cancelled') DEFAULT 'pending',
    valid_until TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    used_location VARCHAR(255) NULL,
    verified_by BIGINT UNSIGNED NULL COMMENT 'Staff who verified usage',
    notes TEXT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_reward (reward_id),
    INDEX idx_code (redemption_code),
    INDEX idx_status (status),
    INDEX idx_validity (valid_until),
    INDEX idx_user_history (user_id, redeemed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 7. POINTS & TRANSACTIONS
-- ================================================================================

CREATE TABLE user_point_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    transaction_type ENUM('earn', 'spend', 'bonus', 'refund', 'adjustment') NOT NULL,
    points_amount INT NOT NULL COMMENT 'Positive for earn, negative for spend',
    balance_after INT UNSIGNED NOT NULL COMMENT 'Running balance',
    source_type VARCHAR(50) NOT NULL COMMENT 'checkin, badge, reward, admin',
    source_id BIGINT UNSIGNED NULL COMMENT 'ID of related record',
    description VARCHAR(500) NULL,
    performed_by BIGINT UNSIGNED NULL COMMENT 'Admin who performed action',
    notes TEXT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_date (transaction_date),
    INDEX idx_user_history (user_id, transaction_date DESC),
    INDEX idx_source (source_type, source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 8. REVIEWS & RATINGS
-- ================================================================================

CREATE TABLE destination_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255) NULL,
    review_text TEXT NULL,
    photos JSON NULL COMMENT 'Array of photo URLs',
    helpful_count INT UNSIGNED DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    moderated_by BIGINT UNSIGNED NULL,
    moderated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_destination (destination_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    UNIQUE KEY unique_user_review (user_id, destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Review Helpful Votes
CREATE TABLE review_helpful_votes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES destination_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (review_id, user_id),
    INDEX idx_review (review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 9. NOTIFICATIONS
-- ================================================================================

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'badge_earned, reward_available, checkin_milestone',
    title VARCHAR(255) NOT NULL,
    message TEXT NULL,
    action_url VARCHAR(500) NULL,
    action_text VARCHAR(100) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    related_type VARCHAR(50) NULL,
    related_id BIGINT UNSIGNED NULL,
    sent_via JSON NULL COMMENT 'email, push, sms',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at),
    INDEX idx_user_unread (user_id, is_read, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 10. USER FAVORITES
-- ================================================================================

CREATE TABLE user_saved_destinations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    destination_id BIGINT UNSIGNED NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (user_id, destination_id),
    INDEX idx_user (user_id),
    INDEX idx_destination (destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 11. ADMIN ACTIVITY LOGS
-- ================================================================================

CREATE TABLE admin_activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(100) NOT NULL COMMENT 'create, update, delete, approve',
    entity_type VARCHAR(50) NOT NULL COMMENT 'destination, user, reward',
    entity_id BIGINT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- 12. SYSTEM SETTINGS
-- ================================================================================

CREATE TABLE system_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT NULL,
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Can be accessed by frontend',
    updated_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (setting_key),
    INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- INITIAL DATA SEEDING
-- ================================================================================

INSERT INTO user_roles (role_code, role_name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('user', 'User', 'Regular user account'),
('moderator', 'Moderator', 'Content moderation access');

INSERT INTO user_statuses (status_code, status_name) VALUES
('active', 'Active'),
('inactive', 'Inactive'),
('suspended', 'Suspended'),
('banned', 'Banned');

INSERT INTO destination_categories (category_code, category_name, icon, color) VALUES
('hotel', 'Hotels & Resorts', '🏨', 'blue'),
('agri_farm', 'Agricultural Farms', '🌾', 'green'),
('historical', 'Historical Sites', '🏛️', 'brown'),
('nature', 'Nature Parks', '🌳', 'emerald'),
('beach', 'Beaches', '🏖️', 'cyan'),
('mountain', 'Mountains', '⛰️', 'stone'),
('restaurant', 'Restaurants', '🍽️', 'orange'),
('resort', 'Resorts', '🏝️', 'teal');

INSERT INTO reward_categories (category_code, category_name, icon) VALUES
('food_beverage', 'Food & Beverage', '☕'),
('accommodation', 'Accommodation', '🏨'),
('experience', 'Experience', '🎯'),
('wellness', 'Wellness', '💆'),
('shopping', 'Shopping', '🛍️'),
('culture', 'Culture', '🎭');

INSERT INTO badge_categories (category_code, category_name, icon) VALUES
('travel', 'Travel', '🗺️'),
('agriculture', 'Agriculture', '🌾'),
('nature', 'Nature', '🌲'),
('culture', 'Culture', '🏛️');

INSERT INTO destination_statuses (status_code, status_name) VALUES
('active', 'Active'),
('inactive', 'Inactive'),
('pending', 'Pending Approval'),
('archived', 'Archived');

INSERT INTO destination_amenities (name, icon, category) VALUES
('Free WiFi', '📶', 'facilities'),
('Parking', '🅿️', 'facilities'),
('Swimming Pool', '🏊', 'facilities'),
('Restaurant', '🍽️', 'services'),
('Fitness Center', '🏋️', 'facilities'),
('Spa Services', '💆', 'services'),
('Air Conditioning', '❄️', 'facilities'),
('Pet Friendly', '🐕', 'features'),
('Bar/Lounge', '🍸', 'services'),
('Free Breakfast', '🥐', 'services'),
('24/7 Service', '🕐', 'services'),
('Room Service', '🛎️', 'services');
