import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Home, Groups, Psychology, Chat, Person } from './pages/Icons';
import { HomeScreen } from './pages/HomeScreen';
import { CommunityScreen } from './pages/CommunityScreen';
import { AIChatScreen } from './pages/AIChatScreen';
import { MessagesScreen } from './pages/MessagesScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { ProfileSettingsScreen } from './pages/ProfileSettingsScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { SearchScreen } from './pages/SearchScreen';
import { SearchRecommendScreen } from './pages/SearchRecommendScreen';
import { UserPage } from './pages/UserPage';
import { UserSearchScreen } from './pages/UserSearchScreen';
import { PostDetailPage } from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import { cn } from './lib/utils';
import { Screen } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';

type ScreenWithQuery = Screen | { screen: Screen; query: string; userId?: number; postId?: number; questionId?: number };

const ProtectedRoute: React.FC<{
    isLogged: boolean;
    loading: boolean;
    children: React.ReactNode;
    onLoginRequired: () => void;
}> = ({ isLogged, loading, children, onLoginRequired }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-on-surface-variant">正在验证...</p>
                </div>
            </div>
        );
    }

    if (!isLogged) {
        return <div className="p-10 text-center text-gray-500">请先登录</div>;
    }

    return <>{children}</>;
};

function AppContent() {
    const { isLoggedIn, loading, login, logout } = useAuth();
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');
    const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

    // 初始化浏览器历史记录
    useEffect(() => {
        // 页面加载时，确保有一个初始的历史记录状态
        if (history.length === 1) {
            history.pushState({ screen: 'home' }, '', window.location.href);
        }

        // 监听浏览器的 popstate 事件（用户点击前进/后退按钮）
        const handlePopState = (event: PopStateEvent) => {
            // 如果历史记录不止一条，说明可以返回上一页
            if (history.length > 1) {
                history.back();
            } else {
                // 否则，跳转到首页
                setCurrentScreen('home');
                setSelectedUserId(null);
                setSelectedPostId(null);
                setSelectedQuestionId(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // 包装的屏幕切换函数，同时更新浏览器历史记录
    const handleScreenChange = useCallback((screen: ScreenWithQuery) => {
        if (typeof screen === 'object') {
            if (screen.screen === 'search') {
                setSearchQuery(screen.query);
            }
            if (screen.screen === 'userPage' && screen.userId) {
                setSelectedUserId(screen.userId);
            }
            if (screen.screen === 'postDetail' && screen.postId) {
                setSelectedPostId(screen.postId);
            }
            if (screen.screen === 'questionDetail' && screen.questionId) {
                setSelectedQuestionId(screen.questionId);
            }
            setCurrentScreen(screen.screen);
            // 添加历史记录
            history.pushState({ screen: screen.screen }, '', window.location.href);
        } else {
            setCurrentScreen(screen);
            // 添加历史记录
            history.pushState({ screen }, '', window.location.href);
        }
    }, []);

    const handleNavigateToSettings = () => {
        setPreviousScreen(currentScreen);
        setCurrentScreen('settings');
    };

    const handleNavigateToProfileSettings = () => {
        setPreviousScreen(currentScreen);
        setCurrentScreen('profileSettings');
    };

    const handleBackToPrevious = () => {
        if (previousScreen) {
            setCurrentScreen(previousScreen);
            setPreviousScreen(null);
        } else {
            setCurrentScreen('profile');
        }
    };

    const handleLoginSuccess = () => {
        setCurrentScreen('profile');
    };

    const handleLogout = () => {
        logout();
        setCurrentScreen('home');
        setPreviousScreen(null);
    };

    const handleNavClick = (screenId: ScreenWithQuery) => {
        if (typeof screenId === 'object') {
            if (screenId.screen === 'search') {
                setSearchQuery(screenId.query);
            }
            const protectedScreens = ['chat', 'messages', 'profile'];
            if (protectedScreens.includes(screenId.screen) && !isLoggedIn) {
                setCurrentScreen('LoginPage');
            } else {
                setCurrentScreen(screenId.screen);
            }
            return;
        }

        const protectedScreens = ['chat', 'messages', 'profile'];
        if (protectedScreens.includes(screenId) && !isLoggedIn) {
            setCurrentScreen('LoginPage');
        } else {
            setCurrentScreen(screenId);
        }
    };

    const onLoginRequired = () => setCurrentScreen('LoginPage');

    const renderScreen = () => {
        switch (currentScreen) {
            case 'home':
                return <HomeScreen onNavigate={handleScreenChange} />;
            case 'community':
                return <CommunityScreen onNavigate={handleScreenChange} />;
            case 'LoginPage':
                return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            case 'searchRecommend':
                return <SearchRecommendScreen onNavigate={handleScreenChange} />;
            case 'search':
                return <SearchScreen onNavigate={handleScreenChange} initialQuery={searchQuery} />;
            case 'userPage':
                return selectedUserId ? (
                    <UserPage onNavigate={handleScreenChange} userId={selectedUserId} />
                ) : (
                    <HomeScreen onNavigate={handleScreenChange} />
                );
            case 'userSearch':
                return <UserSearchScreen onNavigate={handleScreenChange} />;
            case 'postDetail':
                return selectedPostId ? (
                    <PostDetailPage
                        type="post"
                        id={selectedPostId}
                        onBack={() => setCurrentScreen('community')}
                        onNavigate={handleScreenChange}
                    />
                ) : (
                    <CommunityScreen onNavigate={handleScreenChange} />
                );
            case 'questionDetail':
                return selectedQuestionId ? (
                    <PostDetailPage
                        type="question"
                        id={selectedQuestionId}
                        onBack={() => setCurrentScreen('community')}
                        onNavigate={handleScreenChange}
                    />
                ) : (
                    <CommunityScreen onNavigate={handleScreenChange} />
                );
            case 'chat':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <AIChatScreen />
                    </ProtectedRoute>
                );
            case 'messages':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <MessagesScreen onNavigate={handleScreenChange} />
                    </ProtectedRoute>
                );
            case 'profile':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <ProfileScreen onNavigateSettings={handleNavigateToProfileSettings} onNavigateAppSettings={handleNavigateToSettings} onNavigateCommunity={() => setCurrentScreen('community')} onLogout={handleLogout} />
                    </ProtectedRoute>
                );
            case 'profileSettings':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <ProfileSettingsScreen onBack={handleBackToPrevious} />
                    </ProtectedRoute>
                );
            case 'settings':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <SettingsScreen onBack={handleBackToPrevious} />
                    </ProtectedRoute>
                );
            default:
                return <HomeScreen onNavigate={handleScreenChange} />;
        }
    };

    const navItems = [
        { id: 'home', label: '首页', icon: Home },
        { id: 'community', label: '社区', icon: Groups },
        { id: 'chat', label: 'AI 对话', icon: Psychology },
        { id: 'messages', label: '消息', icon: Chat },
        { id: 'profile', label: '我的', icon: Person },
    ];

    const headerUser = useMemo(() => {
        if (!isLoggedIn) return null;
        try {
            const raw = localStorage.getItem('growpal_user');
            if (!raw) return null;
            return JSON.parse(raw) as { nickname?: string; avatar?: string | null };
        } catch {
            return null;
        }
    }, [isLoggedIn, currentScreen]);

    const shouldShowHeader = currentScreen !== 'LoginPage' && currentScreen !== 'searchRecommend' && currentScreen !== 'search' && currentScreen !== 'userPage' && currentScreen !== 'userSearch' && currentScreen !== 'postDetail' && currentScreen !== 'questionDetail';
    const shouldShowBottomNav = currentScreen !== 'LoginPage' && currentScreen !== 'searchRecommend' && currentScreen !== 'search' && currentScreen !== 'userPage' && currentScreen !== 'userSearch' && currentScreen !== 'postDetail' && currentScreen !== 'questionDetail';

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {shouldShowHeader && (
                <Header isLoggedIn={!!headerUser} onNavigate={setCurrentScreen} onLogout={handleLogout} />
            )}

            {currentScreen === 'LoginPage' && (
                <Header isLoggedIn={false} onNavigate={setCurrentScreen} />
            )}

            <main className={cn(
                'flex-1 max-w-4xl mx-auto w-full px-4',
                shouldShowBottomNav ? 'pt-6 pb-32' : 'pt-6 pb-6'
            )}>
                <ErrorBoundary>{renderScreen()}</ErrorBoundary>
            </main>

            {shouldShowBottomNav && (
                <BottomNav currentScreen={currentScreen} onNavigate={handleNavClick} />
            )}
        </div>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </ToastProvider>
    );
}
