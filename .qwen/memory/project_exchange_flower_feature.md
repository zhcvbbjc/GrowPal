---
name: 换花帖子功能实现
description: 换花帖子功能的完整实现细节，包括后端API和前端组件
type: project
---

换花帖子（exchange_flowers）功能已实现，基本照搬帖子(post)功能，但有以下区别：

**后端实现：**
- 数据库表：`exchange_flowers`，主键为 `exchange_id`
- 移除了 `ai_summary` 字段
- 新增了 `exchange_status` 字段（pending待交换/confirmed已确认/completed已完成）
- 模型文件：`server/models/ExchangeFlower.js`
- 控制器：`server/controllers/exchangeFlowerController/` 目录（包含主控制器、点赞控制器、评论控制器）
- 路由：`server/routes/exchangeFlowers.js`，注册在 `/api/exchange-flowers`
- 点赞和评论复用现有的 `Like` 和 `Comment` 模型，`target_type` 为 `'exchange_flower'`

**前端实现：**
- API服务：`client/src/services/growpalApi.ts` 中添加了 `ExchangeFlowerRow` 类型和相关API函数
- 列表页：在 `CommunityScreen.tsx` 中添加了"🌸 换花"标签
- 详情页：`client/src/pages/ExchangeFlowerDetailPage.tsx`
- 感兴趣按钮：在详情页底部，点击后私信作者（跳转到chat界面）

**Why:** 用户需要在社区中添加换花功能，让用户可以发布换花帖子并私信作者。

**How to apply:** 
- 换花帖子的CRUD逻辑与普通帖子类似，但使用独立的API端点和组件
- 点赞和评论复用相同的表和模型，通过 `target_type` 区分
- 详情页的"感兴趣"按钮会引导用户私信作者
