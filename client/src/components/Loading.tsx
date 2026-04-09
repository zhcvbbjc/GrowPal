import React from 'react';
import { Loader2 } from '../pages/Icons';

interface LoadingOverlayProps {
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    fullScreen = false,
    size = 'md',
    text = '加载中...',
    className = '',
}) => {
    const sizeMap = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const textSizeMap = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
                {text && <p className={`mt-4 ${textSizeMap[size]} text-on-surface-variant font-medium`}>{text}</p>}
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
            {text && <p className={`mt-4 ${textSizeMap[size]} text-on-surface-variant font-medium`}>{text}</p>}
        </div>
    );
};

export const LoadingSkeleton: React.FC<{ lines?: number; className?: string }> = ({
    lines = 3,
    className = '',
}) => {
    return (
        <div className={`space-y-3 animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-surface-container-low rounded"
                    style={{ width: `${100 - (i * 15)}%` }}
                />
            ))}
        </div>
    );
};
