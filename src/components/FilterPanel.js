// src/components/FilterPanel.js
import React, { useState } from 'react';

const FilterPanel = ({ onFilter }) => {
  const [filters, setFilters] = useState({ city: '', type: '', technician: '', status: '' });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="card p-3 mb-4">
      <div className="row g-2">
        <div className="col-md">
          <input name="city" className="form-control" placeholder="Город" onChange={handleChange} />
        </div>
        <div className="col-md">
          <input name="type" className="form-control" placeholder="Тип оборудования" onChange={handleChange} />
        </div>
        <div className="col-md">
          <input name="technician" className="form-control" placeholder="Техник" onChange={handleChange} />
        </div>
        <div className="col-md">
          <select name="status" className="form-control" onChange={handleChange}>
            <option value="">Все</option>
            <option>Диагностика</option>
            <option>Ремонт</option>
            <option>Готово</option>
          </select>
        </div>
        <div className="col-md-auto">
          <button className="btn btn-primary w-100" onClick={() => onFilter(filters)}>Применить</button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
