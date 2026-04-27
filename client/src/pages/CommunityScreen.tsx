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
  Plus,
  BookOpen,
  LocalFlorist,
} from './Icons';
import { cn } from '../lib/utils';
import {
  fetchPosts,
  fetchQuestions,
  fetchExchangeFlowers,
  getApiMessage,
  type PostRow,
  type QuestionRow,
  type ExchangeFlowerRow,
  createPost,
  createQuestion,
  createExchangeFlower,
} from '../services/growpalApi';
import { PostDetailPage } from './PostDetailPage';
import { ExchangeFlowerDetailPage } from './ExchangeFlowerDetailPage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

type Tab = 'posts' | 'questions' | 'exchange' | 'learn';

interface CommunityScreenProps {
  onNavigate?: (screen: any) => void;
  initialTab?: Tab;
}

export const CommunityScreen = ({ onNavigate, initialTab }: CommunityScreenProps) => {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>(initialTab || 'posts');
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [exchangeFlowers, setExchangeFlowers] = useState<ExchangeFlowerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ type: 'post' | 'question'; id: number } | null>(null);
  const [exchangeDetail, setExchangeDetail] = useState<{ id: number } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // 同步initialTab到tab状态
  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, q, e] = await Promise.all([fetchPosts(), fetchQuestions(), fetchExchangeFlowers()]);
      setPosts(p);
      setQuestions(q);
      setExchangeFlowers(e);
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
        const [p, q, e] = await Promise.all([fetchPosts(), fetchQuestions(), fetchExchangeFlowers()]);
        if (cancelled) return;
        setPosts(p);
        setQuestions(q);
        setExchangeFlowers(e);
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

  const handlePublish = async (content: string, title?: string, images?: File[], tags?: string[]) => {
    try {
      if (tab === 'posts') {
        await createPost(content, images, title, tags);
        toast.success('发布成功');
      } else if (tab === 'exchange') {
        await createExchangeFlower(content, images, title, tags, 'pending');
        toast.success('发布成功');
      } else {
        if (!title) {
          toast.error('请输入问题标题');
          return;
        }
        await createQuestion(title, content, images, tags);
        toast.success('提问成功');
      }
      setShowPublishModal(false);
      await refreshData();
    } catch (e) {
      toast.error(getApiMessage(e));
    }
  };

  if (exchangeDetail) {
    return (
      <ExchangeFlowerDetailPage
        id={exchangeDetail.id}
        onBack={() => setExchangeDetail(null)}
        onNavigate={onNavigate}
        onDeleted={async () => {
          setExchangeDetail(null);
          await refreshData();
        }}
      />
    );
  }

  if (detail) {
    return (
      <PostDetailPage
        type={detail.type}
        id={detail.id}
        onBack={() => setDetail(null)}
        onNavigate={onNavigate}
        onDeleted={async () => {
          setDetail(null);
          await refreshData();
        }}
      />
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
              { id: 'exchange' as const, label: '🌸 换花' },
              { id: 'questions' as const, label: '❓ 问答' },
              { id: 'learn' as const, label: '📖 学习' },
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
        ) : tab === 'learn' ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <BookOpen className="w-16 h-16 mb-4 text-primary/50" />
            <p className="text-lg font-bold mb-1">学习页面</p>
            <p className="text-sm">暂无内容，敬请期待</p>
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
                  <div className="flex p-5 gap-4">
                    {/* 左侧内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 作者信息 */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate && post.user_id) {
                                onNavigate({ screen: 'userPage', query: '', userId: post.user_id });
                              }
                            }}
                          >
                            {post.username || '匿名用户'}
                          </p>
                          {post.created_at && (
                            <p className="text-[10px] text-on-surface-variant">
                              {new Date(post.created_at).toLocaleString('zh-CN')}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* 标题和标签 */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {post.title && (
                          <h4 className="text-base font-bold text-on-surface font-headline line-clamp-1">
                            {post.title}
                          </h4>
                        )}
                        {post.tags && (
                          <div className="flex flex-wrap gap-1.5">
                            {JSON.parse(post.tags).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium whitespace-nowrap"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* 内容 - 两行 */}
                      <p className="text-on-surface text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap mb-3">
                        {post.content}
                      </p>
                    </div>
                    {/* 右侧封面 */}
                    {post.cover_image && (
                      <div className="flex-shrink-0 w-28 h-24">
                        <img
                          src={post.cover_image}
                          alt=""
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-4 flex items-center gap-6 pointer-events-none">
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
        ) : tab === 'exchange' ? (
          <div className="space-y-6">
            {exchangeFlowers.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm py-12">暂无换花帖子</p>
            ) : (
              exchangeFlowers.map((ef) => (
                <button
                  key={ef.exchange_id}
                  type="button"
                  onClick={() => setExchangeDetail({ id: ef.exchange_id })}
                  className="w-full text-left bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all hover:translate-y-[-2px] editorial-shadow border border-outline-variant/5"
                >
                  <div className="flex p-5 gap-4">
                    {/* 左侧内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 作者信息和状态 */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white">
                            <LocalFlorist className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-xs font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigate && ef.user_id) {
                                  onNavigate({ screen: 'userPage', query: '', userId: ef.user_id });
                                }
                              }}
                            >
                              {ef.username || '匿名用户'}
                            </p>
                            {ef.created_at && (
                              <p className="text-[10px] text-on-surface-variant">
                                {new Date(ef.created_at).toLocaleString('zh-CN')}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* 换花状态 */}
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap',
                            ef.exchange_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : ef.exchange_status === 'confirmed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          )}
                        >
                          {ef.exchange_status === 'pending'
                            ? '待交换'
                            : ef.exchange_status === 'confirmed'
                            ? '已确认'
                            : '已完成'}
                        </span>
                      </div>
                      {/* 标题和标签 */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {ef.title && (
                          <h4 className="text-base font-bold text-on-surface font-headline line-clamp-1">
                            {ef.title}
                          </h4>
                        )}
                        {ef.tags && (
                          <div className="flex flex-wrap gap-1.5">
                            {JSON.parse(ef.tags).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-[10px] font-medium whitespace-nowrap"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* 内容 - 两行 */}
                      <p className="text-on-surface text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap mb-3">
                        {ef.content}
                      </p>
                    </div>
                    {/* 右侧封面 */}
                    {ef.cover_image && (
                      <div className="flex-shrink-0 w-28 h-24">
                        <img
                          src={ef.cover_image}
                          alt=""
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-4 flex items-center gap-6 pointer-events-none">
                    <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                      <Favorite className="w-4 h-4" /> {ef.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                      <ChatBubble className="w-4 h-4" /> {ef.comment_count || 0}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : tab === 'questions' ? (
          <div className="space-y-6">
            {questions.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm py-12">暂无问题</p>
            ) : (
              questions.map((q) => (
                <button
                  key={q.question_id}
                  type="button"
                  onClick={() => setDetail({ type: 'question', id: q.question_id })}
                  className="w-full text-left bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all hover:translate-y-[-2px] editorial-shadow border border-outline-variant/5"
                >
                  <div className="flex p-6 gap-4">
                    {/* 左侧内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 作者信息 */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-xs font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate && q.user_id) {
                                onNavigate({ screen: 'userPage', query: '', userId: q.user_id });
                              }
                            }}
                          >
                            {q.username || '匿名用户'}
                          </p>
                          {q.created_at && (
                            <p className="text-[10px] text-on-surface-variant">
                              {new Date(q.created_at).toLocaleString('zh-CN')}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* 标题和标签 */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-on-surface font-headline line-clamp-1">{q.title}</h4>
                        {q.tags && (
                          <div className="flex flex-wrap gap-1.5">
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
                      {/* 内容 - 两行 */}
                      <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed whitespace-pre-wrap">
                        {q.content}
                      </p>
                    </div>
                    {/* 右侧封面 */}
                    {q.cover_image && (
                      <div className="flex-shrink-0 w-28 h-24">
                        <img
                          src={q.cover_image}
                          alt=""
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-6 flex items-center gap-6 pointer-events-none">
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
        ) : null}
      </div>

      {/* 发布弹窗 */}
      {showPublishModal && (
        <PublishModal
          type={tab}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
        />
      )}

      {/* 画笔按钮 - 发布内容 */}
      {tab !== 'learn' && (
      <button
        type="button"
        onClick={() => {
          if (!isLoggedIn) {
            toast.error('请先登录后再发布内容');
            return;
          }
          setShowPublishModal(true);
        }}
        className="fixed bottom-24 right-4 md:right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-xl z-50 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 editorial-shadow"
        aria-label="create post"
      >
        <Plus className="w-7 h-7" />
      </button>
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
  onPublish: (content: string, title?: string, images?: File[], tags?: string[]) => void;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
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
      images.length > 0 ? images : undefined,
      tags.length > 0 ? tags : undefined
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      // 最多10张图片
      const limitedFiles = newFiles.slice(0, 10);
      setImages([...images, ...limitedFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[85vh] overflow-y-auto pb-20">
        <div className="sticky top-0 bg-white border-b border-outline-variant/10 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-on-surface">
            {type === 'posts' ? '发布动态' : type === 'exchange' ? '发布换花' : '提问题'}
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
              标题 {(type === 'questions') && <span className="text-error">*</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'posts' ? '输入文章标题（可选）...' : type === 'exchange' ? '输入换花标题（可选）...' : '请输入问题标题...'}
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
              placeholder={type === 'posts' ? '分享你的想法...' : type === 'exchange' ? '描述你想交换的花朵...' : '详细描述你的问题...'}
              className="w-full px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none custom-textarea-scroll"
              rows={3}
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
              图片 (可选，最多10张)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`预览 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
