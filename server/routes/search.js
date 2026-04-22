const express = require('express');
const router = express.Router();
const db = require('../config/database');
const searchService = require('../utils/search');

router.get('/health', async (req, res) => {
  try {
    const health = await searchService.checkConnection();
    res.json(health);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/initialize', async (req, res) => {
  try {
    console.log('[API] 初始化搜索索引...');
    const initResult = await searchService.initializeIndexes();

    if (!initResult.success) {
      return res.status(500).json(initResult);
    }

    const syncResults = await searchService.syncAll();

    res.json({
      success: true,
      message: '搜索服务初始化完成',
      sync: syncResults,
    });
  } catch (error) {
    console.error('[API] 初始化搜索服务失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sync', async (req, res) => {
  try {
    const syncResults = await searchService.syncAll();
    res.json({ success: true, sync: syncResults });
  } catch (error) {
    console.error('[API] 同步数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        results: {
          users: [],
          postsByTitle: [],
          postsByContent: [],
          questionsByTitle: [],
          questionsByContent: [],
        },
        hasResults: false,
      });
    }

    console.log(`[API] 收到搜索请求，关键词: ${q}`);
    const searchResult = await searchService.comprehensiveSearch(q);

    if (!searchResult.success) {
      return res.status(500).json(searchResult);
    }

    const userIds = [
      ...searchResult.results.users.map(u => u.id),
      ...searchResult.results.postsByTitle.map(p => p.user_id),
      ...searchResult.results.postsByContent.map(p => p.user_id),
      ...searchResult.results.questionsByTitle.map(q => q.user_id),
      ...searchResult.results.questionsByContent.map(q => q.user_id),
    ];

    const uniqueUserIds = [...new Set(userIds)];
    let usersMap = {};

    if (uniqueUserIds.length > 0) {
      const [users] = await db.query(`
        SELECT user_id, username, avatar, bio
        FROM users
        WHERE user_id IN (${uniqueUserIds.join(',')})
      `);
      usersMap = users.reduce((acc, u) => {
        acc[u.user_id] = u;
        return acc;
      }, {});
    }

    const enrichWithUserInfo = (items, type) => {
      return items.map(item => ({
        id: item.id,
        type,
        title: item.title,
        content: item.content,
        tags: item.tags ? item.tags.split(',').filter(t => t) : [],
        cover_image: item.cover_image,
        created_at: item.created_at,
        user: usersMap[item.user_id] || null,
      }));
    };

    const results = {
      users: searchResult.results.users.map(user => ({
        ...user,
        user_id: user.id,
      })),
      postsByTitle: enrichWithUserInfo(searchResult.results.postsByTitle, 'post'),
      postsByContent: enrichWithUserInfo(searchResult.results.postsByContent, 'post'),
      questionsByTitle: enrichWithUserInfo(searchResult.results.questionsByTitle, 'question'),
      questionsByContent: enrichWithUserInfo(searchResult.results.questionsByContent, 'question'),
    };

    const hasResults =
      results.users.length > 0 ||
      results.postsByTitle.length > 0 ||
      results.postsByContent.length > 0 ||
      results.questionsByTitle.length > 0 ||
      results.questionsByContent.length > 0;

    res.json({
      success: true,
      results,
      hasResults,
    });
  } catch (error) {
    console.error('[API] 搜索失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
