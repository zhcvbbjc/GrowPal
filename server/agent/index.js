const { buildGraph } = require('./graph');

const app = buildGraph();

/**
 * 运行农业智能体
 * @param {{ userId: number, sessionId?: string, userMessage: string, userIp?: string, images?: Array }} input
 * @returns {Promise<object>} 智能体运行结果
 */
async function runAgent(input) {
    const result = await app.invoke({
        userId: input.userId,
        sessionId: input.sessionId || null,
        userMessage: input.userMessage,
        userIp: input.userIp || '',
        images: input.images || []
    });

    return result;
}

module.exports = { runAgent, app };
