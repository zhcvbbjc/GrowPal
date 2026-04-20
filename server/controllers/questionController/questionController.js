const Question = require('../../models/Question');
const { answerQuestion } = require('../../services/llmService');
const fs = require('fs');
const path = require('path');

const serverRoot = path.join(__dirname, '../..');

function uploadsPhysical(imagePath) {
    if (!imagePath) return null;
    const rel = imagePath.replace(/^\//, '');
    return path.join(serverRoot, rel);
}

exports.createQuestion = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        if (!title || !String(title).trim()) {
            return res.status(400).json({ message: '请填写标题' });
        }
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: '请填写内容' });
        }
        const user_id = req.user.id;
        const image_path = req.file ? `/uploads/${req.file.filename}` : null;

        const questionId = await Question.create({ user_id, title, content, tags, image_path });
        
        // 异步生成 AI 解答，不阻塞响应
        (async () => {
            try {
                console.log(`[AI 解答] 开始为问题 ${questionId} 生成解答...`);
                const answer = await answerQuestion(title, content);
                if (answer) {
                    await Question.updateAiAnswer(questionId, answer);
                    console.log(`[AI 解答] 问题 ${questionId} 解答生成成功: "${answer.slice(0, 50)}..."`);
                } else {
                    console.log(`[AI 解答] 问题 ${questionId} 解答生成为空，跳过更新`);
                }
            } catch (err) {
                console.error(`[AI 解答] 问题 ${questionId} 解答生成失败:`, err.message);
            }
        })();
        
        res.status(201).json({ message: '提问成功', questionId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '提问失败', error: err.message });
    }
};

exports.getAllQuestions = async (req, res) => {
    try {
        const results = await Question.findAll();
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败', error: err.message });
    }
};

exports.getQuestionById = async (req, res) => {
    try {
        const questionId = req.params.id;
        const results = await Question.findById(questionId);
        if (results.length === 0) {
            return res.status(404).json({ message: '问题不存在' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误', error: err.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const qId = req.params.id;
        const currentUserId = req.user.id;

        const results = await Question.findById(qId);
        if (results.length === 0) return res.status(404).json({ message: '问题不存在' });

        const question = results[0];
        if (question.user_id !== currentUserId) {
            return res.status(403).json({ message: '权限不足，只能删除自己的问题' });
        }

        await Question.delete(qId);

        const fp = uploadsPhysical(question.image_path);
        if (fp) {
            fs.unlink(fp, (e) => {
                if (e) console.error('图片删除失败:', e);
            });
        }

        res.status(200).json({ message: '问题已删除' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除失败', error: err.message });
    }
};


exports.getUserQuestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await Question.findByUserId(userId);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败失败', error: err.message });
    }
};
