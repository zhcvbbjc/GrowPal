import React, { useState, useEffect } from 'react';
import { Search, ArrowBack as ArrowLeft, Sparkles, TrendingUp, StarsIcon, Clock, XCircle } from './Icons';
import { cn } from '../lib/utils';
import { type NavigateFunction } from '../types';

interface SearchRecommendScreenProps {
  onNavigate: NavigateFunction;
}

// 热门搜索数据（静态，后续可改为从 API 获取）
const HOT_SEARCHES = [
  { keyword: '作物种植技巧', trend: 'up' as const },
  { keyword: '病虫害防治', trend: 'up' as const },
  { keyword: '有机肥料使用', trend: 'stable' as const },
  { keyword: '土壤改良方法', trend: 'up' as const },
  { keyword: '灌溉技术', trend: 'down' as const },
  { keyword: '温室大棚管理', trend: 'stable' as const },
  { keyword: '农药使用指南', trend: 'up' as const },
  { keyword: '季节性播种', trend: 'up' as const },
];

// 搜索技巧数据
const SEARCH_TIPS = [
  {
    icon: '🎯',
    title: '精准搜索',
    description: '使用关键词组合，如"小麦 病虫害"，可以更精准地找到相关内容',
  },
  {
    icon: '🔍',
    title: '筛选功能',
    description: '搜索后可以使用"标题"或"内容"筛选，快速定位所需信息',
  },
  {
    icon: '💡',
    title: '同义词搜索',
    description: '尝试不同的词汇表达，如"施肥"和"肥料"可能会得到不同结果',
  },
  {
    icon: '📝',
    title: '标签搜索',
    description: '使用 #标签 形式搜索特定主题，如 "#有机农业"',
  },
];

export const SearchRecommendScreen: React.FC<SearchRecommendScreenProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 从 localStorage 加载搜索历史
  useEffect(() => {
    try {
      const stored = localStorage.getItem('growpal_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // 保存搜索历史到 localStorage
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
    setRecentSearches(updated);
    try {
      localStorage.setItem('growpal_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent search:', e);
    }
  };

  // 清除搜索历史
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('growpal_recent_searches');
    } catch (e) {
      console.error('Failed to clear recent searches:', e);
    }
  };

  // 处理搜索
  const handleSearch = (e?: React.FormEvent, searchQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = searchQuery || query;
    const trimmed = queryToUse.trim();
    
    if (!trimmed) return;

    saveRecentSearch(trimmed);
    onNavigate({ screen: 'search', query: trimmed });
  };

  // 点击热门搜索
  const handleHotSearch = (keyword: string) => {
    setQuery(keyword);
    handleSearch(undefined, keyword);
  };

  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gradient-to-br from-surface via-surface-container/30 to-surface-container/60 pb-8 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-lg border-b border-outline-variant/10 px-4 py-4 mb-4">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            搜索
          </h1>
        </div>
      </div>

      <div className="w-full">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative mb-6">
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

        {/* 搜索历史 */}
        {recentSearches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-on-surface-variant/60" />
                <h3 className="text-lg font-bold text-on-surface">搜索历史</h3>
              </div>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                清除历史
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(undefined, search)}
                  className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 热门搜索 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-on-surface">热门搜索</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {HOT_SEARCHES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleHotSearch(item.keyword)}
                className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-outline-variant/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  idx === 0 && 'bg-gradient-to-br from-red-500 to-red-600 text-white',
                  idx === 1 && 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
                  idx === 2 && 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
                  idx > 2 && 'bg-surface-container text-on-surface-variant'
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {item.keyword}
                  </span>
                </div>
                <div className={cn(
                  'text-xs',
                  item.trend === 'up' && 'text-red-500',
                  item.trend === 'down' && 'text-green-500',
                  item.trend === 'stable' && 'text-on-surface-variant/40'
                )}>
                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 搜索技巧 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <StarsIcon className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-on-surface">搜索技巧</h3>
          </div>
          <div className="space-y-3">
            {SEARCH_TIPS.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-2xl border border-outline-variant/20 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{tip.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-on-surface mb-1">{tip.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
