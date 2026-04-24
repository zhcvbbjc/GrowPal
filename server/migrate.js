const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('📦 开始运行数据库迁移...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations/add_user_profile_fields.sql'),
            'utf8'
        );

        // 分割 SQL 语句并逐个执行
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            try {
                await connection.query(statement);
                console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
            } catch (err) {
                // 忽略已存在的字段/索引错误
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEY') {
                    console.log(`⚠️  字段或索引已存在，跳过: ${statement.substring(0, 50)}...`);
                } else {
                    throw err;
                }
            }
        }

        console.log('✅ 数据库迁移完成！');
    } catch (error) {
        console.error('❌ 数据库迁移失败:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigration();
