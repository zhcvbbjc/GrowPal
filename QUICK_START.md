# 🚀 GrowPal 快速启动指南

## 完成所有改进后的总结

✅ **已完成的改进:**

1. **AI 聊天功能配置优化**
   - 更新了 `.env` 配置文件,添加了详细的配置说明
   - 创建了 `.env.example` 示例文件
   - 支持多种 AI 服务: OpenAI、国内服务、Ollama 本地部署

2. **社区页面添加发布入口**
   - 在右下角添加了浮动发布按钮 (✏️ 图标)
   - 实现了完整的发布表单弹窗
   - 支持发布动态和提问,可上传图片
   - 根据当前标签自动切换发布类型

3. **首页美化**
   - 快捷功能图标统一使用 Lucide React 图标
   - 替换了 emoji,视觉更统一
   - 优化了种植小贴士的图标展示

4. **完整的项目文档**
   - 创建了详细的 README.md
   - 包含功能介绍、技术栈、API 文档、配置说明等

## 启动步骤

### 1️⃣ 配置 AI API (可选但推荐)

编辑 `server/.env` 文件,添加以下配置:

```env
# 使用 OpenAI (推荐)
LLM_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-4o-mini

# 或使用 Ollama 本地部署
# LLM_API_BASE=http://localhost:11434/v1
# LLM_MODEL=qwen2.5
```

**如何获取 API Key:**
- OpenAI: https://platform.openai.com
- Ollama: https://ollama.com (免费,本地运行)

### 2️⃣ 启动后端服务

```bash
cd server
node index.js
```

你会看到: `✅ GrowPal 后端: http://localhost:5000`

### 3️⃣ 启动前端服务

打开新终端:

```bash
cd client
npm run dev
```

你会看到: `http://localhost:3000`

### 4️⃣ 访问应用

在浏览器打开: `http://localhost:3000`

## 测试清单

- [ ] 注册新账号
- [ ] 登录成功
- [ ] 发布一条动态
- [ ] 提出一个问题
- [ ] 查看动态和问题列表
- [ ] 尝试 AI 对话 (需要先配置 API)
- [ ] 查看个人主页

## 常见问题

### Q: AI 对话返回错误?
A: 请检查 `server/.env` 中是否配置了 `LLM_API_KEY`

### Q: 无法连接后端?
A: 确保 MySQL 正在运行,且 `server/.env` 中的数据库配置正确

### Q: 前端页面空白?
A: 检查浏览器控制台是否有错误,确认后端服务已启动

## 下一步

- 邀请朋友一起使用
- 探索所有功能
- 提交 Issue 或建议

---

**享受你的农业智能之旅! 🌱**
