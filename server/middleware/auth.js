const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: '访问被拒绝，缺少 Token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET 未配置');
        return res.status(500).json({ message: '服务器配置错误' });
    }

    jwt.verify(token, secret, (err, payload) => {
        if (err) {
            return res.status(403).json({ message: 'Token 无效或已过期' });
        }
        req.user = { id: payload.id, nickname: payload.nickname };
        next();
    });
};
