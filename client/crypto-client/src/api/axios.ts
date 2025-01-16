// src/api/axios.ts
import axios from 'axios';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 創建一個 Axios 實例
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // 你的後端 API 基本 URL
});

// 添加請求攔截器
instance.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
