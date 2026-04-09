import React, { useState, useMemo } from 'react';
import { Menu, Home, Groups, Psychology, Chat, Person } from './pages/Icons';
import { HomeScreen } from './pages/HomeScreen';
import { CommunityScreen } from './pages/CommunityScreen';
import { AIChatScreen } from './pages/AIChatScreen';
import { MessagesScreen } from './pages/MessagesScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import LoginPage from './pages/LoginPage';
import { cn } from './lib/utils';
import { Screen } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

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

    const handleLoginSuccess = () => {
        setCurrentScreen('profile');
    };

    const handleLogout = () => {
        logout();
        setCurrentScreen('home');
    };

    const handleNavClick = (screenId: string) => {
        const protectedScreens = ['chat', 'messages', 'profile'];
        if (protectedScreens.includes(screenId) && !isLoggedIn) {
            setCurrentScreen('LoginPage');
        } else {
            setCurrentScreen(screenId as Screen);
        }
    };

    const onLoginRequired = () => setCurrentScreen('LoginPage');

    const renderScreen = () => {
        switch (currentScreen) {
            case 'home':
                return <HomeScreen onNavigate={setCurrentScreen} />;
            case 'community':
                return <CommunityScreen />;
            case 'LoginPage':
                return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            case 'chat':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <AIChatScreen />
                    </ProtectedRoute>
                );
            case 'messages':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <MessagesScreen />
                    </ProtectedRoute>
                );
            case 'profile':
                return (
                    <ProtectedRoute isLogged={isLoggedIn} loading={loading} onLoginRequired={onLoginRequired}>
                        <ProfileScreen onLogout={handleLogout} />
                    </ProtectedRoute>
                );
            default:
                return <HomeScreen onNavigate={setCurrentScreen} />;
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

    const avatarUrl =
        headerUser?.avatar ||
        (headerUser?.nickname
            ? `https://picsum.photos/seed/${encodeURIComponent(headerUser.nickname)}/100/100`
            : 'https://picsum.photos/seed=user/100/100');

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {currentScreen !== 'LoginPage' && (
                <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center px-4 md:px-6 py-3 md:py-4 w-full sticky top-0 z-50">
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            type="button"
                            className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                            aria-label="menu"
                        >
                            <Menu className="text-primary w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-primary">GrowPal</h1>
                    </div>
                    {isLoggedIn && (
                        <button
                            type="button"
                            onClick={() => setCurrentScreen('profile')}
                            className="h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all"
                        >
                            <img
                                src={avatarUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </button>
                    )}
                </header>
            )}

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6 pb-32">
                <ErrorBoundary>{renderScreen()}</ErrorBoundary>
            </main>

            {currentScreen !== 'LoginPage' && (
                <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center pt-2 pb-4 md:pb-6 px-2 md:px-4 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 z-50">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavClick(item.id)}
                            className={cn(
                                'flex flex-col items-center gap-0.5 md:gap-1 transition-all px-2 md:px-3 py-1 rounded-lg',
                                currentScreen === item.id
                                    ? 'text-primary bg-primary/5 scale-105'
                                    : 'text-on-surface-variant hover:bg-surface-container/50'
                            )}
                        >
                            <item.icon className={cn(
                                'w-5 h-5 md:w-6 md:h-6 transition-transform',
                                currentScreen === item.id && 'scale-110'
                            )} />
                            <span className="text-[9px] md:text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ToastProvider>
    );
}
