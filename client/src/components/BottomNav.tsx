import React from 'react';
import { Home, Groups, Psychology, Chat, Person } from '../pages/Icons';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems = [
  { id: 'home' as const, label: '首页', icon: Home },
  { id: 'community' as const, label: '社区', icon: Groups },
  { id: 'chat' as const, label: 'AI 对话', icon: Psychology },
  { id: 'messages' as const, label: '消息', icon: Chat },
  { id: 'profile' as const, label: '我的', icon: Person },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center pt-2 pb-4 md:pb-6 px-2 md:px-4 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
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
  );
};
