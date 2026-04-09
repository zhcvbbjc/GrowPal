import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from '../pages/Icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-on-surface mb-2">出现了一些问题</h2>
                    <p className="text-sm text-on-surface-variant text-center mb-6 max-w-md">
                        {this.state.error?.message || '组件渲染失败'}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        刷新页面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
