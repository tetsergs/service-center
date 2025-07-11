import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ReceptionPage from './pages/ReceptionPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import WarrantyPage from './pages/WarrantyPage';
import DefectRepairPage from './pages/DefectRepairPage';
import EditPrices from './pages/EditPrices';
import WriteOffPage from './pages/WriteOffPage'

function App() {
  return (
    <Router>
      <div className="container mt-3">
        <nav className="mb-4">
          <NavLink className="btn me-2" to="/" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Приём оборудования</NavLink>
          <NavLink className="btn me-2" to="/orders" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Список заявок</NavLink>
          <NavLink className="btn me-2" to="/reports" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Отчеты</NavLink>
          <NavLink className="btn me-2" to="/warranty" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Гарантия</NavLink>
          <NavLink className="btn me-2" to="/defect" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Брак Склад</NavLink>
          <NavLink className="btn me-2" to="/edit" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>Цены</NavLink>
          <NavLink className="btn me-2" to="/writeoff" style={({ isActive }) => ({ backgroundColor: isActive ? '#0d6efd' : '#6c757d', color: '#fff' })}>СЗ по Браку</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<ReceptionPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/defect" element={<DefectRepairPage />} />
          <Route path="/edit" element={<EditPrices />} />
          <Route path="/writeoff" element={<WriteOffPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
