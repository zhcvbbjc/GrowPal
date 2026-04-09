import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Psychology, Star, EditSquare, ArrowBack, Send, Loader2 } from './Icons';
import { cn } from '../lib/utils';
import {
  listUserConversations,
  searchChatUsers,
  openUserConversation,
  getUserMessages,
  sendUserMessage,
  getApiMessage,
  type ConversationRow,
  type UserMessageRow,
} from '../services/growpalApi';

function formatConvTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (now.getTime() - d.getTime() < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

function getMeId(): number | null {
  try {
    const raw = localStorage.getItem('growpal_user');
    if (!raw) return null;
    const u = JSON.parse(raw) as { id?: number };
    return u.id ?? null;
  } catch {
    return null;
  }
}

export const MessagesScreen = () => {
  const [view, setView] = useState<'inbox' | 'thread'>('inbox');
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [activeConv, setActiveConv] = useState<ConversationRow | null>(null);
  const [threadMessages, setThreadMessages] = useState<UserMessageRow[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sendInput, setSendInput] = useState('');
  const [sending, setSending] = useState(false);

  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<
    { user_id: number; username: string; avatar: string | null }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meId = getMeId();
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadInbox = useCallback(async () => {
    setListError(null);
    setLoadingList(true);
    try {
      const rows = await listUserConversations();
      setConversations(rows);
    } catch (e) {
      setListError(getApiMessage(e));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (view === 'thread' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadMessages, view]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = searchQ.trim();
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchChatUsers(q);
        setSearchResults(rows);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQ]);

  const openThread = async (c: ConversationRow) => {
    setActiveConv(c);
    setView('thread');
    setThreadLoading(true);
    try {
      const pack = await getUserMessages(c.id, { limit: 80 });
      setThreadMessages(pack.messages);
    } catch (e) {
      setListError(getApiMessage(e));
    } finally {
      setThreadLoading(false);
    }
  };

  const startChatWithPeer = async (peerId: number) => {
    try {
      const peerName = searchResults.find((s) => s.user_id === peerId)?.username || '用户';
      const peerAv = searchResults.find((s) => s.user_id === peerId)?.avatar || null;
      const { conversationId } = await openUserConversation(peerId);
      setSearchQ('');
      setSearchResults([]);
      const rows = await listUserConversations();
      setConversations(rows);
      const row =
        rows.find((x) => x.id === conversationId) ||
        ({
          id: conversationId,
          peer_id: peerId,
          peer_username: peerName,
          peer_avatar: peerAv,
          last_message: null,
          unread_count: 0,
          updated_at: new Date().toISOString(),
        } as ConversationRow);
      await openThread(row);
    } catch (e) {
      alert(getApiMessage(e));
    }
  };

  const handleSendDm = async () => {
    if (!activeConv || !sendInput.trim() || sending) return;
    const text = sendInput.trim();
    setSendInput('');
    setSending(true);
    try {
      await sendUserMessage(activeConv.id, text);
      const pack = await getUserMessages(activeConv.id, { limit: 80 });
      setThreadMessages(pack.messages);
      await loadInbox();
    } catch (e) {
      alert(getApiMessage(e));
    } finally {
      setSending(false);
    }
  };

  if (view === 'thread' && activeConv) {
    return (
      <div className="animate-in fade-in duration-500 flex flex-col min-h-[70vh] pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setView('inbox');
              setActiveConv(null);
              loadInbox();
            }}
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="back"
          >
            <ArrowBack className="w-6 h-6 text-primary" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-surface-container shrink-0">
              {activeConv.peer_avatar ? (
                <img
                  src={activeConv.peer_avatar}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <img
                  src={`https://picsum.photos/seed/u${activeConv.peer_id}/100/100`}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold font-headline truncate">{activeConv.peer_username}</h2>
              <p className="text-xs text-on-surface-variant">用户 #{activeConv.peer_id}</p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] max-h-[55vh] no-scrollbar"
        >
          {threadLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            threadMessages.map((m) => {
              const mine = meId != null && m.sender_id === meId;
              return (
                <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm',
                      mine
                        ? 'bg-primary text-on-primary rounded-tr-none'
                        : 'bg-surface-container-lowest border border-outline-variant/10 rounded-tl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-2 opacity-70',
                        mine ? 'text-on-primary/80' : 'text-on-surface-variant'
                      )}
                    >
                      {formatConvTime(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="fixed bottom-[88px] left-0 w-full px-4 z-40">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-outline-variant/30 p-2 flex items-center gap-2">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-on-surface-variant/50"
              placeholder="发送消息…"
              value={sendInput}
              onChange={(e) => setSendInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendDm()}
            />
            <button
              type="button"
              onClick={handleSendDm}
              disabled={sending}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <section className="mb-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-primary font-bold tracking-widest text-[11px] uppercase font-label">
              Inbox
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface">
              消息
            </h2>
          </div>
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-outline w-5 h-5" />
            </div>
            <input
              className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all font-body"
              placeholder="搜索用户以发起聊天…"
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>
        </div>
        <div className="hidden lg:block absolute -right-24 top-0 w-48 h-48 bg-primary/5 rounded-[40px] rotate-12 -z-10" />
      </section>

      {searchQ.trim().length > 0 && (
        <section className="mb-8 bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4">
          <p className="text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">
            搜索结果
          </p>
          {searching ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-4">未找到用户</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => startChatWithPeer(u.user_id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                >
                  <img
                    src={u.avatar || `https://picsum.photos/seed/u${u.user_id}/80/80`}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-bold text-on-surface">{u.username}</span>
                  <span className="text-xs text-on-surface-variant ml-auto">发消息</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {listError && (
        <div className="mb-4 p-4 rounded-xl bg-error-container/30 text-error text-sm">{listError}</div>
      )}

      <div className="bg-secondary-container/30 backdrop-blur-xl p-6 rounded-xl border-none editorial-shadow flex gap-4 items-start mb-8">
        <div className="bg-primary p-2 rounded-full text-white">
          <Psychology className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold font-headline text-on-secondary-container">提示</h3>
          <p className="text-sm text-on-secondary-container/80 mt-1">
            此处为与其他 GrowPal 用户的站内私信，与底部「AI Chat」的大模型对话相互独立。
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {loadingList ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12 text-sm">暂无会话，试试上方搜索用户</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openThread(c)}
              className="w-full text-left group cursor-pointer bg-surface-container-lowest p-5 rounded-xl editorial-shadow transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-5 border border-primary/5"
            >
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-surface-variant">
                  {c.peer_avatar ? (
                    <img
                      src={c.peer_avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img
                      src={`https://picsum.photos/seed/p${c.peer_id}/200/200`}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                {c.unread_count > 0 && (
                  <div className="absolute -bottom-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-tertiary-fixed border-4 border-surface-container-lowest rounded-full text-[10px] font-black text-primary">
                    {c.unread_count > 9 ? '9+' : c.unread_count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-lg font-bold font-headline text-on-surface truncate">
                    {c.peer_username}
                  </h4>
                  <span className="text-xs font-bold text-primary font-label whitespace-nowrap ml-2">
                    {formatConvTime(c.updated_at)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant truncate">
                  {c.last_message || '暂无消息'}
                </p>
              </div>
              <Star className="text-outline-variant w-5 h-5 shrink-0 opacity-40" />
            </button>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const el = document.querySelector<HTMLInputElement>('input[placeholder="搜索用户以发起聊天…"]');
          el?.focus();
        }}
        className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-xl z-50 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 editorial-shadow"
        aria-label="new message"
      >
        <EditSquare className="w-6 h-6" />
      </button>
    </div>
  );
};
