const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 根路径路由 - 服务主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 读取视频数据
app.get('/api/videos', (req, res) => {
    try {
        const videosPath = path.join(__dirname, 'videos.js');
        const videosContent = fs.readFileSync(videosPath, 'utf8');

        // 提取 videosData 对象
        const match = videosContent.match(/const videosData = ({[\s\S]*?});/);
        if (match) {
            const videosData = eval('(' + match[1] + ')');
            res.json(videosData);
        } else {
            res.status(500).json({ error: '无法解析视频数据' });
        }
    } catch (error) {
        res.status(500).json({ error: '读取视频数据失败' });
    }
});

// 保存视频数据
app.post('/api/videos', (req, res) => {
    try {
        const videosData = req.body;

        // 生成新的 videos.js 内容
        const jsContent = `// 视频数据文件
// 🔥 添加新视频：直接在数组开头添加新对象即可（最新的视频会显示在网站最前面）
// 💡 不用担心ID顺序，只要保证每个视频的ID是唯一的就行

const videosData = ${JSON.stringify(videosData, null, 4)};`;

        // 写入文件
        const videosPath = path.join(__dirname, 'videos.js');
        fs.writeFileSync(videosPath, jsContent, 'utf8');

        res.json({ success: true, message: '视频数据保存成功' });
    } catch (error) {
        res.status(500).json({ error: '保存视频数据失败', details: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('后台管理地址: http://localhost:3000/admin.html');
});