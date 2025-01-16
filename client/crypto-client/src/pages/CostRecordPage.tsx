import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import axios from '../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    buyPrice: '',
    currentPrice: '',
    quantity: '',
    purchaseTime: ''
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

      setFormData({
        coin: '',
        buyPrice: '',
        currentPrice: '',
        quantity: '',
        purchaseTime: ''
      });

      fetchCryptos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await axios.delete(`http://localhost:5000/api/cryptos/${id}`);
      fetchCryptos();
    } catch (error) {
      console.error(error);
    }
  };

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

  // 取得東8區的當前時間
  const getCurrentDateInTimezone = () => {
    const currentDate = new Date();
    const currentOffset = currentDate.getTimezoneOffset();
    const offsetInMilliseconds = 8 * 60 * 60 * 1000; // 東8區 offset
    currentDate.setTime(currentDate.getTime() + (offsetInMilliseconds + currentOffset * 60000));
    return currentDate;
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
          <label>購買日期：</label>
          <DatePicker
            selected={purchaseDate}
            onChange={(date) => {
              if (date) {
                setPurchaseDate(date);

                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dateString = `${yyyy}-${mm}-${dd}`;

                setFormData({
                  ...formData,
                  purchaseTime: dateString
                });
              } else {
                setPurchaseDate(null);
                setFormData({ ...formData, purchaseTime: '' });
              }
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="選擇日期"
            maxDate={getCurrentDateInTimezone()}
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
