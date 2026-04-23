import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowBack as ArrowLeft,
  User as UserIcon,
  Article as FileText,
  MessageSquareQuote as MessageSquare,
  TrendingUp,
  Loader2,
  Clock,
  Sparkles,
  Filter,
  XCircle,
  ChevronDown,
} from './Icons';
import { cn } from '../lib/utils';
import {
  search,
  fetchPosts,
  fetchQuestions,
  type SearchResponse,
  type SearchUser,
  type SearchResult,
  type PostRow,
  type QuestionRow,
} from '../services/growpalApi';
import { type NavigateFunction } from '../types';

interface SearchScreenProps {
  onNavigate: NavigateFunction;
  initialQuery?: string;
}

type SearchMode = 'title' | 'content';

export const SearchScreen: React.FC<SearchScreenProps> = ({ onNavigate, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentPosts, setRecentPosts] = useState<PostRow[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<QuestionRow[]>([]);
  const [loadingFallback, setLoadingFallback] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('title');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);

  // 当搜索模式改变时，如果已经搜索过，自动重新搜索
  useEffect(() => {
    if (hasSearched && query.trim()) {
      handleSearchWithMode(query.trim(), searchMode);
    }
  }, [searchMode]);

  useEffect(() => {
    if (!hasSearched || (searchResults && !searchResults.hasResults)) {
      loadRecentContent();
    }
  }, [hasSearched, searchResults]);

  const loadRecentContent = async () => {
    setLoadingFallback(true);
    try {
      const [posts, questions] = await Promise.all([fetchPosts(), fetchQuestions()]);
      setRecentPosts(posts.slice(0, 5));
      setRecentQuestions(questions.slice(0, 5));
    } catch (error) {
      console.error('Failed to load recent content:', error);
    } finally {
      setLoadingFallback(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmedQuery);
      return [trimmedQuery, ...filtered].slice(0, 5);
    });

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await search(trimmedQuery);
      setSearchResults(results);
      console.log('搜索结果:', results);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWithMode = async (searchQuery: string, mode: SearchMode) => {
    setLoading(true);
    try {
      const results = await search(searchQuery);
      setSearchResults(results);
      console.log('搜索结果:', results);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getFilteredResults = () => {
    if (!searchResults) return null;

    console.log('[前端] 原始搜索结果:', searchResults);
    console.log('[前端] 当前搜索模式:', searchMode);

    const results = { ...searchResults };

    // 根据搜索模式过滤结果
    if (searchMode === 'title') {
      results.results.postsByContent = [];
      results.results.questionsByContent = [];
    } else if (searchMode === 'content') {
      results.results.postsByTitle = [];
      results.results.questionsByTitle = [];
    }

    console.log('[前端] 过滤后的结果:', results);
    return results;
  };

  const filteredResults = getFilteredResults();
  const hasAnyResults = filteredResults
    ? Object.values(filteredResults.results).flat().length > 0
    : false;
  const resultCount = filteredResults
    ? Object.values(filteredResults.results).flat().length
    : 0;

  const renderUserItem = (user: SearchUser) => (
    <div
      key={`user-${user.user_id}`}
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
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-on-surface text-base">{user.username}</span>
          {user.role === 'admin' && (
            <span className="text-[10px) bg-gradient-to-r from-primary to-primary-container text-white px-2 py-0.5 rounded-full font-semibold">
              管理员
            </span>
          )}
        </div>
        {user.bio && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{user.bio}</p>
        )}
      </div>
    </div>
  );

  const renderSearchResultItem = (item: SearchResult) => (
    <div
      key={`${item.type}-${item.id}`}
      onClick={() => onNavigate('community')}
      className="group bg-gradient-to-br from-white to-surface-container-low rounded-2xl p-5 border border-outline-variant/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className={cn(
            'font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm',
            item.type === 'post'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
          )}
        >
          {item.type === 'post' ? '动态' : '问答'}
        </span>
        {item.user && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
              {item.user.avatar ? (
                <img src={item.user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-3 h-3 text-on-surface-variant" />
              )}
            </div>
            <span className="text-xs font-semibold text-on-surface">{item.user.username}</span>
          </div>
        )}
        <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {formatDate(item.created_at)}
        </span>
      </div>
      {item.title && (
        <h4 className="text-base font-bold text-on-surface mb-2 line-clamp-1">{item.title}</h4>
      )}
      <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-3">{item.content}</p>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderSection = (title: string, { Icon, color }: { Icon: React.ElementType; color: string }, items: any[], renderItem: (item: any) => React.ReactNode) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('p-2 rounded-xl', color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            <span className="text-xs text-on-surface-variant/60">找到 {items.length} 个结果</span>
          </div>
        </div>
        <div className="space-y-3">{items.map(renderItem)}</div>
      </div>
    );
  };

  const showFallback = !hasSearched || (searchResults && !hasAnyResults);

  const modeOptions = [
    { value: 'title' as SearchMode, label: '标题', icon: 'T' },
    { value: 'content' as SearchMode, label: '内容', icon: 'C' },
  ];

  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gradient-to-br from-surface via-surface-container/30 to-surface-container/60 pb-8 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-lg border-b border-outline-variant/10 px-4 py-4 mb-4">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => onNavigate('searchRecommend')}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            搜索结果
          </h1>
        </div>
      </div>

      <div className="w-full">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={cn('w-5 h-5 transition-colors', query ? 'text-primary' : 'text-on-surface-variant/40')} />
          </div>
          <input
            className="w-full bg-white border-2 border-outline-variant/20 rounded-2xl py-4 pl-14 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40 text-on-surface font-medium shadow-lg"
            placeholder="搜索用户、动态、问答..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
        </form>

        {/* Filter and Result Count */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Search Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModeSelector(!showModeSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-outline-variant/30 rounded-full hover:border-primary/50 transition-all text-sm"
            >
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-on-surface font-medium">
                {modeOptions.find((m) => m.value === searchMode)?.label}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-on-surface-variant transition-transform', showModeSelector && 'rotate-180')} />
            </button>

            {showModeSelector && (
              <div className="absolute top-full left-0 mt-1.5 bg-white border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200 w-32">
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSearchMode(option.value);
                      setShowModeSelector(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-high transition-all text-sm font-medium',
                      searchMode === option.value && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="text-on-surface-variant/60">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result Count */}
          {hasSearched && filteredResults && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-on-surface-variant/60">
                搜索到
              </span>
              <span className="text-lg font-bold text-primary">
                {resultCount}
              </span>
              <span className="text-sm text-on-surface-variant/60">
                个结果
              </span>
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-on-surface-variant mb-3">最近搜索</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(search);
                    handleSearch();
                  }}
                  className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <p className="text-sm text-on-surface-variant mt-4">正在搜索...</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">查找相关内容</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && filteredResults && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {hasAnyResults ? (
              <>
                {renderSection('用户', { Icon: UserIcon, color: 'bg-gradient-to-br from-blue-500 to-blue-600' }, filteredResults.results.users, renderUserItem)}
                {renderSection('动态', { Icon: FileText, color: 'bg-gradient-to-br from-green-500 to-green-600' }, [...filteredResults.results.postsByTitle, ...filteredResults.results.postsByContent], renderSearchResultItem)}
                {renderSection('问答', { Icon: MessageSquare, color: 'bg-gradient-to-br from-purple-500 to-purple-600' }, [...filteredResults.results.questionsByTitle, ...filteredResults.results.questionsByContent], renderSearchResultItem)}
              </>
            ) : (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/20">
                <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-on-surface-variant/40" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">未找到相关结果</h3>
                <p className="text-sm text-on-surface-variant mb-4">试试其他关键词</p>
                <button
                  onClick={() => setQuery('')}
                  className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"
                >
                  清除搜索
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fallback: Recent Content */}
        {showFallback && (
          <div className={cn('animate-in slide-in-from-bottom-4 duration-300', loadingFallback && 'opacity-50')}>
            {loadingFallback && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!loadingFallback && (
              <>
                {!hasSearched && (
                  <div className="mb-6 text-center">
                    <h3 className="text-sm font-semibold text-on-surface-variant mb-2">探索社区</h3>
                    <p className="text-xs text-on-surface-variant/60">查看最新的动态和问答</p>
                  </div>
                )}
                {renderSection('最新动态', { Icon: TrendingUp, color: 'bg-gradient-to-br from-orange-500 to-orange-600' }, recentPosts, (post) => (
                  <div
                    key={`post-${post.post_id}`}
                    onClick={() => onNavigate('community')}
                    className="group bg-gradient-to-br from-white to-surface-container-low rounded-2xl p-5 border border-outline-variant/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
                        动态
                      </span>
                      <span className="text-xs font-semibold text-on-surface">{post.username || '用户'}</span>
                      <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.created_at || '')}
                      </span>
                    </div>
                    {post.title && <h4 className="text-base font-bold text-on-surface mb-2 line-clamp-1">{post.title}</h4>}
                    <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>
                ))}
                {renderSection('最新问答', { Icon: MessageSquare, color: 'bg-gradient-to-br from-purple-500 to-purple-600' }, recentQuestions, (question) => (
                  <div
                    key={`question-${question.question_id}`}
                    onClick={() => onNavigate('community')}
                    className="group bg-gradient-to-br from-white to-surface-container-low rounded-2xl p-5 border border-outline-variant/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
                        问答
                      </span>
                      <span className="text-xs font-semibold-semibold text-on-surface">{question.username || '用户'}</span>
                      <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {formatDate(question.created_at || '')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-on-surface mb-2 line-clamp-1">{question.title}</h4>
                    <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{question.content}</p>
                  </div>
                ))}
                {!hasSearched && recentPosts.length === 0 && recentQuestions.length === 0 && (
                  <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/20">
                    <TrendingUp className="w-16 h-16 text-on-surface-variant/40 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-on-surface mb-2">社区还比较安静</h3>
                    <p className="text-sm text-on-surface-variant">快去发布一些内容吧</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
