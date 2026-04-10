import React, { useState, useMemo } from 'react';
import { Home, Groups, Psychology, Chat, Person } from './pages/Icons';
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
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';

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

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {currentScreen !== 'LoginPage' && (
                <Header isLoggedIn={!!headerUser} onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'LoginPage' && (
                <Header isLoggedIn={false} onNavigate={setCurrentScreen} />
            )}

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6 pb-32">
                <ErrorBoundary>{renderScreen()}</ErrorBoundary>
            </main>

            <BottomNav currentScreen={currentScreen} onNavigate={handleNavClick} />
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
