// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// 載入 serviceAccountKey
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 取得 Firestore 參照
const db = admin.firestore();

// 建立 Express 應用
const app = express();

// 中介層
app.use(cors());
app.use(express.json());

// === 建議將 CRUD 分離到 controllers ===
// 這裡簡單示範直接在 index.js 寫

// [C] 新增
app.post('/api/cryptos', async (req, res) => {
  try {
    // Firestore 預設存放位置 --> collection("cryptos")
    const docRef = await db.collection('cryptos').add(req.body);
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [R] 讀取所有
app.get('/api/cryptos', async (req, res) => {
  try {
    const snapshot = await db.collection('cryptos').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [U] 修改
app.put('/api/cryptos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('cryptos').doc(id).update(req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [D] 刪除
app.delete('/api/cryptos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('cryptos').doc(id).delete();
    res.json({ message: 'Deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 啟動 Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
