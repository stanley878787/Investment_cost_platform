// routes/cryptoRoutes.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const authMiddleware = require('../middlewares/authMiddleware');
const { fetchCoinPrice } = require('../services/coinPriceService');

const db = admin.firestore();
const CRYPTO_COLLECTION = 'cryptos';

// [POST] 新增幣種
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { coin, buyPrice, quantity, purchaseTime } = req.body;

    // 1. 從 CoinGecko 抓現在價格
    const currentPrice = await fetchCoinPrice(coin);

    // 2. 查詢此使用者是否已有該 coin
    const snapshot = await db.collection(CRYPTO_COLLECTION)
      .where('userId', '==', userId)
      .where('coin', '==', coin)
      .limit(1)
      .get();

    let docRef;
    let oldData = null;

    if (snapshot.empty) {
      // 該使用者尚未持有此 coin
      docRef = db.collection(CRYPTO_COLLECTION).doc();
      oldData = {
        averageCost: 0,
        currentPrice: 0,
        quantity: 0,
        marketValue: 0,
        profit: 0,
        lastPurchaseTime: ''
      };
    } else {
      docRef = snapshot.docs[0].ref;
      oldData = snapshot.docs[0].data();
    }

    const oldQuantity = oldData.quantity || 0;
    const oldAverageCost = oldData.averageCost || 0;
    const newQuantity = oldQuantity + Number(quantity);

    // 加權平均成本
    let newAverageCost;
    if (oldQuantity === 0) {
      newAverageCost = Number(buyPrice);
    } else {
      newAverageCost =
        ((oldAverageCost * oldQuantity) + (Number(buyPrice) * Number(quantity))) / newQuantity;
    }

    const newMarketValue = currentPrice * newQuantity;
    const newProfit = (currentPrice - newAverageCost) * newQuantity;

    // 四捨五入到四位小數
    function roundToFour(num) {
      return Math.round(num * 10000) / 10000;
    }

    const updateData = {
      userId,
      coin,
      averageCost: roundToFour(newAverageCost),
      currentPrice,
      quantity: newQuantity,
      marketValue: roundToFour(newMarketValue),
      profit: roundToFour(newProfit),
      lastPurchaseTime: purchaseTime || new Date().toISOString()
    };

    await docRef.set(updateData);

    return res.status(200).json({ id: docRef.id, ...updateData });
  } catch (error) {
    console.error('POST /api/cryptos error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// [PUT] 更新使用者所有幣種的現在價格
router.put('/refresh', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection(CRYPTO_COLLECTION)
      .where('userId', '==', userId)
      .get();

    if (snapshot.empty) {
      return res.json({ message: 'No cryptos found for this user' });
    }

    const batch = db.batch();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const currentPrice = await fetchCoinPrice(data.coin);
      const newMarketValue = currentPrice * data.quantity;
      const newProfit = (currentPrice - data.averageCost) * data.quantity;

      batch.update(doc.ref, {
        currentPrice,
        marketValue: newMarketValue,
        profit: newProfit
      });
    }
    await batch.commit();

    return res.json({ message: 'All coins updated successfully' });
  } catch (error) {
    console.error('PUT /api/cryptos/refresh error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// [GET] 讀取使用者所有幣種
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection(CRYPTO_COLLECTION)
      .where('userId', '==', userId)
      .get();

    const cryptos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(cryptos);
  } catch (error) {
    console.error('GET /api/cryptos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// [PUT] 修改特定幣種 (可依需求擴充)
router.put('/:id', authMiddleware, async (req, res) => {
  // ...
});

// [DELETE] 刪除特定幣種
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid; // 從 authMiddleware 取得使用者 ID
    const { id } = req.params;   // 前端帶來的文件ID

     // 取得文件參照
     const docRef = db.collection(CRYPTO_COLLECTION).doc(id);
     const docSnap = await docRef.get();
     if (!docSnap.exists) {
       // 找不到該文件 => 404
       return res.status(404).json({ error: 'Document not found' });
     }

     // 檢查 document.userId 是否與當前使用者相符
    const data = docSnap.data();
    if (data.userId !== userId) {
      // 不允許刪除他人紀錄 => 403
      return res.status(403).json({ error: 'Permission denied' });
    }

    // 若文件存在且 userId 符合 => 刪除
    await docRef.delete();

    return res.status(204).end();
  } catch (error) {
    console.error('DELETE /api/cryptos/:id error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
