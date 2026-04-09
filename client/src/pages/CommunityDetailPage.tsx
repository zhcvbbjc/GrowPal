import React, { useEffect, useState } from 'react';
import { ArrowBack, Favorite, ChatBubble, Loader2 } from './Icons';
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
} from '../services/growpalApi';

type Props = {
  type: 'post' | 'question';
  id: number;
  onBack: () => void;
};

export function CommunityDetailPage({ type, id, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasToken = !!localStorage.getItem('token');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (type === 'post') {
          const p = await fetchPost(id);
          if (cancelled) return;
          setContent(p.content);
          setImagePath(p.image_path);
          setAuthor(p.username || '用户');
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
          setAuthor(q.username || '用户');
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

  const handleLike = async () => {
    if (!hasToken) {
      alert('请先登录后再点赞');
      return;
    }
    try {
      if (type === 'post') {
        await togglePostLike(id);
        setLikeCount(await getPostLikeCount(id));
      } else {
        await toggleQuestionLike(id);
        setLikeCount(await getQuestionLikeCount(id));
      }
    } catch (e) {
      alert(getApiMessage(e));
    }
  };

  const handleComment = async () => {
    if (!hasToken) {
      alert('请先登录后再评论');
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
    } catch (e) {
      alert(getApiMessage(e));
    } finally {
      setSubmitting(false);
    }
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
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-primary font-bold text-sm"
      >
        <ArrowBack className="w-5 h-5" /> 返回社区
      </button>

      <article className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
        <div className="p-5">
          <p className="text-xs text-on-surface-variant mb-2">{author}</p>
          {type === 'question' && (
            <h2 className="text-xl font-bold font-headline text-on-surface mb-3">{title}</h2>
          )}
          <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
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
        <div className="p-4 flex items-center gap-6 border-t border-surface-container">
          <button
            type="button"
            onClick={handleLike}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <Favorite className="w-5 h-5" />
            <span className="text-xs font-bold">{likeCount}</span>
          </button>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <ChatBubble className="w-5 h-5" />
            <span className="text-xs font-bold">{comments.length}</span>
          </div>
        </div>
      </article>

      <section>
        <h3 className="text-sm font-bold font-label uppercase tracking-widest text-primary mb-4">
          评论
        </h3>
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-sm text-on-surface-variant">暂无评论</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10"
              >
                <p className="text-xs font-bold text-on-surface mb-1">{c.username || '用户'}</p>
                <p className="text-sm text-on-surface leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 min-h-[88px] focus:ring-2 focus:ring-primary/20"
            placeholder={hasToken ? '写下你的看法…' : '登录后即可评论'}
            disabled={!hasToken}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="button"
            onClick={handleComment}
            disabled={!hasToken || submitting || !commentText.trim()}
            className="self-end bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold disabled:opacity-40"
          >
            {submitting ? '发送中…' : '发布评论'}
          </button>
        </div>
      </section>
    </div>
  );
}
