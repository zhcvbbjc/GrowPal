import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, PottedPlant, Mail, Lock, User, Phone } from './Icons';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = '/api/auth';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const { login } = useAuth();
    const toast = useToast();
    
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);

    const sendCode = async () => {
        if (!phone) {
            toast.error('请先输入手机号');
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            toast.error('请输入正确的手机号');
            return;
        }
        
        setSendingCode(true);
        try {
            await axios.post(`${API_BASE_URL}/send-code`, { phone });
            toast.success('验证码已发送，请查看后端控制台');
        } catch (err: any) {
            toast.error(err.response?.data?.message || '发送验证码失败');
        } finally {
            setSendingCode(false);
        }
    };

    const validateForm = () => {
        if (!username.trim()) {
            toast.error('请输入昵称');
            return false;
        }
        if (!password) {
            toast.error('请输入密码');
            return false;
        }
        if (password.length < 6) {
            toast.error('密码长度不能少于6位');
            return false;
        }
        if (!isLogin) {
            if (!phone) {
                toast.error('请输入手机号');
                return false;
            }
            if (!/^1[3-9]\d{9}$/.test(phone)) {
                toast.error('请输入正确的手机号');
                return false;
            }
            if (!verificationCode) {
                toast.error('请输入验证码');
                return false;
            }
            if (password !== confirmPassword) {
                toast.error('两次密码不一致');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (isLogin) {
                const res = await axios.post(`${API_BASE_URL}/login`, {
                    username: username.trim(),
                    password,
                });
                
                if (res.data.token) {
                    login(res.data.token, res.data.user);
                    toast.success('登录成功！');
                    onLoginSuccess();
                }
            } else {
                const reg = await axios.post(`${API_BASE_URL}/register`, {
                    nickname: username.trim(),
                    username: username.trim(),
                    password,
                    confirmPassword,
                    phone,
                    code: verificationCode,
                    verificationCode,
                });
                
                if (reg.data.token) {
                    login(reg.data.token, reg.data.user);
                    toast.success('注册成功，已自动登录！');
                    onLoginSuccess();
                } else {
                    toast.success('注册成功，请登录！');
                    setIsLogin(true);
                    setPassword('');
                    setConfirmPassword('');
                    setVerificationCode('');
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || '操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant/10">
                    {/* Header */}
                    <div className="signature-gradient p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <PottedPlant className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white font-headline mb-2">
                            {isLogin ? '欢迎回来' : '加入 GrowPal'}
                        </h2>
                        <p className="text-primary-fixed/80 text-sm">
                            {isLogin ? '登录你的农业智能助手' : '开启智慧农业之旅'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-on-surface mb-2">
                                昵称
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-on-surface-variant/40" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="请输入昵称"
                                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-on-surface mb-2">
                                密码
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-on-surface-variant/40" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入密码"
                                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/60 hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Register Fields */}
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2">
                                        手机号
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="w-5 h-5 text-on-surface-variant/40" />
                                        </div>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="请输入手机号"
                                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-24 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={sendCode}
                                            disabled={sendingCode}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sendingCode ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                '获取验证码'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Verification Code */}
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2">
                                        验证码
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-on-surface-variant/40" />
                                        </div>
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="请输入验证码"
                                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2">
                                        确认密码
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-on-surface-variant/40" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="请再次输入密码"
                                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/60 hover:text-primary transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span>{isLogin ? '登录' : '注册'}</span>
                            )}
                        </button>

                        {/* Toggle Mode */}
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-primary font-semibold hover:underline"
                            >
                                {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
