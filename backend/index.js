// backend/index.js
if (process.env.NODE_ENV !== 'production') { 
  require('dotenv').config(); 
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// ✅ 데이터 스키마 정의
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  deadline: { type: String, default: "" },      
  todoDeadline: { type: String, default: "" },  
  importance: { type: String, default: "보통" },
  type: { type: String, required: true, enum: ['todo', 'market', 'lost'] },
  studentId: { type: String, default: "" },
  sellerName: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

// ✅ 기본 CRUD 라우터
app.get('/api/market', async (req, res) => { res.json(await Item.find({ type: 'market' })); });
app.get('/api/todo', async (req, res) => { res.json(await Item.find({ type: 'todo' })); });

app.post('/api/market', async (req, res) => { 
  const newItem = new Item({ ...req.body, type: 'market' }); 
  await newItem.save(); 
  res.json(newItem); 
});

app.post('/api/todo', async (req, res) => { 
  const newItem = new Item({ ...req.body, type: 'todo' }); 
  await newItem.save(); 
  res.json(newItem); 
});
// 👇 새로 추가할 코드
app.get('/api/lost', async (req, res) => { res.json(await Item.find({ type: 'lost' })); });
app.post('/api/lost', async (req, res) => { 
  const newItem = new Item({ ...req.body, type: 'lost' }); 
  await newItem.save(); 
  res.json(newItem); 
});

app.patch('/api/items/:id/like', async (req, res) => { 
  const val = req.body.value || 1;
  const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { likes: val } }, { returnDocument: 'after' }); 
  res.json(item); 
});

app.put('/api/items/:id', async (req, res) => { 
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
  res.json(item); 
});

app.delete('/api/items/:id', async (req, res) => { 
  await Item.findByIdAndDelete(req.params.id); 
  res.json({ message: '삭제 완료' }); 
});

// ✅ AI 라우터: 다중 API 키(Load Balancing) 및 최신 모델 자동 선택
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "프롬프트가 없습니다." });

    // 💡 다중 키 로드 밸런싱 로직 (쉼표로 구분된 키 중 랜덤 선택)
    const apiKeysString = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKeysString) throw new Error("API 키가 설정되지 않았습니다.");
    
    const apiKeys = apiKeysString.split(',').map(k => k.trim()).filter(k => k);
    const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    
    console.log(`🔑 [다중 키 시스템] 총 ${apiKeys.length}개의 키 중 하나를 랜덤으로 선택했습니다.`);

    // 1. 선택된 키로 사용 가능한 모델 리스트 확인
    const modelRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${selectedApiKey}`);
    const modelData = await modelRes.json();
    if (!modelRes.ok) throw new Error(`API 인증 실패: ${modelData.error?.message}`);

    // 2. 가장 적합한 Flash 모델 자동 선택
    const availableModels = modelData.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    const flashModels = availableModels.filter(m => m.name.includes("flash") && !m.name.includes("pro"));
    const safeModel = flashModels.find(m => m.name.includes("gemini-3")) || 
                      flashModels.find(m => m.name.includes("gemini-1.5")) || 
                      flashModels[0] || availableModels[0];
    
    const targetModelName = safeModel.name.replace('models/', '');
    console.log(`🤖 [AI 연동] ${targetModelName} 모델로 생성 중...`);

    // 3. AI 답변 생성
    const genAI = new GoogleGenerativeAI(selectedApiKey);
    const model = genAI.getGenerativeModel({ model: targetModelName });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 4096,  // 💡 1024 -> 4096으로 대폭 상향! (숨통 트기)
        temperature: 0.4,       // 💡 JSON 형식을 더 엄격하게 지키도록 살짝 낮춤
      }
    });
    
    res.json({ text: result.response.text() });

  } catch (error) {
    console.error("🚨 AI 생성 에러:", error.message);
    const status = error.message.includes('429') ? 429 : 500;
    res.status(status).json({ error: "AI 서비스 일시 중단", details: error.message });
  }
});

// ✅ 서버 실행
if (process.env.NODE_ENV !== 'production') { 
  app.listen(5000, () => console.log(`🚀 로컬 서버 실행 중 (Port 5000)`)); 
}
module.exports = app;