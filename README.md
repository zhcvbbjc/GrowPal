# 🌱 GrowPal - 农业智能社区平台

<div align="center">

![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange?style=flat-square)
![AI](https://img.shields.io/badge/AI-LLM%20Integrated-purple?style=flat-square)

**让农业更智能，让社区更紧密**

[功能特性](#-功能特性) • [技术栈](#-技术栈) • [快速开始](#-快速开始) • [项目结构](#-项目结构) • [API文档](#-api文档) • [配置说明](#-配置说明)

</div>

---

## 📖 项目简介

GrowPal 是一个集**农业智能咨询**与**农业社区交流**于一体的现代化Web平台。用户可以在这里：

- 🤖 **AI智能问答** - 获取作物种植、病虫害防治、土壤分析等专业建议
- 📝 **发布动态** - 分享种植经验、收成喜悦和农业知识
- ❓ **提问求助** - 向社区求助农业相关问题，获得众人智慧
- 💬 **私信交流** - 与其他用户一对一沟通农业经验
- 👤 **个人管理** - 管理个人信息、查看历史互动

## ✨ 功能特性

### 🎯 核心功能

| 功能模块 | 说明 | 状态 |
|---------|------|------|
| **AI 智能对话** | 基于大模型的农业智能顾问，支持多轮对话、会话管理 | ✅ 需配置API密钥 |
| **社区动态** | 发布/浏览/点赞/评论农业相关动态，支持图片上传 | ✅ 完整功能 |
| **问答系统** | 提问/回答/采纳问题，社区互助解决农业问题 | ✅ 完整功能 |
| **用户私信** | 用户间一对一私聊，支持消息历史记录 | ✅ 完整功能 |
| **用户认证** | JWT Token 认证，支持注册/登录 | ✅ 完整功能 |
| **个人主页** | 展示用户信息、统计数据和历史活动 | ✅ 完整功能 |

### 🎨 UI/UX 特色

- 🌈 **现代化设计** - 采用 Tailwind CSS，Material Design 风格
- 📱 **响应式布局** - 完美适配桌面端和移动端
- ✨ **流畅动画** - 使用 Framer Motion 提供优雅的交互动画
- 🎭 **图标系统** - 统一的 Lucide React 图标，视觉一致性强
- 🔔 **实时反馈** - Toast 提示、确认对话框、加载状态展示

## 🛠 技术栈

### 前端 (Client)

```
React 18          # UI 框架
TypeScript 5      # 类型安全
Vite              # 构建工具
Tailwind CSS      # 样式系统
Framer Motion     # 动画库
Lucide React      # 图标库
React Markdown    # Markdown 渲染 (AI对话)
Axios             # HTTP 客户端
```

### 后端 (Server)

```
Node.js           # 运行环境
Express.js        # Web 框架
MySQL             # 数据库
JWT               # 身份认证
Multer            # 文件上传
OpenAI API兼容     # LLM 集成 (支持多种AI服务)
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd GrowPal
```

### 2. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE GrowPal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

导入数据库表结构（如果提供了 schema.sql）：

```bash
mysql -u root -p GrowPal < server/schema.sql
```

### 3. 配置后端

```bash
cd server
npm install
```

编辑 `server/.env` 文件：

```env
# 端口号
PORT=5000

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=GrowPal

# JWT 密钥（自定义字符串）
JWT_SECRET=my_super_secret_key_12345

# 大模型 API 配置（三选一）

# 选项1: OpenAI (推荐)
LLM_API_KEY=sk-your-openai-key
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini

# 选项2: 国内服务（如通义千问、智谱等，需兼容 OpenAI 接口）
# LLM_API_KEY=your-api-key
# LLM_API_BASE=https://your-service-url/v1
# LLM_MODEL=your-model-name

# 选项3: Ollama 本地部署
# LLM_API_BASE=http://localhost:11434/v1
# LLM_MODEL=qwen2.5
# LLM_API_KEY=随便填或不填

# AI 温度参数（可选）
LLM_TEMPERATURE=0.7
```

启动后端服务：

```bash
node index.js
```

后端将在 `http://localhost:5000` 运行。

### 4. 配置前端

```bash
cd ../client
npm install
```

启动前端开发服务器：

```bash
npm run dev
```

前端将在 `http://localhost:3000` 运行，并自动代理 API 请求到后端。

### 5. 访问应用

打开浏览器访问 `http://localhost:3000`，注册账号并开始使用！

## 📁 项目结构

```
GrowPal/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   │   ├── HomeScreen.tsx         # 首页
│   │   │   ├── CommunityScreen.tsx    # 社区页面（动态+问答）
│   │   │   ├── CommunityDetailPage.tsx # 社区详情页
│   │   │   ├── AIChatScreen.tsx       # AI 对话页面
│   │   │   ├── MessagesScreen.tsx     # 私信页面
│   │   │   ├── ProfileScreen.tsx      # 个人主页
│   │   │   └── LoginPage.tsx          # 登录/注册
│   │   ├── services/         # API 服务层
│   │   │   ├── api.ts               # Axios 封装
│   │   │   └── growpalApi.ts        # 业务 API
│   │   ├── components/       # 通用组件
│   │   ├── contexts/         # React Context
│   │   │   └── AuthContext.tsx      # 认证上下文
│   │   └── lib/              # 工具函数
│   ├── .env.example          # 环境变量示例
│   └── vite.config.ts        # Vite 配置
│
├── server/                    # 后端项目
│   ├── controllers/          # 业务控制器
│   │   ├── aiChatController/      # AI 对话控制
│   │   ├── postController/        # 动态控制
│   │   ├── questionController/    # 问答控制
│   │   └── userchatController/    # 私信控制
│   ├── models/               # 数据模型
│   ├── routes/               # 路由定义
│   ├── services/             # 业务服务
│   │   └── llmService.js          # LLM 调用服务
│   ├── middleware/           # 中间件
│   │   └── auth.js                # JWT 认证
│   ├── utils/                # 工具函数
│   │   └── upload.js              # 文件上传
│   ├── uploads/              # 上传文件存储
│   ├── .env                  # 环境配置
│   └── index.js              # 入口文件
│
└── README.md                 # 项目文档
```

## 🔌 API 文档

### 认证接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| GET | `/api/auth/me` | 获取当前用户 | ✅ |

### 社区动态

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/posts` | 发布动态 | ✅ |
| GET | `/api/posts` | 获取所有动态 | ❌ |
| GET | `/api/posts/:id` | 获取动态详情 | ❌ |
| DELETE | `/api/posts/:id` | 删除动态 | ✅ |
| POST | `/api/posts/:id/comments` | 发表评论 | ✅ |
| GET | `/api/posts/:id/comments` | 获取评论列表 | ❌ |
| POST | `/api/posts/:id/like` | 点赞/取消 | ✅ |
| GET | `/api/posts/:id/likes` | 获取点赞数 | ❌ |

### 问答系统

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/questions` | 发布问题 | ✅ |
| GET | `/api/questions` | 获取所有问题 | ❌ |
| GET | `/api/questions/:id` | 获取问题详情 | ❌ |
| DELETE | `/api/questions/:id` | 删除问题 | ✅ |
| POST | `/api/questions/:id/comments` | 发表回答 | ✅ |
| GET | `/api/questions/:id/comments` | 获取回答列表 | ❌ |
| POST | `/api/questions/:id/like` | 点赞/取消 | ✅ |

### AI 对话

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/aichat/sessions` | 创建会话 | ✅ |
| GET | `/api/aichat/sessions` | 获取会话列表 | ✅ |
| DELETE | `/api/aichat/sessions/:id` | 删除会话 | ✅ |
| GET | `/api/aichat/sessions/:id/messages` | 获取消息历史 | ✅ |
| POST | `/api/aichat/sessions/:id/messages` | 发送消息 | ✅ |

### 用户私信

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/userchat/conversations` | 获取对话列表 | ✅ |
| POST | `/api/userchat/conversations` | 创建/打开对话 | ✅ |
| GET | `/api/userchat/conversations/:id/messages` | 获取消息历史 | ✅ |
| POST | `/api/userchat/conversations/:id/messages` | 发送消息 | ✅ |
| GET | `/api/userchat/users/search` | 搜索用户 | ✅ |

## ⚙️ 配置说明

### AI 对话功能配置

AI 聊天功能需要配置大模型 API 密钥。支持以下选项：

#### 选项 1: OpenAI（推荐）

1. 前往 [OpenAI Platform](https://platform.openai.com) 注册账号
2. 创建 API Key
3. 在 `server/.env` 中配置：
   ```env
   LLM_API_KEY=sk-your-api-key
   LLM_API_BASE=https://api.openai.com/v1
   LLM_MODEL=gpt-4o-mini
   ```

#### 选项 2: 国内 AI 服务

支持任何兼容 OpenAI 接口的服务，如：
- 阿里云通义千问
- 智谱 AI
- Moonshot (Kimi)
- 其他...

```env
LLM_API_KEY=your-api-key
LLM_API_BASE=https://your-service-url/v1
LLM_MODEL=your-model-name
```

#### 选项 3: Ollama 本地部署

适合有本地 GPU 的用户：

1. 安装 [Ollama](https://ollama.com)
2. 拉取模型：`ollama pull qwen2.5`
3. 配置：
   ```env
   LLM_API_BASE=http://localhost:11434/v1
   LLM_MODEL=qwen2.5
   LLM_API_KEY=随便填或不填
   ```

### 文件上传

上传的图片存储在 `server/uploads/` 目录，通过 `/uploads/:filename` 访问。

## 🎯 使用指南

### 发布动态

1. 登录账号
2. 进入"社区"页面
3. 点击右下角浮动按钮（✏️ 图标）
4. 填写内容（可选添加图片）
5. 点击"发布"

### 提出问题

1. 切换到"问答"标签
2. 点击右下角浮动按钮
3. 填写标题和详细描述
4. 点击"发布"

### 使用 AI 对话

1. 点击首页"AI 问答"或底部导航的 AI 图标
2. 输入你的农业相关问题
3. AI 会提供专业建议
4. 可以创建多个会话管理不同话题

## 🔒 安全性

- JWT Token 认证保护用户数据
- 密码加密存储（bcrypt）
- 文件上传验证（仅允许图片）
- SQL 注入防护（参数化查询）
- CORS 配置

## 🐛 常见问题

### Q: AI 对话返回 "未配置大模型 API 密钥"

**A:** 请在 `server/.env` 中配置 `LLM_API_KEY`，参考 [AI 配置说明](#ai-对话功能配置)。

### Q: 前端请求返回 401 Unauthorized

**A:** 请先登录，部分功能需要认证后才能使用。

### Q: 图片上传失败

**A:** 确保 `server/uploads/` 目录存在且有写权限。

### Q: 数据库连接失败

**A:** 检查 `server/.env` 中的数据库配置是否正确，并确保 MySQL 服务运行中。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提 Issue 或联系开发者。

---

<div align="center">

**🌱 GrowPal - 让农业更智能，让社区更紧密**

Made with ❤️ for Agriculture Community

</div>
