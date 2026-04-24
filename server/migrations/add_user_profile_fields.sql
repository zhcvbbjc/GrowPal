-- 为已有数据库添加新用户字段
-- 执行前请确认字段是否已存在

USE GrowPal;

-- 添加 bio 字段（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL AFTER avatar;

-- 添加 role 字段（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user' AFTER bio;

-- 添加 is_active 字段（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER role;

-- 添加 updated_at 字段（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 添加 email 唯一索引（如果不存在）
ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS uq_users_email (email);
