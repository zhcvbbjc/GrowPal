import React, { useState } from 'react';
import {
  ArrowBack,
  Palette,
  CheckCircle2,
  SunIcon,
  Moon,
  Language,
  NotificationsActive,
  Security,
  PrivacyTip,
  HelpOutline,
  Info,
  ChevronRight,
} from './Icons';
import { useTheme, type Theme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, setTheme } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const themeOptions = [
    { value: 'light' as Theme, label: '浅色', desc: '清新明亮', icon: '☀️' },
    { value: 'dark' as Theme, label: '深色', desc: '夜间模式', icon: '🌙' },
    { value: 'neutral' as Theme, label: '中性', desc: '简洁优雅', icon: '⚪' },
  ];

  const currentThemeDesc = themeOptions.find((t) => t.value === theme)?.desc;

  return (
    <div className="animate-in fade-in duration-500">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low transition-all active:scale-95"
        >
          <ArrowBack className="w-5 h-5 text-on-surface" />
        </button>
      </div>

      {/* 应用主题 */}
      <section className="mb-8">
        <div className="bg-surface-container rounded-3xl p-2">
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-surface-container">
              <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                应用主题
              </h3>
            </div>
            <div className="divide-y divide-surface-container">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-fixed/20 rounded-xl flex items-center justify-center text-primary">
                      {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">当前主题</h4>
                      <p className="text-sm text-on-surface-variant">{currentThemeDesc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    className={cn(
                      'w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center transition-all',
                      showThemeSelector ? 'bg-primary text-on-primary border-primary' : 'hover:bg-surface-container-low'
                    )}
                  >
                    <ChevronRight className={cn('w-5 h-5 transition-transform', showThemeSelector && 'rotate-90')} />
                  </button>
                </div>

                {/* 主题选择面板 */}
                {showThemeSelector && (
                  <div className="mt-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <p className="text-sm text-on-surface-variant mb-3">选择你喜欢的主题风格</p>
                    <div className="grid grid-cols-3 gap-3">
                      {themeOptions.map((option) => {
                        const isActive = theme === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setTheme(option.value);
                            }}
                            className={cn(
                              'relative p-4 rounded-xl border transition-all duration-300 text-center group',
                              isActive
                                ? 'bg-primary border-primary text-on-primary shadow-md scale-[1.02]'
                                : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container hover:scale-[1.01]'
                            )}
                          >
                            <span className="text-2xl block mb-2">{option.icon}</span>
                            <p className={cn('font-bold text-sm', isActive ? 'text-on-primary' : 'text-on-surface')}>
                              {option.label}
                            </p>
                            <p className={cn('text-xs mt-1', isActive ? 'text-on-primary/80' : 'text-on-surface-variant')}>
                              {option.desc}
                            </p>
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-4 h-4 text-on-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 其他设置项 */}
      <section className="mb-8">
        <div className="bg-surface-container rounded-3xl p-2">
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm divide-y divide-surface-container">
            {[
              { icon: Language, label: '语言', sub: '简体中文', action: 'zh-CN' },
              { icon: NotificationsActive, label: '通知设置', sub: '消息提醒、推送管理', action: 'notifications' },
              { icon: Security, label: '隐私与安全', sub: '密码、数据权限', action: 'privacy' },
              { icon: PrivacyTip, label: '数据管理', sub: '导出、清除缓存', action: 'data' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-fixed/20 rounded-xl flex items-center justify-center text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 关于 */}
      <section className="mb-8">
        <div className="bg-surface-container rounded-3xl p-2">
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm divide-y divide-surface-container">
            {[
              { icon: HelpOutline, label: '帮助与反馈', sub: '常见问题、意见反馈', action: 'help' },
              { icon: Info, label: '关于 GrowPal', sub: '版本 1.0.0', action: 'about' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-fixed/20 rounded-xl flex items-center justify-center text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
