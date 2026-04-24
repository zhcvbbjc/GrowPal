import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowBack as ArrowLeft,
  User as UserIcon,
  Loader2,
  XCircle,
} from './Icons';
import { cn } from '../lib/utils';
import { searchChatUsers } from '../services/growpalApi';
import { type NavigateFunction } from '../types';

interface UserSearchScreenProps {
  onNavigate: NavigateFunction;
}

export const UserSearchScreen: React.FC<UserSearchScreenProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { user_id: number; username: string; avatar: string | null; phone: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    setLoading(true);

    searchTimer.current = setTimeout(async () => {
      try {
        const users = await searchChatUsers(trimmedQuery);
        setSearchResults(users);
      } catch (error) {
        console.error('搜索用户失败:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gradient-to-br from-surface via-surface-container/30 to-surface-container/60 pb-8 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-lg border-b border-outline-variant/10 px-4 py-4 mb-4">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => onNavigate('messages')}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-xl font-bold text-on-surface">搜索用户</h1>
        </div>
      </div>

      <div className="w-full">
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={cn('w-5 h-5 transition-colors', query ? 'text-primary' : 'text-on-surface-variant/40')} />
          </div>
          <input
            className="w-full bg-white border-2 border-outline-variant/20 rounded-2xl py-4 pl-14 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40 text-on-surface font-medium shadow-lg"
            placeholder="输入用户名搜索..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <XCircle className="w-5 h-5 text-on-surface-variant/60" />
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-on-surface-variant mt-4">正在搜索用户...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-on-surface-variant mb-4">
                  找到 {searchResults.length} 个用户
                </p>
                {searchResults.map((user) => (
                  <div
                    key={`user-${user.user_id}`}
                    onClick={() => onNavigate({ screen: 'userPage', query: '', userId: user.user_id })}
                    className="group flex items-center gap-4 p-4 bg-gradient-to-br from-white to-surface-container-low rounded-2xl border border-outline-variant/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface text-base">{user.username}</span>
                      </div>
                      {user.phone && (
                        <p className="text-xs text-on-surface-variant mt-1">{user.phone}</p>
                      )}
                    </div>
                    <div className="text-sm text-primary font-semibold">
                      查看主页
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/20">
                <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-on-surface-variant/40" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">未找到用户</h3>
                <p className="text-sm text-on-surface-variant">试试其他关键词</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-on-surface-variant/40" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">搜索用户</h3>
            <p className="text-sm text-on-surface-variant">输入用户名查找其他用户</p>
          </div>
        )}
      </div>
    </div>
  );
};
