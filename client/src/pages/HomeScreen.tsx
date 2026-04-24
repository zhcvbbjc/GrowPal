import React, { useState, useEffect } from 'react';
import { Psychology, Favorite, ChatBubble, Bookmark, AutoAwesome, PottedPlant, TrendingUp, Groups, UsersIcon, Award, ArrowRight, Loader2, EditSquare, MessageSquareQuote, Chat, MapPin, Cloud, SunIcon, CloudRain } from './Icons';
import { cn } from '../lib/utils';
import { fetchPosts, fetchQuestions, getApiMessage, getCurrentLocationAndWeather, type PostRow, type QuestionRow, type LocationData, type WeatherData, type WeatherCast } from '../services/growpalApi';
import { useToast } from '../components/Toast';
import { type NavigateFunction } from '../types';

export const HomeScreen = ({ onNavigate }: { onNavigate: NavigateFunction }) => {
  const toast = useToast();
  const [recentPosts, setRecentPosts] = useState<PostRow[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [posts, questions] = await Promise.all([
          fetchPosts(),
          fetchQuestions(),
        ]);
        if (!cancelled) {
          setRecentPosts(posts.slice(0, 3));
          setRecentQuestions(questions.slice(0, 2));
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load posts and questions:', getApiMessage(e));
        }
      }

      // 单独加载定位和天气，失败不影响主内容
      try {
        const locationData = await getCurrentLocationAndWeather();
        if (!cancelled && locationData.success) {
          setLocation(locationData.location);
          setWeather(locationData.weather);
        }
      } catch (e) {
        console.error('Failed to load location and weather:', getApiMessage(e));
      }

      if (!cancelled) setLoading(false);
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { icon: TrendingUp, label: '今日动态', value: '128', color: 'text-green-600' },
    { icon: UsersIcon, label: '活跃用户', value: '1,024', color: 'text-blue-600' },
    { icon: Award, label: '解决问题', value: '856', color: 'text-purple-600' },
  ];

  const quickActions = [
    { icon: Psychology, label: 'AI 问答', color: 'from-primary to-primary-container', screen: 'chat' as const },
    { icon: EditSquare, label: '发动态', color: 'from-blue-500 to-blue-600', screen: 'community' as const },
    { icon: MessageSquareQuote, label: '提问题', color: 'from-purple-500 to-purple-600', screen: 'community' as const },
    { icon: Chat, label: '私信', color: 'from-orange-500 to-orange-600', screen: 'messages' as const },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Location and Weather */}
      {(location || weather) && (
        <section className="mb-4">
          <div className="bg-white rounded-2xl p-4 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-on-surface">
                    {location.city || location.province}
                  </span>
                </div>
              )}
              {weather && weather.casts && weather.casts.length > 0 && (
                <div className="flex items-center gap-2">
                  {weather.casts[0].dayweather.includes('晴') ? (
                    <SunIcon className="w-4 h-4 text-orange-500" />
                  ) : weather.casts[0].dayweather.includes('雨') ? (
                    <CloudRain className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Cloud className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-on-surface">
                    {weather.casts[0].daytemp}°C
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {weather.casts[0].dayweather}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AI Hero Card */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-3xl signature-gradient p-6 md:p-8 text-on-primary shadow-xl group cursor-pointer hover:shadow-2xl transition-all"
             onClick={() => onNavigate('chat')}>
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-primary-container/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-primary-fixed/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="glass-ai px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">AI 在线</span>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-headline leading-tight mb-3 tracking-tight">
              你的农业智能顾问
            </h2>
            <p className="text-primary-fixed/90 text-sm mb-6 max-w-xs leading-relaxed">
              询问作物健康、土壤分析、天气预报等任何问题
            </p>
            <button
              className="bg-surface-container-lowest text-primary px-6 md:px-8 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 hover:scale-105 transition-transform shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('chat');
              }}
            >
              <span>立即咨询</span>
              <Psychology className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h3 className="text-xl font-bold font-headline text-on-surface mb-4">快捷功能</h3>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(action.screen)}
              className="flex flex-col items-center gap-2 p-3 md:p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-outline-variant/10 active:scale-95 transition-all"
            >
              <div className={cn(
                'w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md',
                action.color
              )}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-on-surface">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-3 md:p-4 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all"
            >
              <stat.icon className={cn('w-6 h-6 mb-2', stat.color)} />
              <div className="text-xl md:text-2xl font-bold text-on-surface mb-1">{stat.value}</div>
              <div className="text-[10px] md:text-xs text-on-surface-variant font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface">最新动态</h3>
            <p className="text-xs text-on-surface-variant mt-1">来自社区的实时动态</p>
          </div>
          <button
            onClick={() => onNavigate('community')}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.length === 0 && recentQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm">暂无动态，去社区看看吧</p>
              </div>
            ) : (
              <>
                {recentPosts.map((post) => (
                  <article
                    key={post.post_id}
                    onClick={() => onNavigate({ screen: 'postDetail', query: '', postId: post.post_id })}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            动态
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {post.username || '用户'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/40">
                            {post.created_at ? new Date(post.created_at).toLocaleString('zh-CN') : ''}
                          </span>
                        </div>
                        {post.title && (
                          <h4 className="text-sm md:text-base font-bold text-on-surface line-clamp-1 mb-1">
                            {post.title}
                          </h4>
                        )}
                        <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-on-surface-variant/60">
                          <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Favorite className="w-4 h-4" />
                            <span className="text-xs font-semibold">{post.like_count || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <ChatBubble className="w-4 h-4" />
                            <span className="text-xs font-semibold">{post.comment_count || 0}</span>
                          </button>
                        </div>
                      </div>
                      {post.image_path && (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={post.image_path}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                {recentQuestions.map((q) => (
                  <article
                    key={q.question_id}
                    onClick={() => onNavigate({ screen: 'questionDetail', query: '', questionId: q.question_id })}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-100 text-purple-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                        问答
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {q.username || '用户'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/40">
                        {q.created_at ? new Date(q.created_at).toLocaleString('zh-CN') : ''}
                      </span>
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-on-surface mb-2 line-clamp-1">
                      {q.title}
                    </h4>
                    <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                      {q.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-on-surface-variant/60">
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Favorite className="w-4 h-4" />
                        <span className="text-xs font-semibold">{q.like_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <ChatBubble className="w-4 h-4" />
                        <span className="text-xs font-semibold">{q.comment_count || 0}</span>
                      </button>
                    </div>
                  </article>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* Tips Card */}
      <section className="mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <PottedPlant className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-on-surface mb-2">种植小贴士</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                春季是播种的好时节，注意保持土壤湿润，适时施肥，可以促进作物生长。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating AI Button */}
      <div className="fixed bottom-24 right-4 md:right-6 z-40">
        <button
          onClick={() => onNavigate('chat')}
          className="w-14 h-14 rounded-2xl signature-gradient text-on-primary shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform editorial-shadow"
        >
          <AutoAwesome className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
