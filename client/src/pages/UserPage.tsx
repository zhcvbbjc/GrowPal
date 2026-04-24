import React, { useState, useEffect } from 'react';
import {
  ArrowBack as ArrowLeft,
  User as UserIcon,
  Article as FileText,
  MessageSquareQuote as MessageSquare,
  Loader2,
  Chat,
  Calendar,
  Person as PersonAdd,
  Favorite,
  ChatBubble,
} from './Icons';
import { cn } from '../lib/utils';
import {
  fetchUserProfile,
  fetchUserPosts,
  fetchUserQuestions,
  type UserProfile,
  type PostRow,
  type QuestionRow,
} from '../services/growpalApi';
import { type NavigateFunction } from '../types';

interface UserPageProps {
  onNavigate: NavigateFunction;
  userId: number;
}

export const UserPage: React.FC<UserPageProps> = ({ onNavigate, userId }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [userData, userPosts, userQuestions] = await Promise.all([
        fetchUserProfile(userId),
        fetchUserPosts(userId),
        fetchUserQuestions(userId),
      ]);
      setUser(userData);
      setPosts(userPosts);
      setQuestions(userQuestions);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPostSnippet = (content: string, maxLength: number = 100) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + '...' : plainText;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant mt-4">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8 text-on-surface-variant/40" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">用户不存在</h3>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"
        >
          返回首页
        </button>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-on-surface">用户主页</h1>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mb-6 bg-gradient-to-br from-white to-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
        
        {/* Profile Info */}
        <div className="px-5 pb-5 -mt-12">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden ring-4 ring-surface">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-white" />
              )}
            </div>
            {user.role === 'admin' && (
              <span className="text-xs bg-gradient-to-r from-primary to-primary-container text-white px-3 py-1 rounded-full font-semibold mb-2">
                管理员
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-on-surface mb-2">{user.username}</h2>
          {user.bio && (
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{user.bio}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-on-surface-variant/60 mb-4">
            <Calendar className="w-4 h-4" />
            <span>加入于 {formatDate(user.created_at)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-semibold hover:shadow-lg hover:from-primary/90 hover:to-primary-container/90 transition-all"
              onClick={() => {}}
            >
              <PersonAdd className="w-5 h-5" />
              <span>关注</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-high text-on-surface rounded-xl font-semibold hover:bg-surface-container transition-all"
              onClick={() => onNavigate('messages')}
            >
              <Chat className="w-5 h-5" />
              <span>发消息</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-white to-surface-container-low rounded-xl p-4 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-on-surface-variant">动态</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{posts.length}</span>
        </div>
        <div className="bg-gradient-to-br from-white to-surface-container-low rounded-xl p-4 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-on-surface-variant">问答</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{questions.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-outline-variant/20">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'posts'
              ? 'bg-primary text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>动态 ({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'questions'
              ? 'bg-primary text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>问答 ({questions.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <button
                key={`post-${post.post_id}`}
                type="button"
                onClick={() => onNavigate({ screen: 'postDetail', query: '', postId: post.post_id })}
                className="w-full text-left bg-gradient-to-br from-white to-surface-container-low rounded-xl shadow-sm overflow-hidden transition-all hover:translate-y-[-2px] editorial-shadow border border-outline-variant/5"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                      动态
                    </span>
                    {post.created_at && (
                      <span className="text-[11px] text-on-surface-variant">
                        {new Date(post.created_at).toLocaleString('zh-CN')}
                      </span>
                    )}
                    {post.tags && (
                      <div className="flex flex-nowrap gap-1.5 flex-shrink-0 ml-auto">
                        {(() => {
                          try {
                            const tagsArray = JSON.parse(post.tags);
                            return tagsArray.slice(0, 2).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium whitespace-nowrap"
                              >
                                #{tag}
                              </span>
                            ));
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    )}
                  </div>
                  {post.title && (
                    <h4 className="text-base font-bold text-on-surface font-headline line-clamp-1 mb-2">
                      {post.title}
                    </h4>
                  )}
                  <p className="text-on-surface text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap mb-3">
                    {post.content}
                  </p>
                </div>
                {post.image_path && (
                  <div className="relative h-48 w-full">
                    <img
                      src={post.image_path}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-4 flex items-center gap-6 border-t border-outline-variant/5">
                  <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                    <Favorite className="w-4 h-4" /> {post.like_count || 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                    <ChatBubble className="w-4 h-4" /> {post.comment_count || 0}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/20">
              <FileText className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant">暂无动态</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((question) => (
              <button
                key={`question-${question.question_id}`}
                type="button"
                onClick={() => onNavigate({ screen: 'questionDetail', query: '', questionId: question.question_id })}
                className="w-full text-left bg-gradient-to-br from-white to-surface-container-low rounded-xl shadow-sm p-6 transition-all hover:translate-y-[-2px] editorial-shadow border border-outline-variant/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-100 text-purple-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    问答
                  </span>
                  {question.created_at && (
                    <span className="text-[11px] text-on-surface-variant">
                      {new Date(question.created_at).toLocaleString('zh-CN')}
                    </span>
                  )}
                  {question.tags && (
                    <div className="flex flex-nowrap gap-1.5 flex-shrink-0 ml-auto">
                      {(() => {
                        try {
                          const tagsArray = JSON.parse(question.tags);
                          return tagsArray.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium whitespace-nowrap"
                            >
                              #{tag}
                            </span>
                          ));
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-on-surface font-headline line-clamp-1 mb-2">
                  {question.title}
                </h4>
                <p className="text-on-surface-variant text-sm line-clamp-3 leading-relaxed whitespace-pre-wrap mb-3">
                  {question.content}
                </p>
                {question.image_path && (
                  <div className="mt-4 h-36 rounded-xl overflow-hidden">
                    <img
                      src={question.image_path}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex items-center gap-6 pt-3 border-t border-outline-variant/5">
                  <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                    <Favorite className="w-4 h-4" /> {question.like_count || 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                    <ChatBubble className="w-4 h-4" /> {question.comment_count || 0}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/20">
              <MessageSquare className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant">暂无问答</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
