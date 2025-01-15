require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// 載入 Service Account Key (Firebase Admin)
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 取得 Firestore
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Collection 名稱
const CRYPTO_COLLECTION = 'cryptos';

/**
 * [C] 新增幣種資料
 * POST /api/cryptos
 * body: { coin, costPrice, currentPrice }
 */
app.post('/api/cryptos', async (req, res) => {
  try {
    const { coin, averageCost, currentPrice, quantity } = req.body;

    // 計算市值與利潤
    const marketValue = currentPrice * quantity;
    const profit = (currentPrice - averageCost) * quantity;

    // 新增資料到 Firestore
    const docRef = await db.collection(CRYPTO_COLLECTION).add({
      coin,
      averageCost,
      currentPrice,
      quantity,
      marketValue,
      profit
    });

    res.status(201).json({
      id: docRef.id,
      coin,
      averageCost,
      currentPrice,
      quantity,
      marketValue,
      profit  
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Firestore error:', error);
    console.log("8787")
  }
});


/**
 * [R] 讀取所有幣種
 * GET /api/cryptos
 */
app.get('/api/cryptos', async (req, res) => {
  try {
    const snapshot = await db.collection(CRYPTO_COLLECTION).get();
    const cryptos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(cryptos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * [U] 修改指定幣種資料 (更新價格或其他欄位)
 * PUT /api/cryptos/:id
 * body: { currentPrice, costPrice }
 */
app.put('/api/cryptos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { averageCost, currentPrice, quantity } = req.body;

    // 先抓舊的資料
    const docRef = db.collection(CRYPTO_COLLECTION).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const oldData = docSnap.data();

    // 以舊值為基礎，若 body 未提供就用舊的
    const newAverageCost = (averageCost !== undefined) ? averageCost : oldData.averageCost;
    const newCurrentPrice = (currentPrice !== undefined) ? currentPrice : oldData.currentPrice;
    const newQuantity = (quantity !== undefined) ? quantity : oldData.quantity;

    // 重新計算市值與利潤
    const newMarketValue = newCurrentPrice * newQuantity;
    const newProfit = (newCurrentPrice - newAverageCost) * newQuantity;

    const updateData = {
      averageCost: newAverageCost,
      currentPrice: newCurrentPrice,
      quantity: newQuantity,
      marketValue: newMarketValue,
      profit: newProfit
    };

    // 更新
    await docRef.update(updateData);

    res.json({
      id,
      ...updateData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * [D] 刪除指定幣種
 * DELETE /api/cryptos/:id
 */
app.delete('/api/cryptos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(CRYPTO_COLLECTION).doc(id).delete();
    res.json({ message: 'Deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 啟動後端
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
