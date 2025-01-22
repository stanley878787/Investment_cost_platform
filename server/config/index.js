// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// 載入 service account
// const serviceAccount = require(path.join(__dirname, 'config', 'serviceAccountKey.json'));
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));


// 初始化 Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());
  
// 載入加密貨幣路由
const cryptoRoutes = require('../routes/cryptoRoutes');

// 統一加上 /api/cryptos 前綴
app.use('/api/cryptos', cryptoRoutes);

// 啟動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
