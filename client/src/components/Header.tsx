import React, { useMemo } from 'react';
import { Menu } from '../pages/Icons';

interface HeaderProps {
  isLoggedIn: boolean;
  onNavigate: (screen: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onNavigate }) => {
  const headerUser = useMemo(() => {
    if (!isLoggedIn) return null;
    try {
      const raw = localStorage.getItem('growpal_user');
      if (!raw) return null;
      return JSON.parse(raw) as { nickname?: string; avatar?: string | null };
    } catch {
      return null;
    }
  }, [isLoggedIn]);

  const avatarUrl =
    headerUser?.avatar ||
    (headerUser?.nickname
      ? `https://picsum.photos/seed/${encodeURIComponent(headerUser.nickname)}/100/100`
      : 'https://picsum.photos/seed=user/100/100');

  return (
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
          onClick={() => onNavigate('profile')}
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
  );
};
