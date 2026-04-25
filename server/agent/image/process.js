const fs = require('fs');
const path = require('path');

const MAX_SIZE = 4 * 1024 * 1024; // base64 编码后不超过 4MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * 将图片文件转为 base64 data URL
 * @param {string} filePath - 图片绝对路径
 * @returns {{ base64: string, mimeType: string } | null}
 */
function encodeImage(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error('[图片] 文件不存在:', filePath);
        return null;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    const mimeType = mimeMap[ext];
    if (!mimeType) {
        console.error('[图片] 不支持的格式:', ext);
        return null;
    }

    const buffer = fs.readFileSync(filePath);
    if (buffer.length > MAX_SIZE) {
        console.error('[图片] 文件过大:', buffer.length, 'bytes');
        return null;
    }

    const base64 = buffer.toString('base64');
    return { base64, mimeType };
}

module.exports = { encodeImage, SUPPORTED_TYPES };
