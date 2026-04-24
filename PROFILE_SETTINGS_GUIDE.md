# 个人信息设置功能说明

## 功能概述

已完成个人信息设置页面的开发，用户可以在此页面修改：
- 用户名（唯一）
- 用户邮箱（唯一）
- 用户头像（图片上传）
- 个人简介（Bio）

## 数据库变更

### 新增字段（`users` 表）

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `bio` | TEXT | 个人简介 | NULL |
| `role` | VARCHAR(32) | 用户角色 | 'user' |
| `is_active` | TINYINT(1) | 是否激活 | 1 |
| `updated_at` | TIMESTAMP | 更新时间 | CURRENT_TIMESTAMP |

### 迁移脚本

已创建数据库迁移脚本：`server/migrations/add_user_profile_fields.sql`

执行方式：
```bash
cd server
node migrate.js
```

## 后端 API 变更

### 1. 修改 `GET /api/auth/me`

**返回字段新增：**
- `bio`: 个人简介
- `role`: 用户角色

**示例响应：**
```json
{
  "id": 1,
  "nickname": "testuser",
  "avatar": "/uploads/abc123.jpg",
  "phone": "13800138000",
  "email": "test@example.com",
  "bio": "这是我的个人简介",
  "role": "user"
}
```

### 2. 新增 `PUT /api/auth/profile`

**功能：** 更新用户个人信息（用户名、邮箱、个人简介）

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "newname",
  "email": "newemail@example.com",
  "bio": "新的个人简介"
}
```

**响应：**
```json
{
  "message": "更新成功",
  "user": {
    "id": 1,
    "nickname": "newname",
    "avatar": "/uploads/abc123.jpg",
    "phone": "13800138000",
    "email": "newemail@example.com",
    "bio": "新的个人简介",
    "role": "user"
  }
}
```

**验证规则：**
- 用户名唯一性检查（不能与其他用户重复）
- 邮箱唯一性检查（不能与其他用户重复）

### 3. 新增 `POST /api/auth/avatar`

**功能：** 上传/更新用户头像

**请求头：**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体：**
- `avatar`: 图片文件（File 类型）

**响应：**
```json
{
  "message": "头像上传成功",
  "avatar": "/uploads/uuid.jpg"
}
```

**限制：**
- 仅支持图片格式（JPG、PNG、GIF 等）
- 文件大小限制：5MB
- 文件命名：UUID + 原始扩展名

## 前端变更

### 1. 新增页面：`ProfileSettingsScreen`

**文件路径：** `client/src/pages/ProfileSettingsScreen.tsx`

**功能：**
- 显示当前用户信息（用户名、邮箱、头像、个人简介）
- 修改用户名、邮箱、个人简介
- 上传/更换头像（点击头像区域即可上传）
- 表单验证（文件大小、文件类型）
- 实时字数统计（个人简介）

**访问方式：**
1. 进入"我的"页面
2. 点击"个人信息"设置项
3. 进入个人信息设置页面

### 2. 修改 `ProfileScreen`

**变更：**
- 个人简介显示逻辑：如果用户设置了 bio，显示 bio；否则显示"用户个人简介"
- 个人信息设置项描述更新为"修改用户名、头像、邮箱和个人简介"
- 添加点击跳转到设置页面功能

### 3. API 服务更新

**文件：** `client/src/services/growpalApi.ts`

**新增函数：**
- `updateProfile(payload)`: 更新用户信息
- `uploadAvatar(file)`: 上传头像

**修改函数：**
- `fetchMe()`: 返回值新增 `bio` 和 `role` 字段

## 文件存储

### 头像存储位置

`server/uploads/` 目录

### 存储规则

- 文件名：UUID + 原始扩展名（如 `a1b2c3d4-e5f6.jpg`）
- 访问路径：`/uploads/filename.jpg`（通过静态文件服务）
- Vite 代理：已配置 `/uploads` 代理到后端 `http://localhost:5000`

## 测试清单

### 后端测试

- [x] 数据库迁移执行成功
- [x] `GET /api/auth/me` 返回 bio 和 role 字段
- [x] `PUT /api/auth/profile` 更新用户信息
- [x] `POST /api/auth/avatar` 上传头像
- [x] 用户名唯一性验证
- [x] 邮箱唯一性验证

### 前端测试

- [x] 页面路由配置正确
- [x] 个人信息页面可以跳转到设置页面
- [x] 设置页面显示当前用户信息
- [x] 修改用户信息并保存
- [x] 上传头像功能
- [x] 表单验证（文件大小、类型）
- [x] 成功/错误提示消息

## 使用说明

### 启动服务

**后端：**
```bash
cd server
node index.js
```

**前端：**
```bash
cd client
npm run dev
```

### 使用流程

1. 登录系统
2. 点击底部导航"我的"
3. 点击"个人信息"设置项
4. 在设置页面：
   - 修改用户名、邮箱、个人简介
   - 点击头像区域上传新头像
   - 点击"保存修改"按钮保存更改

## 注意事项

1. **头像上传限制**
   - 仅支持图片文件
   - 最大文件大小：5MB
   - 上传后自动重命名为 UUID 格式

2. **唯一性约束**
   - 用户名不能与其他用户重复
   - 邮箱不能与其他用户重复

3. **数据同步**
   - 修改成功后会自动更新本地缓存（localStorage）
   - 头像和个人信息实时同步到各个页面

4. **数据库迁移**
   - 如果是首次部署，需要执行迁移脚本添加新字段
   - 迁移脚本会自动跳过已存在的字段

## 相关文件

### 后端
- `server/schema.sql` - 数据库表结构
- `server/migrations/add_user_profile_fields.sql` - 迁移脚本
- `server/controllers/authController/authController.js` - 控制器
- `server/routes/auth.js` - 路由配置
- `server/utils/upload.js` - 文件上传配置
- `server/migrate.js` - 迁移执行脚本

### 前端
- `client/src/pages/ProfileSettingsScreen.tsx` - 个人信息设置页面
- `client/src/pages/ProfileScreen.tsx` - 个人主页
- `client/src/services/growpalApi.ts` - API 服务
- `client/src/pages/Icons.tsx` - 图标组件
- `client/src/types.ts` - 类型定义
- `client/src/App.tsx` - 路由配置
