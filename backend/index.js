if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공 (2단계 진행중)'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  price: { type: Number, default: 0 }, // 💰 가격 추가됨!
  deadline: { type: String, default: "" }, 
  importance: { type: String, default: "보통" }, // 한글로 변경
  type: { type: String, required: true, enum: ['todo', 'market'] }
});
const Item = mongoose.model('Item', itemSchema);

app.get('/api/market', async (req, res) => { res.json(await Item.find({ type: 'market' })); });
app.get('/api/todo', async (req, res) => { res.json(await Item.find({ type: 'todo' })); });

app.post('/api/market', async (req, res) => {
  try { const newItem = new Item({ ...req.body, type: 'market' }); await newItem.save(); res.json(newItem); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
app.post('/api/todo', async (req, res) => {
  try { const newItem = new Item({ ...req.body, type: 'todo' }); await newItem.save(); res.json(newItem); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

app.put('/api/items/:id', async (req, res) => {
  try { const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(item); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({ message: '삭제' }); });

if (process.env.NODE_ENV !== 'production') { app.listen(5000, () => console.log(`🚀 서버 실행 중`)); }
module.exports = app;