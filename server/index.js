require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const authMiddleware = require('./authMiddleware');

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
 * [Upsert] 新增或更新幣種
 * POST /api/cryptos
 * body: { coin, buyPrice, currentPrice, quantity, purchaseTime }
 *
 * - coin: 幣種名稱 (ex: "BTC")
 * - buyPrice: 本次購買的「單次買入價格」
 * - currentPrice: 當前幣價
 * - quantity: 本次購買的數量
 * - purchaseTime: 購買時間 (字串或日期)
 */
app.post('/api/cryptos', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;  // 從驗證中取得使用者UID
    const { coin, buyPrice, currentPrice, quantity, purchaseTime } = req.body;

    // 先查詢該 coin 是否已存在
    const snapshot = await db
      .collection(CRYPTO_COLLECTION)
      .where('coin', '==', coin)
      .limit(1)
      .get();

    let docRef;
    let oldData = null;

    if (snapshot.empty) {
      // [情況1] 沒有此幣種 → 建立新 document
      docRef = db.collection(CRYPTO_COLLECTION).doc(); // 自動產生ID
      oldData = {
        coin,
        averageCost: 0,
        currentPrice: 0,
        quantity: 0,
        marketValue: 0,
        profit: 0,
        lastPurchaseTime: ''
      };
    } else {
      // [情況2] 已存在 → 取第一筆 document
      docRef = snapshot.docs[0].ref;
      oldData = snapshot.docs[0].data();
    }

    const oldQuantity = oldData.quantity || 0;
    const oldAverageCost = oldData.averageCost || 0;

    // 新的總數量 = 舊數量 + 這次買入的數量
    const newQuantity = oldQuantity + quantity;

    // 如果是第一次買 (新建)
    // oldQuantity 可能是 0，此時 averageCost = buyPrice
    // 如果不是第一次，則做加權平均
    let newAverageCost = 0;
    if (oldQuantity === 0) {
      newAverageCost = buyPrice;
    } else {
      newAverageCost =
        (oldAverageCost * oldQuantity + buyPrice * quantity) / newQuantity;
    }

    // marketValue & profit
    const newMarketValue = currentPrice * newQuantity;
    const newProfit = (currentPrice - newAverageCost) * newQuantity;

    const updateData = {
      userId,
      coin,
      averageCost: newAverageCost,
      currentPrice,
      quantity: newQuantity,
      marketValue: newMarketValue,
      profit: newProfit,
      lastPurchaseTime: purchaseTime
    };

    // 寫入 Firestore (若是新 doc 就 create，若已有 doc 就 update)
    await docRef.set(updateData);

    res.status(200).json({ id: docRef.id, ...updateData });
  } catch (error) {
    console.error('upsert error:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * [R] 讀取所有幣種
 * GET /api/cryptos
 */
app.get('/api/cryptos', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db
      .collection(CRYPTO_COLLECTION)
      .where('userId', '==', userId)
      .get();

    const cryptos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(cryptos);
  } catch (error) {
    console.error('Fetch error:', error);
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
