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
    post_id     INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    tags        VARCHAR(255) DEFAULT NULL,
    status      VARCHAR(20)  DEFAULT 'published',
    view_count  INT          DEFAULT 0,
    image_path  VARCHAR(100) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_posts_user (user_id)
);

CREATE TABLE IF NOT EXISTS questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    image_path  VARCHAR(100) DEFAULT NULL,
    tags        VARCHAR(100) DEFAULT NULL,
    status      VARCHAR(20)  DEFAULT 'open',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
CREATE TABLE IF NOT EXISTS user_chats (
    message_id  INT PRIMARY KEY AUTO_INCREMENT,
    sender_id   INT          NOT NULL,
    session_id  VARCHAR(64)  NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'user',
    model_name  VARCHAR(50)  DEFAULT NULL,
    receiver_id INT          NOT NULL,
    content     TEXT         NOT NULL,
    image_url   VARCHAR(255) DEFAULT NULL,
    is_read     TINYINT(1)   DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_session (session_id),
    INDEX idx_receiver (receiver_id)
);
