import React, { useEffect, useState } from 'react';
import { ArrowBack, Favorite, ChatBubble, Loader2, Trash2, User, Calendar, AutoAwesome } from './Icons';
import {
  fetchPost,
  fetchQuestion,
  fetchPostComments,
  fetchQuestionComments,
  getPostLikeCount,
  getQuestionLikeCount,
  togglePostLike,
  toggleQuestionLike,
  createPostComment,
  createQuestionComment,
  getApiMessage,
  type CommentRow,
  type PostRow,
  type QuestionRow,
} from '../services/growpalApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/Modal';
import { cn } from '../lib/utils';

type Props = {
  type: 'post' | 'question';
  id: number;
  onBack: () => void;
  onNavigate?: (screen: any) => void;
};

export function PostDetailPage({ type, id, onBack, onNavigate }: Props) {
  const { isLoggedIn, user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // 加载详情数据
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (type === 'post') {
          const p = await fetchPost(id);
          if (cancelled) return;
          setTitle(p.title || '');
          setContent(p.content);
          setImagePath(p.image_path);
          setAuthor(p.username || '匿名用户');
          setAuthorId(p.user_id);
          setCreatedAt(p.created_at || '');
          setAiSummary(p.ai_summary || null);
          if (p.tags) {
            try {
              setTags(JSON.parse(p.tags));
            } catch {
              setTags([]);
            }
          }
          const [cs, lc] = await Promise.all([
            fetchPostComments(id),
            getPostLikeCount(id),
          ]);
          if (cancelled) return;
          setComments(cs);
          setLikeCount(lc);
        } else {
          const q = await fetchQuestion(id);
          if (cancelled) return;
          setTitle(q.title);
          setContent(q.content);
          setImagePath(q.image_path);
          setAuthor(q.username || '匿名用户');
          setAuthorId(q.user_id);
          setCreatedAt(q.created_at || '');
          setAiAnswer(q.ai_answer || null);
          if (q.tags) {
            try {
              setTags(JSON.parse(q.tags));
            } catch {
              setTags([]);
            }
          }
          const [cs, lc] = await Promise.all([
            fetchQuestionComments(id),
            getQuestionLikeCount(id),
          ]);
          if (cancelled) return;
          setComments(cs);
          setLikeCount(lc);
        }
      } catch (e) {
        if (!cancelled) setErr(getApiMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  // 处理点赞
  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再点赞');
      return;
    }
    try {
      if (type === 'post') {
        const result = await togglePostLike(id);
        setIsLiked(result.liked);
        setLikeCount(await getPostLikeCount(id));
      } else {
        const result = await toggleQuestionLike(id);
        setIsLiked(result.liked);
        setLikeCount(await getQuestionLikeCount(id));
      }
      toast.success(isLiked ? '已取消点赞' : '点赞成功');
    } catch (e) {
      toast.error(getApiMessage(e));
    }
  };

  // 处理评论
  const handleComment = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再评论');
      return;
    }
    const t = commentText.trim();
    if (!t) return;
    setSubmitting(true);
    try {
      if (type === 'post') {
        await createPostComment(id, t);
        setComments(await fetchPostComments(id));
      } else {
        await createQuestionComment(id, t);
        setComments(await fetchQuestionComments(id));
      }
      setCommentText('');
      toast.success('评论成功');
    } catch (e) {
      toast.error(getApiMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleteDialog(false);
    try {
      // TODO: 实现删除API
      toast.info('删除功能开发中...');
    } catch (e) {
      toast.error(getApiMessage(e));
    }
  };

  const isAuthor = isLoggedIn && user?.id === authorId;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant">加载中…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-primary font-bold text-sm"
        >
          <ArrowBack className="w-5 h-5" /> 返回
        </button>
        <p className="text-error text-sm">{err}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-24">
      {/* 返回按钮 */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
      >
        <ArrowBack className="w-5 h-5" /> 返回社区
      </button>

      {/* 文章主体 */}
      <article className="bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden border border-outline-variant/10">
        {/* 作者信息 */}
        <div className="p-5 border-b border-outline-variant/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthor) {
                        onNavigate?.('profile');
                      } else if (authorId) {
                        onNavigate?.({ screen: 'userPage', query: '', userId: authorId });
                      }
                    }}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {author}
                  </button>
                  {isAuthor && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      作者
                    </span>
                  )}
                </p>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>
            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors"
                title="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 标题和内容 */}
          {title && (
            <div className="mb-3">
              <div className="flex items-start gap-2 flex-wrap">
                <h2 className="text-xl font-bold font-headline text-on-surface flex-1 min-w-0">
                  {type === 'question' && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2 inline-block mr-2"></span>
                  )}
                  {title}
                </h2>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                          type === 'question'
                            ? "bg-purple-100 text-purple-700"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* 图片 */}
        {imagePath && (
          <div className="relative w-full aspect-video bg-surface-variant">
            <img
              src={imagePath}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* 操作栏 */}
        <div className="p-4 flex items-center gap-6 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
              isLiked
                ? 'bg-primary-container text-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/50'
            )}
          >
            <Favorite className={cn('w-5 h-5', isLiked && 'fill-current')} />
            <span className="text-sm font-bold">{likeCount}</span>
            <span className="text-xs">{isLiked ? '已赞' : '点赞'}</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant">
            <ChatBubble className="w-5 h-5" />
            <span className="text-sm font-bold">{comments.length}</span>
            <span className="text-xs">评论</span>
          </div>
        </div>
      </article>

      {/* AI 总结/解答区域 */}
      {(type === 'post' && aiSummary) || (type === 'question' && aiAnswer) ? (
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AutoAwesome className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-on-surface font-headline">
                {type === 'post' ? 'AI 智能总结' : 'AI 智能解答'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                AI 生成
              </span>
            </div>
            <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-lowest/50 rounded-xl p-4 border border-primary/10">
              {type === 'post' ? aiSummary : aiAnswer}
            </div>
          </div>
        </section>
      ) : (type === 'question' && !aiAnswer) ? (
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <AutoAwesome className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">AI 解答生成中...</h3>
          </div>
          <p className="text-xs text-on-surface-variant">
            AI 正在思考并生成专业解答，请稍后刷新页面查看
          </p>
        </section>
      ) : null}

      {/* 评论区 */}
      <section>
        <h3 className="text-sm font-bold font-label uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
          <ChatBubble className="w-4 h-4" />
          评论 ({comments.length})
        </h3>
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <ChatBubble className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-3" />
              <p className="text-sm text-on-surface-variant">暂无评论，快来抢沙发吧</p>
            </div>
          ) : (
            comments.map((c, index) => (
              <div
                key={c.id}
                className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-container flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                        {c.username || '匿名用户'}
                        {index === 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-semibold">
                            沙发
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-on-surface-variant">
                        {formatDate(c.created_at || '')}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 评论输入框 */}
        <div className="sticky bottom-20 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-lg">
          <textarea
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 min-h-[88px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            placeholder={isLoggedIn ? '写下你的看法…' : '登录后即可评论'}
            disabled={!isLoggedIn}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-on-surface-variant">
              {commentText.length}/500
            </p>
            <button
              type="button"
              onClick={handleComment}
              disabled={!isLoggedIn || submitting || !commentText.trim()}
              className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  发送中…
                </>
              ) : (
                <>
                  <ChatBubble className="w-4 h-4" />
                  发布评论
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialog}
        title="确认删除"
        message="确定要删除这条"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(false)}
        confirmText="删除"
        confirmVariant="danger"
      />
    </div>
  );
}
