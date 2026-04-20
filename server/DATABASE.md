# GrowPal 数据库结构说明

## 概述

GrowPal 是一个社交平台，包含用户管理、帖子发布、问答互动、AI 对话等功能模块。

## 数据表

### 1. users - 用户表

存储用户的基本信息。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| user_id | int | NO | PRI | auto_increment | 用户主键ID |
| username | varchar | NO | UNI | - | 用户名（唯一） |
| email | varchar | NO | UNI | - | 邮箱（唯一） |
| password_hash | varchar | NO | - | - | 密码哈希 |
| avatar | varchar | YES | - | NULL | 头像URL |
| bio | text | YES | - | NULL | 个人简介 |
| role | varchar | YES | - | user | 用户角色 |
| is_active | tinyint | YES | - | 1 | 是否激活（1=激活，0=未激活） |
| phone | varchar | YES | - | NULL | 手机号 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | YES | - | CURRENT_TIMESTAMP | 更新时间 |

---

### 2. posts - 帖子表

存储用户发布的帖子内容。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| post_id | int | NO | PRI | auto_increment | 帖子主键ID |
| user_id | int | NO | MUL | - | 发布者用户ID |
| title | varchar | NO | - | - | 帖子标题 |
| content | text | NO | - | - | 帖子内容 |
| ai_summary | text | YES | - | NULL | AI生成的摘要 |
| cover_image | varchar | YES | - | NULL | 封面图片URL |
| tags | varchar | YES | - | NULL | 标签（逗号分隔） |
| status | varchar | YES | - | published | 发布状态 |
| view_count | int | YES | - | 0 | 浏览次数 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | YES | - | CURRENT_TIMESTAMP | 更新时间 |
| image_path | varchar | YES | - | NULL | 图片路径 |

---

### 3. questions - 问题表

存储用户发布的问题，支持AI解答。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| question_id | int | NO | PRI | auto_increment | 问题主键ID |
| user_id | int | NO | MUL | - | 发布者用户ID |
| title | varchar | NO | - | - | 问题标题 |
| content | text | NO | - | - | 问题内容 |
| ai_answer | text | YES | - | NULL | AI生成的解答 |
| image_path | varchar | YES | - | NULL | 配图路径 |
| tags | varchar | YES | - | NULL | 标签（逗号分隔） |
| status | varchar | YES | - | open | 问题状态 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | YES | - | CURRENT_TIMESTAMP | 更新时间 |

---

### 4. comments - 评论表

存储对帖子或问题的评论，支持嵌套评论。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| comment_id | int | NO | PRI | auto_increment | 评论主键ID |
| user_id | int | NO | MUL | - | 评论者用户ID |
| target_type | varchar | NO | - | - | 评论目标类型（post/question） |
| target_id | int | NO | - | - | 目标ID（帖子ID或问题ID） |
| parent_id | int | YES | MUL | NULL | 父评论ID（支持嵌套） |
| content | text | NO | - | - | 评论内容 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |

---

### 5. likes - 点赞表

存储对帖子或问题的点赞记录。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| like_id | int | NO | PRI | auto_increment | 点赞记录主键ID |
| user_id | int | NO | MUL | - | 点赞者用户ID |
| target_type | varchar | NO | - | - | 点赞目标类型（post/question） |
| target_id | int | NO | - | - | 目标ID（帖子ID或问题ID） |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |

---

### 6. chat_images - 聊天图片表

存储聊天消息中关联的图片。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| image_id | int | NO | PRI | auto_increment | 图片主键ID |
| chat_id | int | NO | MUL | - | 关联的聊天消息ID |
| image_url | varchar | NO | - | - | 图片URL |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |

---

### 7. ai_sessions - AI对话会话表

存储用户与AI的对话会话。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| id | int | NO | PRI | auto_increment | 会话主键ID |
| user_id | int | NO | MUL | - | 用户ID |
| title | varchar | YES | - | 新对话 | 会话标题 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | YES | MUL | CURRENT_TIMESTAMP | 更新时间 |

---

### 8. ai_chats - AI对话消息表

存储AI对话的具体消息内容。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| chat_id | int | NO | PRI | auto_increment | 消息主键ID |
| user_id | int | NO | MUL | - | 用户ID |
| session_id | varchar | NO | MUL | - | 会话ID |
| role | varchar | NO | - | - | 角色（user/assistant） |
| model_name | varchar | NO | - | gpt-4o-mini | 使用的AI模型 |
| message | text | NO | - | - | 消息内容 |
| status | varchar | YES | - | success | 消息状态 |
| token_count | int | YES | - | 0 | Token消耗量 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | YES | - | CURRENT_TIMESTAMP | 更新时间 |

---

### 9. user_chats - 用户间聊天消息表

存储用户之间的私聊消息。

| 字段名 | 类型 | 是否必填 | 索引 | 默认值 | 说明 |
|--------|------|----------|------|--------|------|
| message_id | int | NO | PRI | auto_increment | 消息主键ID |
| sender_id | int | NO | MUL | - | 发送者用户ID |
| session_id | varchar | NO | MUL | - | 会话ID |
| role | varchar | NO | - | user | 角色 |
| model_name | varchar | YES | - | NULL | 模型名称 |
| receiver_id | int | NO | MUL | - | 接收者用户ID |
| content | text | NO | - | - | 消息内容 |
| image_url | varchar | YES | - | NULL | 图片URL |
| is_read | tinyint | YES | - | 0 | 是否已读 |
| created_at | timestamp | YES | - | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | YES | - | CURRENT_TIMESTAMP | 更新时间 |

---

## 表关系说明

- `users` 与 `posts`、`questions`、`comments`、`likes`、`ai_sessions`、`ai_chats`、`user_chats` 是一对多关系
- `posts` 与 `comments`、`likes` 是一对多关系
- `questions` 与 `comments`、`likes` 是一对多关系
- `comments` 支持嵌套，通过 `parent_id` 关联父评论
- `ai_sessions` 与 `ai_chats` 是一对多关系
- `chat_images` 通过 `chat_id` 关联聊天消息
