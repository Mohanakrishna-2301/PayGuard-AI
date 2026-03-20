import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 text-slate-100 selection:bg-brand-500 selection:text-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute><Admin /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
