// src/components/PrivateRoute.tsx (或 src/routes/PrivateRoute.tsx)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // 你的 firebase 初始化檔案

interface PrivateRouteProps {
  children: JSX.Element;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  // 簡易寫法：判斷目前是否登入 (auth.currentUser)
  // 若尚未登入，導回 /login
  if (!auth.currentUser) {
    return <Navigate to="/login" replace />;
  }
  // 若已登入，直接呈現子元件
  return children;
}

export default PrivateRoute;
