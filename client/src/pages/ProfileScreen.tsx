import React, { useEffect, useState } from 'react';
import {
  LocationOn,
  Stars,
  Article,
  QuestionAnswer,
  ArrowForward,
  Person,
  NotificationsActive,
  Security,
  Settings,
  Logout,
  ChevronRight,
  Loader2,
} from './Icons';
import { fetchMe, getApiMessage, getCurrentLocationAndWeather, fetchMyPosts, fetchMyQuestions, type LocationData, type WeatherData, type WeatherCast, type PostRow, type QuestionRow } from '../services/growpalApi';
import { cn } from '../lib/utils';

interface ProfileScreenProps {
  onNavigateSettings: () => void;
  onNavigateAppSettings: () => void;
  onNavigateCommunity: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateSettings, onNavigateAppSettings, onNavigateCommunity, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [nickname, setNickname] = useState('GrowPal 用户');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [myPosts, setMyPosts] = useState<PostRow[]>([]);
  const [myQuestions, setMyQuestions] = useState<QuestionRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [me, locationData] = await Promise.all([
          fetchMe(),
          getCurrentLocationAndWeather().catch(() => ({ success: false, location: null, weather: null }))
        ]);
        if (cancelled) return;
        setNickname(me.nickname);
        setAvatar(me.avatar);
        setPhone(me.phone);
        setBio(me.bio);
        localStorage.setItem('growpal_user', JSON.stringify({
          id: me.id,
          nickname: me.nickname,
          avatar: me.avatar,
        }));

        if (locationData.success && locationData.location) {
          setLocation(locationData.location);
        }

        const [posts, questions] = await Promise.all([
          fetchMyPosts().catch(() => []),
          fetchMyQuestions().catch(() => [])
        ]);
        if (!cancelled) {
          setMyPosts(posts);
          setMyQuestions(questions);
        }
      } catch (e) {
        if (!cancelled) setErr(getApiMessage(e));
        try {
          const raw = localStorage.getItem('growpal_user');
          if (raw) {
            const u = JSON.parse(raw) as { nickname?: string; avatar?: string | null };
            if (u.nickname) setNickname(u.nickname);
            if (u.avatar !== undefined) setAvatar(u.avatar);
          }
        } catch {
          /* ignore */
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const avatarSrc =
    avatar ||
    `https://picsum.photos/seed/${encodeURIComponent(nickname)}/400/400`;

  return (
    <div className="animate-in fade-in duration-500">
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {err && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/30 text-error text-sm">{err}</div>
      )}

      <section className="relative mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-4 relative group">
            <div className="aspect-square rounded-xl overflow-hidden shadow-xl transform transition-transform group-hover:scale-[1.02] duration-300">
              <img
                className="w-full h-full object-cover"
                src={avatarSrc}
                alt="Profile"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 signature-gradient text-on-primary px-4 py-2 rounded-lg font-headline font-bold shadow-lg">
              Member
            </div>
          </div>
          <div className="lg:col-span-8">
            <p className="text-primary font-bold font-headline uppercase tracking-[0.2em] text-sm mb-2">
              GrowPal Account
            </p>
            <h2 className="text-5xl font-extrabold font-headline text-on-surface mb-4 tracking-tight">
              {nickname}
            </h2>
            <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed mb-6">
              {bio || '用户个人简介'}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/10">
                <LocationOn className="text-primary w-4 h-4" />
                <span className="text-sm font-medium">{location ? location.city : '定位中...'}</span>
              </div>
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/10">
                <Stars className="text-primary w-4 h-4" />
                <span className="text-sm font-medium">{phone || '已绑定手机'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 hover:bg-surface-container-low transition-colors duration-200">  
          <Article className="text-primary w-6 h-6 mb-4" />
          <div className="text-3xl font-bold font-headline mb-1">{myPosts.length}</div>
          <div className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">
            动态
          </div>
        </div>
        <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 hover:bg-surface-container-low transition-colors duration-200">  
          <QuestionAnswer className="text-primary w-6 h-6 mb-4" />
          <div className="text-3xl font-bold font-headline mb-1">{myQuestions.length}</div>
          <div className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">
            问答
          </div>
        </div>
        <div className="md:col-span-2 bg-secondary-container/30 p-6 rounded-xl border border-outline-variant/5 flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-on-secondary-container text-xl mb-1">
              社区
            </h3>
            <p className="text-on-secondary-fixed-variant text-sm">在「Community」查看帖子与问题</p>
          </div>
          <button
            type="button"
            onClick={onNavigateCommunity}
            className="bg-secondary text-on-secondary p-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
            aria-label="go"
          >
            <ArrowForward className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-surface-container rounded-3xl p-2 mb-8">
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-surface-container">
            {[
              {
                icon: Person,
                title: '个人信息',
                desc: '修改用户名、头像、邮箱和个人简介',
                onClick: onNavigateSettings,
              },
              {
                icon: NotificationsActive,
                title: '通知',
                desc: '土壤与农事提醒（即将推出）',
              },
              {
                icon: Security,
                title: '安全',
                desc: 'JWT 登录态存储在本地',
              },
              {
                icon: Settings,
                title: '设置',
                desc: '应用主题、语言、通知',
                onClick: onNavigateAppSettings,
              },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => item.onClick?.()}
                className="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-fixed/20 rounded-xl flex items-center justify-center text-primary">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors w-6 h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => onLogout()}
          className="text-error font-bold flex items-center gap-2 px-8 py-4 rounded-full hover:bg-error-container/20 transition-all active:scale-95"
        >
          <Logout className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </div>
  );
};
