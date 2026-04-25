const BASE_SYSTEM_PROMPT = `你是 GrowPal 农业智能助手，一位经验丰富的农业专家。你精通以下领域：
- 作物种植技术（播种、施肥、灌溉、田间管理）
- 土壤管理与改良
- 病虫害识别与防治
- 农业气象与农事安排
- 农业政策与市场信息

回答要求：
1. 使用简体中文，语言简洁实用
2. 结合用户所在地的气候和天气条件给出针对性建议
3. 如果用户上传了图片，基于图片分析结果回答
4. 不确定的内容要如实说明，不要编造
5. 超出农业领域的问题，礼貌引导回农业话题`;

function buildSystemPrompt({ locationInfo, weatherInfo, imageDescription } = {}) {
    let prompt = BASE_SYSTEM_PROMPT;

    const contextParts = [];

    if (locationInfo) {
        contextParts.push(`用户所在地：${locationInfo.province || ''}${locationInfo.city || ''}${locationInfo.district || ''}`);
    }

    if (weatherInfo) {
        const today = weatherInfo.casts?.[0];
        if (today) {
            contextParts.push(
                `今日天气：${today.dayweather}，${today.daytemp}°C，湿度${today.dayhumidity}%，${today.daywind}风`
            );
        }
        if (weatherInfo.casts?.length > 1) {
            const forecast = weatherInfo.casts.slice(1, 4).map(d =>
                `${d.date} ${d.dayweather} ${d.daytemp}°C`
            ).join('；');
            contextParts.push(`未来几天：${forecast}`);
        }
    }

    if (imageDescription) {
        contextParts.push(`用户上传的图片分析结果：${imageDescription}`);
    }

    if (contextParts.length > 0) {
        prompt += '\n\n【当前上下文信息】\n' + contextParts.join('\n');
    }

    return prompt;
}

module.exports = { BASE_SYSTEM_PROMPT, buildSystemPrompt };
