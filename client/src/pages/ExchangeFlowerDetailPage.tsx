import React, { useEffect, useState } from 'react';
import { ArrowBack, Favorite, ChatBubble, Loader2, Trash2, User, Calendar, LocalFlorist } from './Icons';
import {
  fetchExchangeFlower,
  fetchExchangeFlowerComments,
  getExchangeFlowerLikeCount,
  toggleExchangeFlowerLike,
  createExchangeFlowerComment,
  deleteExchangeFlower,
  getApiMessage,
  type CommentRow,
  type ExchangeFlowerRow,
} from '../services/growpalApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/Modal';
import { cn } from '../lib/utils';

type Props = {
  id: number;
  onBack: () => void;
  onNavigate?: (screen: any) => void;
  onDeleted?: () => void;
};

export function ExchangeFlowerDetailPage({ id, onBack, onNavigate, onDeleted }: Props) {
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
  const [exchangeStatus, setExchangeStatus] = useState<string>('pending');

  // 加载详情数据
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const ef = await fetchExchangeFlower(id);
        if (cancelled) return;
        setTitle(ef.title || '');
        setContent(ef.content);
        setImagePath(ef.image_path);
        setAuthor(ef.username || '匿名用户');
        setAuthorId(ef.user_id);
        setCreatedAt(ef.created_at || '');
        setExchangeStatus(ef.exchange_status || 'pending');
        if (ef.tags) {
          try {
            setTags(JSON.parse(ef.tags));
          } catch {
            setTags([]);
          }
        }
        const [cs, lc] = await Promise.all([
          fetchExchangeFlowerComments(id),
          getExchangeFlowerLikeCount(id),
        ]);
        if (cancelled) return;
        setComments(cs);
        setLikeCount(lc);
      } catch (e: any) {
        if (!cancelled) setErr(getApiMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // 点赞
  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再点赞');
      return;
    }
    try {
      const result = await toggleExchangeFlowerLike(id);
      setIsLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (e: any) {
      toast.error(getApiMessage(e));
    }
  };

  // 提交评论
  const handleCommentSubmit = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再评论');
      return;
    }
    if (!commentText.trim()) {
      toast.error('请输入评论内容');
      return;
    }
    setSubmitting(true);
    try {
      await createExchangeFlowerComment(id, commentText);
      setCommentText('');
      const cs = await fetchExchangeFlowerComments(id);
      setComments(cs);
      toast.success('评论成功');
    } catch (e: any) {
      toast.error(getApiMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // 感兴趣 - 私信作者
  const handleInterested = () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再操作');
      return;
    }
    if (authorId) {
      onNavigate?.({ screen: 'chat', query: '', userId: authorId });
    }
  };

  // 删除帖子
  const handleDelete = async () => {
    setDeleteDialog(false);
    try {
      await deleteExchangeFlower(id);
      toast.success('删除成功');
      onDeleted?.();
      onBack();
    } catch (e: any) {
      toast.error(getApiMessage(e));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4 rounded-xl bg-error-container/30 text-error text-sm">{err}</div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline-variant/10 -mx-4 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowBack className="w-5 h-5 text-on-surface" />
        </button>
        <h2 className="text-lg font-bold text-on-surface flex-1 truncate">换花详情</h2>
        {/* 作者可见删除按钮 */}
        {isLoggedIn && user?.id === authorId && (
          <button
            type="button"
            onClick={() => setDeleteDialog(true)}
            className="p-2 hover:bg-error-container/20 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5 text-error" />
          </button>
        )}
      </div>

      <div className="space-y-6 mt-4">
        {/* 换花帖子内容 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden editorial-shadow border border-outline-variant/5">
          <div className="p-6">
            {/* 作者信息 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white">
                <LocalFlorist className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => {
                    if (onNavigate && authorId) {
                      onNavigate({ screen: 'userPage', query: '', userId: authorId });
                    }
                  }}
                >
                  {author}
                </p>
                {createdAt && (
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(createdAt).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
              {/* 换花状态 */}
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap',
                  exchangeStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : exchangeStatus === 'confirmed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                )}
              >
                {exchangeStatus === 'pending'
                  ? '🌸 待交换'
                  : exchangeStatus === 'confirmed'
                  ? '✅ 已确认'
                  : '🎉 已完成'}
              </span>
            </div>

            {/* 标题 */}
            {title && (
              <h1 className="text-xl font-bold text-on-surface font-headline mb-3">{title}</h1>
            )}

            {/* 标签 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium whitespace-nowrap"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 内容 */}
            <div className="text-on-surface text-base leading-relaxed whitespace-pre-wrap mb-4">
              {content}
            </div>

            {/* 图片 */}
            {imagePath && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {imagePath.split(',').map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                    <img
                      src={img.trim()}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 点赞和评论统计 */}
            <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-2 text-sm font-bold transition-colors',
                  isLiked
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                )}
              >
                <Favorite className={cn('w-5 h-5', isLiked && 'fill-current')} />
                {likeCount}
              </button>
              <span className="flex items-center gap-2 text-on-surface-variant text-sm font-bold">
                <ChatBubble className="w-5 h-5" />
                {comments.length}
              </span>
            </div>

            {/* 感兴趣按钮 */}
            <button
              type="button"
              onClick={handleInterested}
              disabled={!isLoggedIn || authorId === user?.id}
              className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authorId === user?.id ? '这是你的帖子' : '🌸 感兴趣 - 私信作者'}
            </button>
          </div>
        </div>

        {/* 评论区 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 editorial-shadow border border-outline-variant/5">
          <h3 className="text-lg font-bold text-on-surface mb-4">
            评论 ({comments.length})
          </h3>
          {comments.length === 0 ? (
            <p className="text-center text-on-surface-variant text-sm py-8">暂无评论</p>
          ) : (
            <div className="space-y-4 mb-4">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-3 p-3 rounded-lg bg-surface-container/50"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center">
                    <User className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-on-surface">
                        {c.username || '匿名用户'}
                      </p>
                      {c.created_at && (
                        <p className="text-[10px] text-on-surface-variant">
                          {new Date(c.created_at).toLocaleString('zh-CN')}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 评论输入框 */}
          {isLoggedIn && (
            <div className="flex gap-2 items-end">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 px-4 py-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none custom-textarea-scroll"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={submitting || !commentText.trim()}
                className="px-4 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '发送'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="确认删除"
        description="删除后无法恢复，确定要删除这个换花帖子吗？"
        confirmText="删除"
        cancelText="取消"
        danger
      />
    </div>
  );
}
