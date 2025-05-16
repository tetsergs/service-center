import React, { useState, useEffect } from 'react';
import generatePDF from '../utils/generatePDF';

const RepairList = () => {
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('repairs')) || [];
    setRepairs(data);
  }, []);

  const updateStatus = (id, status) => {
    const updated = repairs.map(r => r.id === id ? { ...r, status } : r);
    setRepairs(updated);
    localStorage.setItem('repairs', JSON.stringify(updated));
  };

  const setCost = (id, cost) => {
    const updated = repairs.map(r => r.id === id ? { ...r, cost } : r);
    setRepairs(updated);
    localStorage.setItem('repairs', JSON.stringify(updated));
  };

  return (
    <div className="container mt-5">
      <h2>Все ремонты</h2>
      {repairs.map((r, i) => (
        <div className="card p-3 my-2" key={i}>
          <p><b>Клиент:</b> {r.name} | <b>Город:</b> {r.city} | <b>Оборудование:</b> {r.equipment} | <b>Серийный:</b> {r.serial}</p>
          <p><b>Статус:</b> {r.status}</p>
          <select onChange={e => updateStatus(r.id, e.target.value)} className="form-select my-1" value={r.status}>
            <option>Диагностика</option>
            <option>Ремонт</option>
            <option>Готово</option>
          </select>
          {r.status === 'Готово' && (
            <>
              <input className="form-control my-1" placeholder="Стоимость ремонта или 'Гарантия'" onBlur={e => setCost(r.id, e.target.value)} />
              <button className="btn btn-outline-primary mt-1" onClick={() => generatePDF(r)}>Сгенерировать Акт</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default RepairList;