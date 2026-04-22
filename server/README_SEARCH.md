# GrowPal 搜索功能说明

## 概述

GrowPal 现在集成了 Meilisearch 作为搜索引擎，支持以下搜索功能：

1. **用户搜索** - 搜索用户名和简介
2. **动态搜索** - 搜索帖子标题和内容
3. **问答搜索** - 搜索问题标题和内容

## Meilisearch 安装和启动

### 方法 1: 使用 Docker（推荐）

```bash
# 启动 Meilisearch（仅用于开发，无认证）
docker run -d -p 7700:7700 --name meilisearch getmeili/meilisearch:latest

# 如果需要生产环境（带 Master Key）
docker run -d -p 7700:7700 -e MEILI_MASTER_KEY=your-secret-key --name meilisearch getmeili/meilisearch:latest
```

### 方法 2: 使用 Windows 可执行文件

1. 从 [Meilisearch 官网](https://www.meilisearch.com/docs/learn/getting_started/installation_guide#download-and-launch) 下载 Windows 版本
2. 解压后运行 `meilisearch.exe`
3. 服务将在 http://localhost:7700 启动

### 方法 3: 使用 Chocolatey

```bash
choco install meilisearch
meilisearch
```

## 后端配置

在 `.env` 文件中已添加以下配置：

```env
# Meilisearch 配置
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=
```

如果没有设置 Master Key，则 `MEILISEARCH_KEY` 可以留空。

## 搜索服务初始化

后端服务器启动时会自动尝试初始化搜索索引。如果 Meilisearch 未运行，会跳过初始化。

也可以手动初始化：

```bash
# 初始化索引并同步数据
curl http://localhost:5000/api/search/initialize

# 只同步最新数据
curl http://localhost:5000/api/search/sync

# 检查 Meilisearch 连接状态
curl http://localhost:5000/api/search/health
```

## API 接口

### GET /api/search?q=keyword

综合搜索接口，返回分类结果。

**参数：**
- `q`: 搜索关键词

**响应示例：**

```json
{
  "success": true,
  "results": {
    "users": [
      {
        "id": 1,
        "user_id": 1,
        "username": "张三",
        "bio": "农业爱好者",
        "avatar": "http://...",
        "role": "user"
      }
    ],
    "postsByTitle": [
      {
        "id": 1,
        "type": "post",
        "title": "春季种植技巧",
        "content": "...",
        "tags": ["种植", "春播"],
        "created_at": "2024-04-22T10:00:00.000Z",
        "user": { "user_id": 1, "username": "张三", "avatar": "..." }
      }
    ],
    "postsByContent": [...],
    "questionsByTitle": [...],
    "questionsByContent": [...]
  },
  "hasResults": true
}
```

## 搜索界面

前端已添加搜索页面 (`SearchScreen`)，可以从首页搜索框进入。

搜索结果按以下顺序显示：
1. 用户匹配
2. 帖子标题匹配（按时间倒序）
3. 帖子内容匹配（按时间倒序）
4. 问题标题匹配（按时间倒序）
5. 问题内容匹配（按时间倒序）

如果没有搜索结果，会显示最新的动态和问答作为兜底。

## 维护

定期同步数据到搜索索引：

```bash
curl http://localhost:5000/api/search/sync
```

建议在发布新内容后自动触发同步，或设置定时任务。
