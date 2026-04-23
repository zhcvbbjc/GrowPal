import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, User, Settings, NotificationsActive as Bell, ChevronRight, Logout as LogOut } from '../pages/Icons';

interface HeaderProps {
  isLoggedIn: boolean;
  onNavigate: (screen: any) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onNavigate, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const headerUser = useMemo(() => {
    if (!isLoggedIn) return null;
    try {
      const raw = localStorage.getItem('growpal_user');
      if (!raw) return null;
      return JSON.parse(raw) as { nickname?: string; avatar?: string | null; id?: number };
    } catch {
      return null;
    }
  }, [isLoggedIn]);

  const avatarUrl =
    headerUser?.avatar ||
    (headerUser?.nickname
      ? `https://picsum.photos/seed/${encodeURIComponent(headerUser.nickname)}/100/100`
      : 'https://picsum.photos/seed=user/100/100');

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleProfileClick = () => {
    setShowMenu(false);
    onNavigate('profile');
  };

  const handleSettingsClick = () => {
    setShowMenu(false);
    onNavigate('profile');
    // 可以在这里进一步导航到设置
    setTimeout(() => onNavigate('settings'), 100);
  };

  const handleNotificationsClick = () => {
    setShowMenu(false);
    // 暂时没有通知页面，先跳转到消息
    onNavigate('messages');
  };

  const handleLogoutClick = () => {
    setShowMenu(false);
    onLogout?.();
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center px-4 md:px-6 py-3 md:py-4 w-full sticky top-0 z-50">
      {/* 左侧：个人头像入口 */}
      <div className="flex items-center gap-2 md:gap-3">
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
              aria-label="profile menu"
            >
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>

            {/* 悬浮菜单 */}
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                {/* 用户信息区域 */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary-container/10 border-b border-outline-variant/10">
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleProfileClick}
                  >
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30">
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-on-surface text-base truncate">
                        {headerUser?.nickname || '用户'}
                      </div>
                      <div className="text-xs text-on-surface-variant">查看个人主页</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant/60" />
                  </div>
                </div>

                {/* 菜单项 */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors"
                  >
                    <User className="w-5 h-5 text-on-surface-variant/70" />
                    <span className="text-sm text-on-surface font-medium">个人信息</span>
                  </button>
                  <button
                    onClick={handleNotificationsClick}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors"
                  >
                    <Bell className="w-5 h-5 text-on-surface-variant/70" />
                    <span className="text-sm text-on-surface font-medium">通知</span>
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors"
                  >
                    <Settings className="w-5 h-5 text-on-surface-variant/70" />
                    <span className="text-sm text-on-surface font-medium">设置</span>
                  </button>
                </div>

                {/* 退出登录 */}
                <div className="border-t border-outline-variant/10 py-2">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('LoginPage')}
            className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="login"
          >
            <User className="text-on-surface-variant w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-bold text-primary">GrowPal</h1>
      </div>

      {/* 右侧：搜索图标 */}
      <button
        type="button"
        onClick={() => onNavigate('searchRecommend')}
        className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
        aria-label="search"
      >
        <Search className="text-on-surface w-5 h-5 md:w-6 md:h-6" />
      </button>
    </header>
  );
};
