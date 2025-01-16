import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

function LoginButton() {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google 登入成功:', result.user);
      // 取得 token, etc.
    } catch (error) {
      console.error('Google 登入失敗:', error);
    }
  };

  return <button onClick={handleGoogleSignIn}>使用 Google 登入</button>;
}

export default LoginButton;
