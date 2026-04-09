/**
 * 验证所有模块能否正常加载
 */
const path = require('path');

const modules = [
    { name: 'Database Config', path: './config/database' },
    { name: 'Auth Middleware', path: './middleware/auth' },
    { name: 'LLM Service', path: './services/llmService' },
    { name: 'User Model', path: './models/User' },
    { name: 'Post Model', path: './models/Post' },
    { name: 'Question Model', path: './models/Question' },
    { name: 'Comment Model', path: './models/Comment' },
    { name: 'Like Model', path: './models/Like' },
    { name: 'AiChat Model', path: './models/AiChat' },
    { name: 'UserChat Model', path: './models/UserChat' },
    { name: 'Auth Controller', path: './controllers/authController/authController' },
    { name: 'Post Controller', path: './controllers/postController/postController' },
    { name: 'Question Controller', path: './controllers/questionController/questionController' },
    { name: 'AiChat Controller', path: './controllers/aiChatController/aiChatController' },
    { name: 'UserChat Controller', path: './controllers/userChatController/userChatController' },
    { name: 'Auth Routes', path: './routes/auth' },
    { name: 'Posts Routes', path: './routes/posts' },
    { name: 'Question Routes', path: './routes/question' },
    { name: 'AiChat Routes', path: './routes/aichat' },
    { name: 'UserChat Routes', path: './routes/userchat' }
];

console.log('开始验证模块加载...\n');

let success = 0;
let failed = 0;

for (const mod of modules) {
    try {
        require(mod.path);
        console.log(`✅ ${mod.name}`);
        success++;
    } catch (err) {
        console.error(`❌ ${mod.name}: ${err.message}`);
        failed++;
    }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`总计: ${modules.length} 个模块`);
console.log(`成功: ${success}`);
console.log(`失败: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\n✨ 所有模块加载成功！');
    process.exit(0);
}
