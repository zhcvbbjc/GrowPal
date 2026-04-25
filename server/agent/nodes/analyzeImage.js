const { encodeImage } = require('../image/process');

/**
 * 调用 Qwen2.5-VL 分析图片，返回描述文本
 */
async function analyzeImage(state) {
    const { images } = state;
    const descriptions = [];

    const apiKey = process.env.QWEN_API_KEY;
    const baseUrl = (process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
    const model = process.env.QWEN_VL_MODEL || 'qwen2.5-vl-72b-instruct';

    if (!apiKey) {
        console.warn('[节点:analyzeImage] 未配置 QWEN_API_KEY，跳过图片分析');
        return { ...state, imageDescription: null };
    }

    for (const img of images) {
        try {
            const result = encodeImage(img.filePath);
            if (!result) continue;

            const content = [
                { type: 'text', text: '请详细描述这张农业相关图片的内容，包括作物类型、生长状态、是否有病虫害迹象、土壤状况等。如果图片与农业无关，请如实说明。' },
                { type: 'image_url', image_url: { url: `data:${result.mimeType};base64,${result.base64}` } }
            ];

            const res = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content }],
                    max_tokens: 1000
                })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('[节点:analyzeImage] Qwen VL 请求失败:', data.error?.message || res.statusText);
                continue;
            }

            const text = data.choices?.[0]?.message?.content;
            if (text) {
                descriptions.push(text.trim());
            }
        } catch (err) {
            console.error('[节点:analyzeImage] 图片分析异常:', err.message);
        }
    }

    const imageDescription = descriptions.length > 0 ? descriptions.join('\n') : null;
    return { ...state, imageDescription };
}

module.exports = analyzeImage;
