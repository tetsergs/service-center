import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReceptionPage from './pages/ReceptionPage';
import OrdersPage from './pages/OrdersPage';


function App() {
  return (
    <Router>
      <div className="container mt-3">
        <nav className="mb-4">
          <Link className="btn btn-primary me-2" to="/">Приём оборудования</Link>
          <Link className="btn btn-secondary" to="/orders">Список заявок</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ReceptionPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
