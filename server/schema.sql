-- GrowPal 数据库初始化脚本（MySQL 8+）
-- 在 MySQL 中执行: SOURCE /path/to/schema.sql;

CREATE DATABASE IF NOT EXISTS GrowPal DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE GrowPal;

CREATE TABLE IF NOT EXISTS users (
    user_id       INT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(64)  NOT NULL,
    email         VARCHAR(128) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(32)  DEFAULT NULL,
    avatar        VARCHAR(512) DEFAULT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_phone (phone)
);

CREATE TABLE IF NOT EXISTS posts (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    content     TEXT         NOT NULL,
    image_path  VARCHAR(512) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_posts_user (user_id)
);

CREATE TABLE IF NOT EXISTS questions (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    image_path  VARCHAR(512) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_questions_user (user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    content      TEXT         NOT NULL,
    target_id    INT          NOT NULL,
    target_type  VARCHAR(32)  NOT NULL,
    parent_id    INT          DEFAULT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comments_target (target_id, target_type)
);

CREATE TABLE IF NOT EXISTS likes (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT         NOT NULL,
    target_id    INT         NOT NULL,
    target_type  VARCHAR(32) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_like (user_id, target_id, target_type)
);

-- AI 对话：会话与消息
CREATE TABLE IF NOT EXISTS ai_sessions (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT          NOT NULL,
    title      VARCHAR(200) DEFAULT '新对话',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ai_sessions_user (user_id)
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT          NOT NULL,
    role       ENUM ('user', 'assistant', 'system') NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_messages_session (session_id),
    CONSTRAINT fk_ai_messages_session FOREIGN KEY (session_id) REFERENCES ai_sessions (id) ON DELETE CASCADE
);

-- 用户间私聊
CREATE TABLE IF NOT EXISTS user_conversations (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_low   INT NOT NULL,
    user_high  INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_pair (user_low, user_high),
    INDEX idx_uc_low (user_low),
    INDEX idx_uc_high (user_high)
);

CREATE TABLE IF NOT EXISTS user_messages (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT          NOT NULL,
    sender_id       INT          NOT NULL,
    content         TEXT         NOT NULL,
    is_read         TINYINT(1) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_um_conv (conversation_id),
    CONSTRAINT fk_um_conv FOREIGN KEY (conversation_id) REFERENCES user_conversations (id) ON DELETE CASCADE
);
