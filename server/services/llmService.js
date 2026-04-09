/**
 * OpenAI 兼容 Chat Completions（支持官方 API、Azure、国内兼容网关等，通过环境变量配置）
 */
function getConfig() {
    const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    const base =
        (process.env.LLM_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions';
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';
    return { apiKey, base, model };
}

/**
 * @param {{ role: string, content: string }[]} messages
 * @returns {Promise<string>}
 */
async function chat(messages) {
    const { apiKey, base, model } = getConfig();
    if (!apiKey) {
        const err = new Error('未配置大模型 API 密钥：请在环境变量中设置 LLM_API_KEY 或 OPENAI_API_KEY');
        err.code = 'LLM_NO_KEY';
        throw err;
    }

    const res = await fetch(base, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: Number(process.env.LLM_TEMPERATURE) || 0.7
        })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data.error?.message || data.message || res.statusText || '大模型请求失败';
        const err = new Error(msg);
        err.code = 'LLM_HTTP';
        err.status = res.status;
        throw err;
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
        const err = new Error('大模型返回格式异常');
        err.code = 'LLM_PARSE';
        throw err;
    }
    return String(text).trim();
}

module.exports = { chat, getConfig };
