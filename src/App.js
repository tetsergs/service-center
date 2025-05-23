import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ReceptionPage from './pages/ReceptionPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import WarrantyPage from './pages/WarrantyPage';

function App() {
  return (
    <Router>
      <div className="container mt-3">
        <nav className="mb-4">
<NavLink className="btn me-2" to="/" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Приём оборудования</NavLink>
<NavLink className="btn me-2" to="/orders" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Список заявок</NavLink>
<NavLink className="btn" to="/reports" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Отчеты</NavLink>
<NavLink className="btn" to="/warranty" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Гарантия</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<ReceptionPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
