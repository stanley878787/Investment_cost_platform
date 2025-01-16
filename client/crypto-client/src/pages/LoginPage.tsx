// src/pages/LoginPage.tsx
import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Google 登入成功
      console.log('User:', result.user);

      // 登入成功後導向到成本紀錄頁
      navigate('/cost');
    } catch (error) {
      console.error('Google 登入失敗:', error);
    }
  };

  return (
    <div style={{ margin: '50px auto', textAlign: 'center' }}>
      <h1>登入頁面</h1>
      <button onClick={handleGoogleSignIn}>使用 Google 登入</button>
    </div>
  );
}

export default LoginPage;
