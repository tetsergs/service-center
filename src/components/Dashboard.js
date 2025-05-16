import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="container mt-5">
      <h2>Личный кабинет техника</h2>
      <Link className="btn btn-primary m-2" to="/form">Новая заявка</Link>
      <Link className="btn btn-secondary m-2" to="/repairs">Список ремонтов</Link>
      <Link className="btn btn-info m-2" to="/report">Отчёты</Link>
    </div>
  );
};

export default Dashboard;