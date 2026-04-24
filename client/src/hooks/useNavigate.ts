import { useCallback } from 'react';
import { type NavigateFunction } from '../types';

// 简单的全局导航器，用于无法通过 props 传递导航函数的场景
let globalNavigate: NavigateFunction | null = null;

export function setGlobalNavigate(navigate: NavigateFunction) {
  globalNavigate = navigate;
}

export function useNavigate(): NavigateFunction {
  return useCallback((screen) => {
    if (globalNavigate) {
      globalNavigate(screen);
    }
  }, []);
}
