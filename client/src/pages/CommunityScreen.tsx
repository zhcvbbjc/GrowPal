import React, { useEffect, useState } from 'react';
import {
  Psychology,
  ArrowForward,
  Favorite,
  ChatBubble,
  Loader2,
  EditSquare,
  X,
  User,
  Calendar,
} from './Icons';
import { cn } from '../lib/utils';
import {
  fetchPosts,
  fetchQuestions,
  getApiMessage,
  type PostRow,
  type QuestionRow,
  createPost,
  createQuestion,
} from '../services/growpalApi';
import { PostDetailPage } from './PostDetailPage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

type Tab = 'posts' | 'questions';

export const CommunityScreen = () => {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ type: 'post' | 'question'; id: number } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, q] = await Promise.all([fetchPosts(), fetchQuestions()]);
      setPosts(p);
      setQuestions(q);
    } catch (e) {
      setError(getApiMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, q] = await Promise.all([fetchPosts(), fetchQuestions()]);
        if (cancelled) return;
        setPosts(p);
        setQuestions(q);
      } catch (e) {
        if (!cancelled) setError(getApiMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePublish = async (content: string, title?: string, image?: File | null, tags?: string[]) => {
    try {
      if (tab === 'posts') {
        await createPost(content, image, title, tags);
        toast.success('发布成功');
      } else {
        if (!title) {
          toast.error('请输入问题标题');
          return;
        }
        await createQuestion(title, content, image, tags);
        toast.success('提问成功');
      }
      setShowPublishModal(false);
      await refreshData();
    } catch (e) {
      toast.error(getApiMessage(e));
    }
  };

  if (detail) {
    return (
      <PostDetailPage type={detail.type} id={detail.id} onBack={() => setDetail(null)} />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 relative">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4 sticky top-0 z-30 bg-surface/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-2 overflow-x-auto pb-0 no-scrollbar">
          {(
            [
              { id: 'posts' as const, label: '📝 动态' },
              { id: 'questions' as const, label: '❓ 问答' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all',
                tab === t.id
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              toast.error('请先登录后再发布内容');
              return;
            }
            setShowPublishModal(true);
          }}
          className="flex-shrink-0 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg active:scale-95 hover:scale-105 transition-transform flex items-center gap-2 border-2 border-primary/20"
        >
          <EditSquare className="w-5 h-5" />
          <span>{tab === 'posts' ? '✍️ 写文章' : '❓ 提问题'}</span>
        </button>
      </div>

      <div className="space-y-8 mt-4">
        <div className="bg-secondary-container/30 border border-secondary-container/20 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-surface-container-lowest backdrop-blur-xl px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
              <Psychology className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                AI Insight
              </span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">
            社区数据已连接后端
          </h3>
          <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
            浏览用户发布的种植动态与提问，登录后可点赞与评论。
          </p>
          <div className="flex gap-4">
            <span className="text-primary text-sm font-bold flex items-center gap-1">
              GrowPal API <ArrowForward className="w-4 h-4" />
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error-container/30 text-error text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : tab === 'posts' ? (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm py-12">暂无动态</p>
            ) : (
              posts.map((post) => (
                <button
                  key={post.post_id}
                  type="button"
                  onClick={() => setDetail({ type: 'post', id: post.post_id })}
                  className="w-full text-left bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all hover:translate-y-[-2px] editorial-shadow border border-outline-variant/5"
                >
                  <div className="p-5">
                    {/* 作者信息 */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">
                          {post.username || '匿名用户'}
                        </p>
                        {post.created_at && (
                          <p className="text-[10px] text-on-surface-variant">
                            {new Date(post.created_at).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </div>
                    </div>
                    {post.title && (
                      <h4 className="text-base font-bold text-on-surface mb-2 font-headline line-clamp-2">
                        {post.title}
                      </h4>
                    )}
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {JSON.parse(post.tags).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-on-surface text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                  {post.image_path && (
                    <div className="relative h-48 w-full">
                      <img
                        src={post.image_path}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="p-4 flex items-center gap-6 border-t border-surface-container pointer-events-none">
                    <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                      <Favorite className="w-4 h-4" /> {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                      <ChatBubble className="w-4 h-4" /> {post.comment_count || 0}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {questions.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm py-12">暂无问题</p>
            ) : (
              questions.map((q) => (
                <button
                  key={q.question_id}
                  type="button"
                  onClick={() => setDetail({ type: 'question', id: q.question_id })}
                  className="w-full text-left bg-surface-container-lowest rounded-xl shadow-sm p-6 transition-all hover:translate-y-[-2px] editorial-shadow border border-outline-variant/5"
                >
                  {/* 作者信息 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">
                        {q.username || '匿名用户'}
                      </p>
                      {q.created_at && (
                        <p className="text-[10px] text-on-surface-variant">
                          {new Date(q.created_at).toLocaleString('zh-CN')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="text-lg font-bold text-on-surface font-headline flex-1">{q.title}</h4>
                    {q.tags && (
                      <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                        {JSON.parse(q.tags).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium whitespace-nowrap"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {q.content}
                  </p>
                  {q.image_path && (
                    <div className="mt-4 h-36 rounded-xl overflow-hidden">
                      <img
                        src={q.image_path}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-6 pointer-events-none">
                    <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                      <Favorite className="w-4 h-4" /> {q.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                      <ChatBubble className="w-4 h-4" /> {q.comment_count || 0}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 发布弹窗 */}
      {showPublishModal && (
        <PublishModal
          type={tab}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

// 发布弹窗组件
const PublishModal = ({
  type,
  onClose,
  onPublish
}: {
  type: Tab;
  onClose: () => void;
  onPublish: (content: string, title?: string, image?: File | null, tags?: string[]) => void;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      return;
    }
    if (type === 'questions' && !title.trim()) {
      return;
    }
    onPublish(
      content,
      type === 'questions' ? title : (title.trim() || undefined),
      image,
      tags.length > 0 ? tags : undefined
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-outline-variant/10 px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-on-surface">
            {type === 'posts' ? '发布动态' : '提问题'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              标题 {type === 'questions' && <span className="text-error">*</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'posts' ? '输入文章标题（可选）...' : '请输入问题标题...'}
              className="w-full px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              内容 <span className="text-error">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'posts' ? '分享你的想法...' : '详细描述你的问题...'}
              className="w-full px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              标签（可选，最多5个）
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签后按回车或逗号"
                  className="flex-1 px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
                >
                  添加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-error transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              图片 (可选)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {image && (
              <p className="mt-2 text-sm text-on-surface-variant">
                已选择: {image.name}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || (type === 'questions' && !title.trim())}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  );
};
