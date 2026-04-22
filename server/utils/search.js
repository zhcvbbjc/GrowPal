const { Meilisearch } = require('meilisearch');
const db = require('../config/database');

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY || '';

const client = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_KEY,
});

const searchService = {
  indexes: {
    users: 'growpal_users',
    posts: 'growpal_posts',
    questions: 'growpal_questions',
  },

  async initializeIndexes() {
    try {
      console.log('[搜索] 初始化索引...');

      for (const [key, indexName] of Object.entries(this.indexes)) {
        await client.createIndex(indexName, { primaryKey: 'id' });
        console.log(`[搜索] 索引 ${indexName} 创建成功`);
      }

      await client.index(this.indexes.users).updateSettings({
        searchableAttributes: ['username', 'bio'],
        displayedAttributes: ['id', 'username', 'bio', 'avatar', 'role'],
        rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      });

      await client.index(this.indexes.posts).updateSettings({
        searchableAttributes: ['title', 'content', 'tags'],
        displayedAttributes: ['id', 'user_id', 'title', 'content', 'tags', 'cover_image', 'created_at'],
        sortableAttributes: ['created_at'],
        rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      });

      await client.index(this.indexes.questions).updateSettings({
        searchableAttributes: ['title', 'content', 'tags'],
        displayedAttributes: ['id', 'user_id', 'title', 'content', 'tags', 'created_at'],
        sortableAttributes: ['created_at'],
        rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      });

      console.log('[搜索] 索引设置完成');
      return { success: true };
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('[搜索] 索引已存在，跳过创建');
        return { success: true };
      }
      console.error('[搜索] 初始化索引失败:', error.message);
      return { success: false, message: error.message };
    }
  },

  async syncUsers() {
    try {
      console.log('[搜索] 同步用户数据...');
      const [users] = await db.query('SELECT user_id as id, username, bio, avatar, role FROM users WHERE is_active = 1');

      if (users.length > 0) {
        await client.index(this.indexes.users).addDocuments(users);
        console.log(`[搜索] 同步了 ${users.length} 个用户`);
      }

      return { success: true, count: users.length };
    } catch (error) {
      console.error('[搜索] 同步用户数据失败:', error.message);
      return { success: false, message: error.message };
    }
  },

  async syncPosts() {
    try {
      console.log('[搜索] 同步帖子数据...');
      const [posts] = await db.query(`
        SELECT post_id as id, user_id, title, content, tags, cover_image, created_at
        FROM posts
        WHERE status = 'published'
      `);

      if (posts.length > 0) {
        await client.index(this.indexes.posts).addDocuments(posts);
        console.log(`[搜索] 同步了 ${posts.length} 个帖子`);
      }

      return { success: true, count: posts.length };
    } catch (error) {
      console.error('[搜索] 同步帖子数据失败:', error.message);
      return { success: false, message: error.message };
    }
  },

  async syncQuestions() {
    try {
      console.log('[搜索] 同步问题数据...');
      const [questions] = await db.query(`
        SELECT question_id as id, user_id, title, content, tags, created_at
        FROM questions
        WHERE status = 'open'
      `);

      if (questions.length > 0) {
        await client.index(this.indexes.questions).addDocuments(questions);
        console.log(`[搜索] 同步了 ${questions.length} 个问题`);
      }

      return { success: true, count: questions.length };
    } catch (error) {
      console.error('[搜索] 同步问题数据失败:', error.message);
      return { success: false, message: error.message };
    }
  },

  async syncAll() {
    console.log('[搜索] 开始全量同步...');
    const results = await Promise.all([
      this.syncUsers(),
      this.syncPosts(),
      this.syncQuestions(),
    ]);
    console.log('[搜索] 全量同步完成');
    return results;
  },

  async searchUsers(keyword) {
    try {
      console.log(`[搜索] 搜索用户关键词: ${keyword}`);
      const result = await client.index(this.indexes.users).search(keyword, { limit: 10 });
      console.log(`[搜索] 找到 ${result.hits.length} 个用户`);
      return { success: true, hits: result.hits };
    } catch (error) {
      console.error('[搜索] 搜索用户失败:', error.message);
      return { success: false, hits: [], message: error.message };
    }
  },

  async searchPostsByTitle(keyword) {
    try {
      console.log(`[搜索] 按标题搜索帖子关键词: ${keyword}`);
      const result = await client.index(this.indexes.posts).search(keyword, {
        limit: 10,
        attributesToSearchOn: ['title'],
        sort: ['created_at:desc'],
      });
      console.log(`[搜索] 按标题找到 ${result.hits.length} 个帖子`);
      return { success: true, hits: result.hits };
    } catch (error) {
      console.error('[搜索] 搜索帖子标题失败:', error.message);
      return { success: false, hits: [], message: error.message };
    }
  },

  async searchPostsByContent(keyword) {
    try {
      console.log(`[搜索] 按内容搜索帖子关键词: ${keyword}`);
      const result = await client.index(this.indexes.posts).search(keyword, {
        limit: 10,
        attributesToSearchOn: ['content'],
        sort: ['created_at:desc'],
      });
      console.log(`[搜索] 按内容找到 ${result.hits.length} 个帖子`);
      return { success: true, hits: result.hits };
    } catch (error) {
      console.error('[搜索] 搜索帖子内容失败:', error.message);
      return { success: false, hits: [], message: error.message };
    }
  },

  async searchQuestionsByTitle(keyword) {
    try {
      console.log(`[搜索] 按标题搜索问题关键词: ${keyword}`);
      const result = await client.index(this.indexes.questions).search(keyword, {
        limit: 10,
        attributesToSearchOn: ['title'],
        sort: ['created_at:desc'],
      });
      console.log(`[搜索] 按标题找到 ${result.hits.length} 个问题`);
      return { success: true, hits: result.hits };
    } catch (error) {
      console.error('[搜索] 搜索问题标题失败:', error.message);
      return { success: false, hits: [], message: error.message };
    }
  },

  async searchQuestionsByContent(keyword) {
    try {
      console.log(`[搜索] 按内容搜索问题关键词: ${keyword}`);
      const result = await client.index(this.indexes.questions).search(keyword, {
        limit: 10,
        attributesToSearchOn: ['content'],
        sort: ['created_at:desc'],
      });
      console.log(`[搜索] 按内容找到 ${result.hits.length} 个问题`);
      return { success: true, hits: result.hits };
    } catch (error) {
      console.error('[搜索] 搜索问题内容失败:', error.message);
      return { success: false, hits: [], message: error.message };
    }
  },

  async comprehensiveSearch(keyword) {
    try {
      console.log(`[搜索] 开始综合搜索，关键词: ${keyword}`);

      const [users, postsByTitle, postsByContent, questionsByTitle, questionsByContent] = await Promise.all([
        this.searchUsers(keyword),
        this.searchPostsByTitle(keyword),
        this.searchPostsByContent(keyword),
        this.searchQuestionsByTitle(keyword),
        this.searchQuestionsByContent(keyword),
      ]);

      const results = {
        users: users.hits,
        postsByTitle: postsByTitle.hits,
        postsByContent: postsByContent.hits,
        questionsByTitle: questionsByTitle.hits,
        questionsByContent: questionsByContent.hits,
      };

      const totalHits = users.hits.length + postsByTitle.hits.length + postsByContent.hits.length +
                       questionsByTitle.hits.length + questionsByContent.hits.length;
      console.log(`[搜索] 综合搜索完成，共 ${totalHits} 条结果`);

      return { success: true, results };
    } catch (error) {
      console.error('[搜索] 综合搜索失败:', error.message);
      return { success: false, message: error.message };
    }
  },

  async checkConnection() {
    try {
      const health = await client.health();
      console.log('[搜索] Meilisearch 连接成功:', health);
      return { success: true, status: health };
    } catch (error) {
      console.error('[搜索] Meilisearch 连接失败:', error.message);
      return { success: false, message: error.message };
    }
  },
};

module.exports = searchService;
