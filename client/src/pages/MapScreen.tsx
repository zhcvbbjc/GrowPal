import React, { useEffect, useRef, useState } from 'react';
import { ArrowBack, Search } from './Icons';
import { useToast } from '../components/Toast';

interface MapScreenProps {
  onBack: () => void;
}

declare global {
  interface Window {
    TMap: any;
  }
}

export const MapScreen = ({ onBack }: MapScreenProps) => {
  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [searchText, setSearchText] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 加载腾讯地图 SDK
  useEffect(() => {
    if (window.TMap) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://map.qq.com/api/gljs?v=1.exp&key=MBIBZ-C2RW7-PGOX3-PEMVD-22BT7-B4FID';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      toast.error('地图加载失败，请检查网络');
    };
    document.head.appendChild(script);

    return () => {
      // 清理：不删除 script 标签，避免重复加载问题
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    try {
      const center = new window.TMap.LatLng(39.908823, 116.397470); // 北京中心
      mapInstanceRef.current = new window.TMap.Map(mapRef.current, {
        center: center,
        zoom: 12,
        viewMode: '2D',
      });
    } catch (e) {
      console.error('地图初始化失败:', e);
      toast.error('地图初始化失败');
    }
  }, [scriptLoaded]);

  return (
    <div className="relative w-full h-full bg-surface">
      {/* 搜索框 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center gap-2">
          {/* 返回按钮 */}
          <button
            type="button"
            onClick={onBack}
            className="flex-shrink-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <ArrowBack className="w-5 h-5 text-on-surface" />
          </button>
          {/* 搜索框 */}
          <div className="flex-1 flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2.5">
            <Search className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索地点..."
              className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant/60"
            />
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '100vh', zIndex: 0 }}
      />
    </div>
  );
};
