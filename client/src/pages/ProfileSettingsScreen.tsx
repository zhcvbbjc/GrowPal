import React, { useEffect, useState } from 'react';
import { ArrowBack, Save, Camera, Loader2 } from './Icons';
import { fetchMe, updateProfile, uploadAvatar, getApiMessage } from '../services/growpalApi';
import { cn } from '../lib/utils';

interface ProfileSettingsScreenProps {
  onBack: () => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const me = await fetchMe();
        if (cancelled) return;
        setUsername(me.nickname);
        setEmail(me.email || '');
        setBio(me.bio || '');
        setAvatar(me.avatar);
        setUserId(me.id);
      } catch (e) {
        if (!cancelled) setErr(getApiMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    setSuccess(null);
    try {
      const result = await updateProfile({
        username,
        email: email || undefined,
        bio: bio || undefined,
      });
      setSuccess(result.message);
      // 更新本地缓存
      localStorage.setItem('growpal_user', JSON.stringify({
        id: result.user.id,
        nickname: result.user.nickname,
        avatar: result.user.avatar,
      }));
    } catch (e) {
      setErr(getApiMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setErr('请选择图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setErr('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    setErr(null);
    setSuccess(null);
    try {
      const result = await uploadAvatar(file);
      setAvatar(result.avatar);
      setSuccess('头像上传成功');
      // 更新本地缓存
      const userStr = localStorage.getItem('growpal_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.avatar = result.avatar;
        localStorage.setItem('growpal_user', JSON.stringify(user));
      }
    } catch (e) {
      setErr(getApiMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc =
    avatar ||
    `https://picsum.photos/seed/${encodeURIComponent(username || 'user')}/400/400`;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-surface-container transition-colors"
          aria-label="返回"
        >
          <ArrowBack className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="text-2xl font-bold font-headline text-on-surface">个人信息设置</h1>
      </div>

      {/* Error/Success Messages */}
      {err && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/30 text-error text-sm">
          {err}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-success-container/30 text-success text-sm">
          {success}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6 border border-outline-variant/10">
        <h2 className="text-lg font-bold text-on-surface mb-4">头像</h2>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
              <img
                src={avatarSrc}
                alt="头像"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                uploading && "opacity-100"
              )}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploading}
            />
          </div>
          <div className="text-sm text-on-surface-variant">
            <p>点击头像上传新图片</p>
            <p className="text-xs mt-1">支持 JPG、PNG、GIF，最大 5MB</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6 border border-outline-variant/10">
        <h2 className="text-lg font-bold text-on-surface mb-4">基本信息</h2>
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:outline-none transition-colors"
              placeholder="请输入用户名"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:outline-none transition-colors"
              placeholder="请输入邮箱"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              个人简介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="介绍一下自己吧..."
            />
            <p className="text-xs text-on-surface-variant mt-1">
              {bio.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
          saving
            ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
            : "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]"
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            保存中...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            保存修改
          </>
        )}
      </button>
    </div>
  );
};
