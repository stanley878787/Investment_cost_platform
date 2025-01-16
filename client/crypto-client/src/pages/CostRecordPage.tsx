import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Firestore document 介面 (TypeScript寫法，可視需求改jsx)
interface CryptoData {
  id: string;
  coin: string;
  averageCost: number;
  currentPrice: number;
  quantity: number;
  marketValue: number;
  profit: number;
  lastPurchaseTime: string;
}

function CostRecordPage() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);

  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    coin: '',
    buyPrice: '',       // 單次購買價格
    currentPrice: '',
    quantity: '',
    purchaseTime: ''     // 字串, 也可用日期
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
      const buyPriceNum = parseFloat(formData.buyPrice);
      const currentPriceNum = parseFloat(formData.currentPrice);
      const quantityNum = parseFloat(formData.quantity);

      await axios.post('http://localhost:5000/api/cryptos', {
        coin: formData.coin,
        buyPrice: buyPriceNum,
        currentPrice: currentPriceNum,
        quantity: quantityNum,
        purchaseTime: formData.purchaseTime
      });

      // 清空
      setFormData({
        coin: '',
        buyPrice: '',
        currentPrice: '',
        quantity: '',
        purchaseTime: ''
      });

      // 重新抓取
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
      <h1>加密貨幣成本紀錄</h1>

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
          <label>購買成本 (單次)：</label>
          <input
            type="number"
            value={formData.buyPrice}
            onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
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
        <div>
          <label>購買時間：</label>
          <DatePicker
            // 當前選擇的日期
            selected={purchaseDate}
            // 使用者選日期時觸發
            onChange={(date) => {
              // date 可能是 null (使用者清空) 或 Date 物件
              if (date) {
                setPurchaseDate(date);

                // 若後端預期字串格式，示範把 Date 轉成 'YYYY-MM-DD HH:mm'
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const hh = String(date.getHours()).padStart(2, '0');
                const min = String(date.getMinutes()).padStart(2, '0');
                const dateString = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

                setFormData({
                  ...formData,
                  purchaseTime: dateString
                });
              } else {
                // 若使用者清空
                setPurchaseDate(null);
                setFormData({ ...formData, purchaseTime: '' });
              }
            }}
            // 顯示日期+時間
            showTimeSelect
            timeIntervals={15} // 時間間隔 15 分鐘
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="選擇日期與時間"
          />
        </div>
        <button type="submit">新增/更新</button>
      </form>

      <table width="100%" border={1}>
        <thead>
          <tr>
            <th>幣種</th>
            <th>成本均價</th>
            <th>現在價格</th>
            <th>持有數量</th>
            <th>市值</th>
            <th>利潤</th>
            <th>最後購買時間</th>
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
              <td>{item.lastPurchaseTime}</td>
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

export default CostRecordPage;
