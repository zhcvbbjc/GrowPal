const { StateGraph, END } = require('@langchain/langgraph');
const { Annotation } = require('@langchain/langgraph');

const loadMemory = require('./nodes/loadMemory');
const routeCheck = require('./nodes/routeCheck');
const analyzeImage = require('./nodes/analyzeImage');
const gatherContext = require('./nodes/gatherContext');
const llmChatNode = require('./nodes/llmChat');
const saveMemory = require('./nodes/saveMemory');

// 定义 Agent State
const AgentState = Annotation.Root({
    userId: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    sessionId: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    dbSessionId: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    userMessage: Annotation({ reducer: (a, b) => b ?? a, default: () => '' }),
    userIp: Annotation({ reducer: (a, b) => b ?? a, default: () => '' }),
    images: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
    history: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
    imageDescription: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    locationInfo: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    weatherInfo: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    reply: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    error: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    userMsgId: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
    assistantMsgId: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
});

function buildGraph() {
    const graph = new StateGraph(AgentState);

    // 添加节点
    graph.addNode('loadMemory', loadMemory);
    graph.addNode('analyzeImage', analyzeImage);
    graph.addNode('gatherContext', gatherContext);
    graph.addNode('llmChat', llmChatNode);
    graph.addNode('saveMemory', saveMemory);

    // 设置入口
    graph.setEntryPoint('loadMemory');

    // 条件路由：loadMemory 之后判断是否有图片
    graph.addConditionalEdges('loadMemory', routeCheck, {
        analyzeImage: 'analyzeImage',
        gatherContext: 'gatherContext'
    });

    // analyzeImage → gatherContext
    graph.addEdge('analyzeImage', 'gatherContext');

    // gatherContext → llmChat
    graph.addEdge('gatherContext', 'llmChat');

    // llmChat → saveMemory
    graph.addEdge('llmChat', 'saveMemory');

    // saveMemory → END
    graph.addEdge('saveMemory', END);

    return graph.compile();
}

module.exports = { buildGraph, AgentState };
