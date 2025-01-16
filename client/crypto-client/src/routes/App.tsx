import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import CostRecordPage from '../pages/CostRecordPage';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/cost"
          element={
            <PrivateRoute>
              <CostRecordPage />
            </PrivateRoute>
          } 
        />
        {/* 根路徑預設到登入頁 */}
        <Route path="/" element={<LoginPage />} />
        {/* 可選：處理 404 */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
