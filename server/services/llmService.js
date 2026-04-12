/**
 * DeepSeek 兼容 Chat Completions API
 * 基于 OpenAI API 格式，使用 DeepSeek 作为默认提供商
 */
function getConfig() {
    const apiKey = process.env.LLM_API_KEY;
    const base =
        (process.env.LLM_API_BASE || 'https://api.deepseek.com/v1').replace(/\/$/, '') + '/chat/completions';
    const model = process.env.LLM_MODEL || 'deepseek-chat';
    return { apiKey, base, model };
}

/**
 * @param {{ role: string, content: string }[]} messages
 * @returns {Promise<string>}
 */
async function chat(messages) {
    const { apiKey, base, model } = getConfig();
    if (!apiKey) {
        const err = new Error('未配置大模型 API 密钥：请在环境变量中设置 LLM_API_KEY');
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
            temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
            max_tokens: 2000
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

/**
 * 根据用户的第一条消息生成对话标题
 * @param {string} userMessage - 用户的第一条消息
 * @returns {Promise<string>} 生成的标题（最多200字符）
 */
async function generateTitle(userMessage) {
    const { apiKey, base, model } = getConfig();
    if (!apiKey) {
        const err = new Error('未配置大模型 API 密钥：请在环境变量中设置 LLM_API_KEY');
        err.code = 'LLM_NO_KEY';
        throw err;
    }

    const systemPrompt = '你是一个对话标题生成助手。请根据用户的消息内容，生成一个简洁、准确的对话标题。要求：\n1. 标题长度不超过50个字符\n2. 只输出标题本身，不要任何解释\n3. 使用简体中文\n4. 概括用户消息的核心主题';

    const res = await fetch(base, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 100
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
    
    // 清理标题：去除引号、换行符等，限制长度
    let title = String(text).trim().replace(/^["'"'【《]+|["'"'】》]+$/g, '');
    title = title.replace(/\n/g, ' ').slice(0, 200);
    return title || '新对话';
}

module.exports = { chat, getConfig, generateTitle, summarizeArticle, answerQuestion };

/**
 * 为文章生成 AI 总结
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容
 * @returns {Promise<string>} 生成的总结（最多200字符）
 */
async function summarizeArticle(title, content) {
    const { apiKey, base, model } = getConfig();
    if (!apiKey) {
        console.warn('[AI 总结] 未配置 API 密钥，跳过总结');
        return null;
    }

    const systemPrompt = '你是一个文章总结助手。请根据以下文章内容，生成一个简洁、准确的总结。要求：\n1. 总结长度不超过5句话\n2. 只输出总结本身，不要任何解释或标题\n3. 使用简体中文\n4. 概括文章的核心观点和要点';

    const userMessage = title ? `标题：${title}\n\n内容：${content}` : `内容：${content}`;

    try {
        const res = await fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error('[AI 总结] API 请求失败:', data.error?.message || res.statusText);
            return null;
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
            console.error('[AI 总结] 返回格式异常');
            return null;
        }
        
        let summary = String(text).trim().slice(0, 200);
        return summary || null;
    } catch (err) {
        console.error('[AI 总结] 生成失败:', err.message);
        return null;
    }
}

/**
 * 为问题生成 AI 解答
 * @param {string} title - 问题标题
 * @param {string} content - 问题内容
 * @returns {Promise<string>} 生成的解答（最多2000字符）
 */
async function answerQuestion(title, content) {
    const { apiKey, base, model } = getConfig();
    if (!apiKey) {
        console.warn('[AI 解答] 未配置 API 密钥，跳过解答');
        return null;
    }

    const systemPrompt = '你是一个专业的农业问题解答助手。请根据用户提出的农业相关问题，给出简洁、实用的解答。要求：\n1. 解答不超过5句话\n2. 直接给出核心解答，不要冗长解释\n3. 使用简体中文\n4. 包含最关键的1-2个操作建议';

    const userMessage = `问题：${title}\n\n详细描述：${content}`;

    try {
        const res = await fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error('[AI 解答] API 请求失败:', data.error?.message || res.statusText);
            return null;
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
            console.error('[AI 解答] 返回格式异常');
            return null;
        }
        
        let answer = String(text).trim().slice(0, 5000);
        return answer || null;
    } catch (err) {
        console.error('[AI 解答] 生成失败:', err.message);
        return null;
    }
}
