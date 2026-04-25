const pool = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodeCache = require('node-cache');

const cache = new nodeCache({ stdTTL: 300 });

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET 未配置');
    return jwt.sign(
        { id: user.user_id, nickname: user.username },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

exports.sendCode = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: '请输入手机号' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    cache.set(phone, code);

    console.log(`📱 [模拟短信] 手机号 ${phone} 的验证码是: ${code}`);

    res.json({ message: '验证码已发送（请查看后端控制台）' });
};

exports.register = async (req, res) => {
    const nickname = req.body.nickname || req.body.username;
    const password = req.body.password;
    const phone = req.body.phone;
    const code = req.body.code || req.body.verificationCode;

    if (!nickname || !password) {
        return res.status(400).json({ message: '请填写昵称和密码' });
    }

    try {
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [
            nickname,
            phone
        ]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: '用户名或手机号已被注册' });
        }

        if (phone && code) {
            const savedCode = cache.get(phone);
            if (!savedCode || savedCode !== code) {
                return res.status(400).json({ message: '验证码错误或已过期' });
            }
            cache.del(phone);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, phone) VALUES (?, ?, ?, ?)',
            [nickname, phone, hashedPassword, phone]
        );

        const token = signToken({
            user_id: result.insertId,
            username: nickname
        });

        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: result.insertId,
                nickname,
                avatar: null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};

exports.login = async (req, res) => {
    const account = req.body.account || req.body.username;
    const { password } = req.body;

    if (!account || !password) {
        return res.status(400).json({ message: '请填写账号和密码' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [
            account,
            account
        ]);

        if (users.length === 0) {
            return res.status(400).json({ message: '用户不存在' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }

        const token = signToken(user);

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.user_id,
                nickname: user.username,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};

/** 校验 Token 并返回当前用户（需 Authorization） */
exports.me = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT user_id, username, avatar, phone, email, bio, role FROM users WHERE user_id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        const u = rows[0];
        res.json({
            id: u.user_id,
            nickname: u.username,
            avatar: u.avatar,
            phone: u.phone,
            email: u.email,
            bio: u.bio,
            role: u.role
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '服务器错误' });
    }
};

/** 更新当前用户信息（需 Authorization） */
exports.updateProfile = async (req, res) => {
    try {
        const { username, email, bio } = req.body;
        const userId = req.user.id;

        // 构建更新字段
        const updates = [];
        const values = [];

        if (username !== undefined) {
            updates.push('username = ?');
            values.push(username);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: '没有需要更新的字段' });
        }

        // 检查用户名是否已被其他用户使用
        if (username !== undefined) {
            const [existing] = await pool.query(
                'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
                [username, userId]
            );
            if (existing.length > 0) {
                return res.status(400).json({ message: '用户名已被占用' });
            }
        }

        // 检查邮箱是否已被其他用户使用
        if (email !== undefined) {
            const [existing] = await pool.query(
                'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
                [email, userId]
            );
            if (existing.length > 0) {
                return res.status(400).json({ message: '邮箱已被占用' });
            }
        }

        values.push(userId);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
        await pool.query(sql, values);

        // 返回更新后的用户信息
        const [rows] = await pool.query(
            'SELECT user_id, username, avatar, phone, email, bio, role FROM users WHERE user_id = ?',
            [userId]
        );
        const u = rows[0];
        res.json({
            message: '更新成功',
            user: {
                id: u.user_id,
                nickname: u.username,
                avatar: u.avatar,
                phone: u.phone,
                email: u.email,
                bio: u.bio,
                role: u.role
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '服务器错误' });
    }
};

/** 更新用户头像（需 Authorization） */
exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的头像' });
        }

        const userId = req.user.id;
        const avatarPath = `/uploads/user_image/${req.file.filename}`;

        await pool.query('UPDATE users SET avatar = ? WHERE user_id = ?', [avatarPath, userId]);

        res.json({
            message: '头像上传成功',
            avatar: avatarPath
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '服务器错误' });
    }
};
