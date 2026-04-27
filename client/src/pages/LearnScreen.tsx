import React from 'react';
import { BookOpen } from './Icons';

export const LearnScreen = () => {
  return (
    <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant">
      <BookOpen className="w-20 h-20 mb-4 text-primary/50" />
      <p className="text-xl font-bold mb-2 text-on-surface">学习页面</p>
      <p className="text-sm">暂无内容，敬请期待</p>
    </div>
  );
};
