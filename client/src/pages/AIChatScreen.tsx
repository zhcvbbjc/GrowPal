import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, AddCircle, Psychology, AutoAwesome, ArrowBack, Loader2, Trash2, X } from './Icons';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import {
  createAiSession,
  listAiSessions,
  getAiMessages,
  sendAiMessage,
  deleteAiSession,
  getApiMessage,
} from '../services/growpalApi';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/Modal';
import { cn } from '../lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

function formatTime(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function mapRowsToMessages(
  rows: { role: string; content: string; created_at: string }[]
): ChatMessage[] {
  return rows.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    text: m.content,
    timestamp: formatTime(m.created_at),
  }));
}

export const AIChatScreen = () => {
  const toast = useToast();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<{ id: number; title: string; updated_at: string }[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadSessionMessages = useCallback(async (sid: number) => {
    const pack = await getAiMessages(sid, 300);
    setMessages(mapRowsToMessages(pack.messages));
  }, []);

  const refreshSessions = useCallback(async () => {
    const list = await listAiSessions();
    setSessions(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setBootLoading(true);
      try {
        const list = await listAiSessions();
        if (cancelled) return;
        setSessions(list);
        if (list.length > 0) {
          const sid = list[0].id;
          setSessionId(sid);
          await loadSessionMessages(sid);
        } else {
          const created = await createAiSession();
          if (cancelled) return;
          setSessionId(created.sessionId);
          setMessages([]);
          const again = await listAiSessions();
          if (!cancelled) setSessions(again);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = getApiMessage(e);
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleNewChat = async () => {
    setError(null);
    try {
      const { sessionId: sid } = await createAiSession('新对话');
      setSessionId(sid);
      setMessages([]);
      setShowSessions(false);
      await refreshSessions();
      toast.success('已创建新对话');
    } catch (e) {
      const msg = getApiMessage(e);
      toast.error(msg);
    }
  };

  const handlePickSession = async (sid: number) => {
    setError(null);
    setSessionId(sid);
    setShowSessions(false);
    try {
      await loadSessionMessages(sid);
    } catch (e) {
      const msg = getApiMessage(e);
      toast.error(msg);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;
    try {
      await deleteAiSession(deleteSessionId);
      toast.success('已删除会话');
      await refreshSessions();
      if (sessionId === deleteSessionId) {
        const list = await listAiSessions();
        if (list.length > 0) {
          setSessionId(list[0].id);
          await loadSessionMessages(list[0].id);
        } else {
          const created = await createAiSession('新对话');
          setSessionId(created.sessionId);
          setMessages([]);
          await refreshSessions();
        }
      }
    } catch (e) {
      toast.error(getApiMessage(e));
    } finally {
      setDeleteSessionId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || sessionId == null) return;

    const text = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    const optimistic: ChatMessage = {
      role: 'user',
      text,
      timestamp: formatTime(new Date().toISOString()),
    };
    setMessages((prev) => [...prev, optimistic]);

    // 添加加载中的AI消息占位符
    const loadingMsg: ChatMessage = {
      role: 'model',
      text: '...',
      timestamp: formatTime(new Date().toISOString()),
    };
    setMessages((prev) => [...prev, loadingMsg]);

    try {
      const res = await sendAiMessage(sessionId, text);
      const aiMsg: ChatMessage = {
        role: 'model',
        text: res.reply,
        timestamp: formatTime(new Date().toISOString()),
      };
      // 替换加载中的消息为实际回复
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = aiMsg;
        return newMsgs;
      });
      await refreshSessions();
    } catch (e: any) {
      const msg = e.response?.data?.message || getApiMessage(e);
      setError(msg);
      toast.error(msg);
      // 移除加载中的占位符和用户消息
      setMessages((prev) => prev.filter((m) => m !== optimistic && m !== loadingMsg));
    } finally {
      setIsLoading(false);
    }
  };

  if (bootLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 w-12 h-12 animate-ping rounded-full bg-primary/20"></div>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-on-surface mb-1">正在连接智能助手...</p>
          <p className="text-sm text-on-surface-variant">首次加载可能需要几秒钟</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      {error && (
        <div className="mb-4 mx-4 p-4 rounded-xl bg-error-container/30 text-error text-sm font-medium border border-error/20 flex items-start gap-3">
          <div className="flex-1">
            <p className="font-bold mb-1">请求失败</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-error-container/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          type="button"
          onClick={() => setShowSessions((s) => !s)}
          className="text-sm font-bold text-primary flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          {showSessions ? <ArrowBack className="w-4 h-4" /> : <Psychology className="w-4 h-4" />}
          {showSessions ? '返回对话' : '历史会话'}
        </button>
        <button
          type="button"
          onClick={handleNewChat}
          className="text-sm font-bold text-on-primary px-4 py-2 rounded-full signature-gradient shadow-sm active:scale-95 transition-transform"
        >
          新对话
        </button>
      </div>

      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 space-y-2 max-h-64 overflow-y-auto no-scrollbar border border-outline-variant/10 rounded-xl p-3 bg-surface-container-lowest/80"
          >
            {sessions.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-4">暂无会话</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group',
                    sessionId === s.id
                      ? 'bg-primary-container/40 text-primary'
                      : 'hover:bg-surface-container-low text-on-surface'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handlePickSession(s.id)}
                    className="flex-1 min-w-0"
                  >
                    <span className="line-clamp-1 block">{s.title || '对话'}</span>
                    <span className="block text-[10px] text-on-surface-variant mt-1">
                      {formatTime(s.updated_at)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteSessionId(s.id);
                    }}
                    className="ml-2 p-1.5 rounded-lg hover:bg-red-100 text-on-surface-variant hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-2 md:px-8 py-6 space-y-8 pb-32 no-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="editorial-asymmetry bg-surface-container-low p-6 md:p-8 flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Psychology className="w-16 h-16" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-headline text-primary mb-2">农事智能顾问</h2>
                <p className="text-on-surface-variant font-medium text-sm md:text-base leading-relaxed">
                  我可以帮你解答作物种植、病虫害防治、土壤分析等问题。
                  <br />
                  试试问我：
                </p>
                <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>如何预防小麦锈病？</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>水稻最佳灌溉频率是什么？</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>番茄叶子发黄怎么办？</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={`${msg.timestamp}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex gap-3'}
                >
                  {msg.role === 'model' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center shadow-sm">
                        <Psychology className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] md:max-w-2xl',
                      msg.role === 'user' ? 'order-1' : ''
                    )}
                  >
                    {msg.role === 'model' ? (
                      <div className="glass-ai border border-outline-variant/20 p-4 md:p-5 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-tertiary-container/10 text-tertiary text-[10px] md:text-[11px] font-bold uppercase mb-2">
                          <AutoAwesome className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          AI 助手
                        </div>
                        <div className="prose prose-sm text-on-surface max-w-none text-sm md:text-base">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <span className="text-[10px] font-semibold text-on-surface-variant opacity-60">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-container-highest text-on-surface p-4 md:p-5 rounded-2xl rounded-tr-none shadow-sm">
                        <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                        <div className="mt-2 flex justify-end">
                          <span className="text-[10px] font-semibold text-on-surface-variant opacity-60">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center shadow-sm animate-pulse">
                      <Psychology className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                  <div className="glass-ai border border-outline-variant/20 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-on-surface-variant text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在思考...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[72px] md:bottom-[88px] left-0 w-full px-2 md:px-8 z-40">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-outline-variant/20 p-2 flex items-center gap-2">
          <input
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm md:text-base px-3 placeholder:text-on-surface-variant/50"
            placeholder="询问作物、土壤、天气等问题..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || sessionId == null || !input.trim()}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteSessionId !== null}
        title="删除会话"
        message="确定要删除此会话吗？此操作不可撤销。"
        onConfirm={handleDeleteSession}
        onCancel={() => setDeleteSessionId(null)}
        confirmText="删除"
        confirmVariant="danger"
      />
    </div>
  );
};
