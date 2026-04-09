# GrowPal 使用指南

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+ 
- MySQL 8+
- npm 或 pnpm

### 2. 数据库配置

首先创建数据库和表：

```bash
cd D:\GrowPal\server
mysql -u root -p < schema.sql
```

### 3. 环境变量配置

在 `server` 目录下创建 `.env` 文件：

```env
# 服务器配置
PORT=5000

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=GrowPal

# JWT 配置
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# AI 大模型配置（OpenAI 兼容 API）
LLM_API_KEY=your_openai_api_key
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.7
LLM_SYSTEM_PROMPT=你是 GrowPal 应用里的智能助手，回答简洁、友好、准确，使用简体中文。
```

### 4. 启动服务

#### 方式一：分别启动

**启动后端：**
```bash
cd D:\GrowPal\server
npm install
node index.js
```

**启动前端：**
```bash
cd D:\GrowPal\client
npm install
npm run dev
```

#### 方式二：使用批处理脚本（推荐）

创建 `start.bat` 在 `D:\GrowPal` 目录：

```bat
@echo off
echo Starting GrowPal Backend...
start cmd /k "cd /d D:\GrowPal\server && node index.js"

timeout /t 3 /nobreak >nul

echo Starting GrowPal Frontend...
start cmd /k "cd /d D:\GrowPal\client && npm run dev"

echo.
echo GrowPal is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
```

### 5. 访问应用

打开浏览器访问：**http://localhost:3000**

## 📱 功能使用

### 1. 注册/登录

1. 点击底部导航栏"我的"
2. 如果未登录会自动跳转到登录页
3. 新用户点击"去注册"
4. 输入昵称、手机号、密码
5. 点击"获取验证码"（验证码会在后端控制台显示）
6. 输入验证码完成注册

### 2. AI 对话

1. 点击底部导航栏"AI 对话"
2. 在输入框输入问题
3. 按 Enter 或点击发送按钮
4. 查看 AI 回复

**示例问题：**
- 如何预防小麦锈病？
- 水稻最佳灌溉频率是什么？
- 番茄叶子发黄怎么办？

### 3. 社区互动

**浏览动态：**
1. 点击"社区"
2. 切换"动态"或"问答"标签
3. 点击任意帖子查看详情

**发评论：**
1. 点击帖子进入详情
2. 在底部输入评论内容
3. 点击"发布评论"

**点赞：**
1. 在帖子详情页
2. 点击爱心图标

### 4. 用户私信

**搜索用户：**
1. 点击"消息"
2. 在搜索框输入用户名
3. 点击搜索结果中的用户开始聊天

**发送消息：**
1. 在聊天界面
2. 输入消息内容
3. 按 Enter 或点击发送

### 5. 个人中心

1. 点击"我的"
2. 查看个人信息
3. 点击"退出登录"退出

## 🎨 界面说明

### 底部导航栏

| 图标 | 功能 | 说明 |
|------|------|------|
| 🏠 | 首页 | 快捷入口、动态预览、AI 推荐 |
| 👥 | 社区 | 浏览帖子和问题 |
| 🤖 | AI 对话 | 与 AI 助手对话 |
| 💬 | 消息 | 用户间私信 |
| 👤 | 我的 | 个人中心 |

### 首页功能

- **搜索框** - 搜索作物、病虫害等信息
- **AI 卡片** - 快速进入 AI 对话
- **快捷功能** - 四个常用功能入口
- **统计数据** - 社区活跃度
- **最新动态** - 实时社区动态
- **种植小贴士** - 实用种植技巧

### AI 对话功能

- **新建对话** - 创建新会话
- **历史会话** - 查看和管理历史对话
- **删除会话** - 长按或点击删除图标
- **示例问题** - 空状态时显示推荐问题

## 🔧 常见问题

### 1. 登录失败

**问题：** 提示"用户名或密码错误"

**解决方案：**
- 检查用户名和密码是否正确
- 确认已注册该账号
- 检查后端服务是否正常运行

### 2. AI 对话无响应

**问题：** 发送消息后没有回复

**解决方案：**
- 检查 `LLM_API_KEY` 是否正确配置
- 查看后端控制台错误日志
- 确认网络连接正常

### 3. 验证码收不到

**问题：** 点击"获取验证码"没有反应

**解决方案：**
- 查看后端控制台，验证码会打印在那里
- 检查手机号格式是否正确（11位）
- 确认手机号未注册过

### 4. 页面加载慢

**问题：** 页面加载速度慢

**解决方案：**
- 检查数据库连接
- 优化后端查询性能
- 使用生产模式构建前端

## 🛠 开发模式

### 前端开发

```bash
cd D:\GrowPal\client
npm run dev        # 开发模式
npm run build      # 生产构建
npm run lint       # TypeScript 检查
```

### 后端开发

```bash
cd D:\GrowPal\server
node index.js      # 启动服务
nodemon index.js   # 自动重启（需安装 nodemon）
```

## 📊 API 文档

### 认证接口

- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### AI 对话接口

- `POST /api/aichat/sessions` - 创建会话
- `GET /api/aichat/sessions` - 获取会话列表
- `GET /api/aichat/sessions/:id/messages` - 获取消息
- `POST /api/aichat/sessions/:id/messages` - 发送消息
- `DELETE /api/aichat/sessions/:id` - 删除会话

### 用户私信接口

- `GET /api/userchat/users/search?q=xxx` - 搜索用户
- `GET /api/userchat/conversations` - 获取会话列表
- `POST /api/userchat/conversations` - 创建会话
- `GET /api/userchat/conversations/:id/messages` - 获取消息
- `POST /api/userchat/conversations/:id/messages` - 发送消息

### 社区接口

- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取帖子详情
- `GET /api/posts/:id/comments` - 获取评论
- `POST /api/posts/:id/comments` - 创建评论
- `POST /api/posts/:id/like` - 点赞

## 🎯 最佳实践

### 1. 测试账号

建议创建测试账号：
- 昵称：测试用户
- 手机号：13800138000
- 密码：123456

### 2. AI 测试问题

1. 如何提高水稻产量？
2. 有机肥料有哪些？
3. 大棚蔬菜种植注意事项
4. 如何防治蚜虫？
5. 土壤酸碱度如何调节？

### 3. 数据安全

- 不要在生产环境使用默认密码
- 定期更换 JWT_SECRET
- 启用 HTTPS
- 定期备份数据库

## 📞 技术支持

如遇到问题，请检查：

1. ✅ Node.js 版本 >= 18
2. ✅ MySQL 服务已启动
3. ✅ 环境变量配置正确
4. ✅ 端口未被占用
5. ✅ 网络连接正常

## 🎉 开始使用

现在你已经了解了 GrowPal 的所有功能，快去体验吧！

1. 启动后端和前端
2. 打开浏览器访问 http://localhost:3000
3. 注册账号
4. 开始使用 AI 对话、社区、私信等功能

**祝你使用愉快！** 🌱
