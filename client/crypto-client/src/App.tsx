import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Firestore document 介面 (TypeScript寫法，可視需求改jsx)
interface CryptoData {
  id?: string;
  coin: string;
  averageCost: number;
  currentPrice: number;
  quantity: number;
  marketValue: number; 
  profit: number; // (可選，看需求)
}

function App() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [formData, setFormData] = useState({
    coin: '',
    averageCost: '',
    currentPrice: '',
    quantity: ''
  });

  useEffect(() => {
    fetchCryptos();
  }, []);

  const fetchCryptos = async () => {
    try {
      const res = await axios.get<CryptoData[]>('http://localhost:5000/api/cryptos');
      setCryptos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 新增
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // 將字串轉數字
      const averageCostNum = parseFloat(formData.averageCost);
      const currentPriceNum = parseFloat(formData.currentPrice);
      const quantityNum = parseFloat(formData.quantity);

      await axios.post('http://localhost:5000/api/cryptos', {
        coin: formData.coin,
        averageCost: averageCostNum,
        currentPrice: currentPriceNum,
        quantity: quantityNum
      });

      // 清空表單
      setFormData({ coin: '', averageCost: '', currentPrice: '', quantity: '' });
      fetchCryptos();
    } catch (error) {
      console.error(error);
    }
  };

  // 刪除
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await axios.delete(`http://localhost:5000/api/cryptos/${id}`);
      fetchCryptos();
    } catch (error) {
      console.error(error);
    }
  };

  // 修改 (範例: 只修改 currentPrice)
  const handleEdit = async (crypto: CryptoData) => {
    const newCurrentPrice = prompt(`請輸入 ${crypto.coin} 新的價格:`, String(crypto.currentPrice));
    if (!newCurrentPrice) return;

    try {
      await axios.put(`http://localhost:5000/api/cryptos/${crypto.id}`, {
        currentPrice: parseFloat(newCurrentPrice)
      });
      fetchCryptos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ margin: '40px auto', maxWidth: 600 }}>
      <h1>加密貨幣紀錄</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <label>幣種：</label>
          <input
            type="text"
            value={formData.coin}
            onChange={(e) => setFormData({ ...formData, coin: e.target.value })}
          />
        </div>
        <div>
          <label>成本均價：</label>
          <input
            type="number"
            value={formData.averageCost}
            onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })}
          />
        </div>
        <div>
          <label>現在價格：</label>
          <input
            type="number"
            value={formData.currentPrice}
            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
          />
        </div>
        <div>
          <label>購買數量：</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
        </div>
        <button type="submit">新增</button>
      </form>

      <table width="100%" border={1}>
        <thead>
          <tr>
            <th>幣種</th>
            <th>成本均價</th>
            <th>現在價格</th>
            <th>購買數量</th>
            <th>市值</th>
            <th>利潤</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((item) => (
            <tr key={item.id}>
              <td>{item.coin}</td>
              <td>{item.averageCost}</td>
              <td>{item.currentPrice}</td>
              <td>{item.quantity}</td>
              <td>{item.marketValue}</td>
              <td>{item.profit}</td>
              <td>
                <button onClick={() => handleEdit(item)}>修改</button>
                <button onClick={() => handleDelete(item.id)}>刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
