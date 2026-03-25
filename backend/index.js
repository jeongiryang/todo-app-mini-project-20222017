// backend/index.js
if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// [1] MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// [2] 데이터 스키마
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  type: { type: String, required: true, enum: ['todo', 'market', 'lost'] },
  studentId: String, sellerName: String, phone: String, location: String, description: String,
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

// 학식 메뉴 크롤링
app.get('/api/food', async (req, res) => {
  try {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date().getDay();
    const todayName = dayNames[today];

    if (today === 0 || today === 6) {
      return res.json([{ place: "주말", menu: "오늘은 주말입니다. 편의점 털러 가시죠! 🍙" }]);
    }

    const scrapeCampus = async (url, campusPrefix) => {
      try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const foodData = [];

        $('table').each((_, table) => {
          const tableMap = [];
          const rows = $(table).find('tr');

          rows.each((rIdx, tr) => {
            if (!tableMap[rIdx]) tableMap[rIdx] = [];
            let cIdx = 0;
            $(tr).find('th, td').each((_, cell) => {
              while (tableMap[rIdx][cIdx]) { cIdx++; }
              const rowSpan = parseInt($(cell).attr('rowspan')) || 1;
              const colSpan = parseInt($(cell).attr('colspan')) || 1;

              let cellHtml = $(cell).html() || '';
              let textContent = cellHtml
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>|<\/div>|<\/li>/gi, '\n')
                .replace(/<[^>]*>?/gm, '')
                .replace(/&nbsp;/gi, ' ')
                .split('\n').map(l => l.trim()).filter(l => l).join('\n');

              for (let i = 0; i < rowSpan; i++) {
                for (let j = 0; j < colSpan; j++) {
                  if (!tableMap[rIdx + i]) tableMap[rIdx + i] = [];
                  tableMap[rIdx + i][cIdx + j] = textContent;
                }
              }
              cIdx += colSpan;
            });
          });

          let targetCol = -1;
          for (let r = 0; r < Math.min(tableMap.length, 3); r++) {
            for (let c = 0; c < tableMap[r].length; c++) {
              if (tableMap[r][c] && tableMap[r][c].includes(todayName)) {
                targetCol = c; break;
              }
            }
            if (targetCol !== -1) break;
          }
          if (targetCol === -1) targetCol = today;

          if (targetCol !== -1) {
            tableMap.forEach(row => {
              const menuRaw = row[targetCol];
              let placeName = row[0] || '';
              if (row[1] && row[1].length < 20 && (row[1].includes('식') || placeName.includes('식당'))) {
                placeName = `${row[0]} - ${row[1]}`;
              }
              placeName = placeName.replace(/\([^)]*\)/g, '').replace(/\n/g, ' ').trim();
              const finalPlace = `${campusPrefix} ${placeName}`;

              if (menuRaw && menuRaw.length > 5 && !menuRaw.includes(todayName)) {
                const cleanMenuLines = menuRaw.split('\n')
                  .map(line => line.replace(/\(\d+(\.\d+)*\)/g, '').trim())
                  .filter(line => line.length > 0 && !line.includes('알레르기') && !line.includes('원산지') && !line.includes('식단이 없습니다'));
                
                const finalMenu = cleanMenuLines.join('\n');
                if (finalMenu.length > 2) {
                  foodData.push({ place: finalPlace, menu: finalMenu });
                }
              }
            });
          }
        });
        return foodData;
      } catch (e) { return []; }
    };

    // 💡 일단 통학버스(002.do)는 빼고, 봉림관(001.do)만 긁어옵니다.
    const allFood = await scrapeCampus('https://app.changwon.ac.kr/campus/campus_001.do', '봉림관');

    const unique = allFood.filter((v, i, a) => a.findIndex(t => t.menu === v.menu && t.place === v.place) === i);
    res.json(unique.length > 0 ? unique : [{ place: "안내", menu: "오늘의 식단 정보가 없습니다." }]);

  } catch (error) {
    res.status(500).json({ error: "서버 에러" });
  }
});

// [4] 나머지 API들
app.get('/api/market', async (req, res) => res.json(await Item.find({ type: 'market' })));
app.get('/api/todo', async (req, res) => res.json(await Item.find({ type: 'todo' })));
app.get('/api/lost', async (req, res) => res.json(await Item.find({ type: 'lost' })));
app.post('/api/market', async (req, res) => { const newItem = new Item({ ...req.body, type: 'market' }); await newItem.save(); res.json(newItem); });
app.post('/api/todo', async (req, res) => { const newItem = new Item({ ...req.body, type: 'todo' }); await newItem.save(); res.json(newItem); });
app.post('/api/lost', async (req, res) => { const newItem = new Item({ ...req.body, type: 'lost' }); await newItem.save(); res.json(newItem); });
app.patch('/api/items/:id/like', async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, { $inc: { likes: req.body.value || 1 } }, { returnDocument: 'after' })));
app.put('/api/items/:id', async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })));
app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제 완료' }); });
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKeys = (process.env.GEMINI_API_KEY || "").split(',').map(k => k.trim());
    const genAI = new GoogleGenerativeAI(apiKeys[0]);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (error) { res.status(500).json({ error: "AI 에러" }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));