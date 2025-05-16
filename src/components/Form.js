import React, { useState } from 'react';

const Form = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: 'Астана',
    equipment: '',
    serial: '',
    date: '',
    technician: '',
    status: 'Диагностика',
    notes: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const repairs = JSON.parse(localStorage.getItem('repairs')) || [];
    repairs.push({ ...form, id: Date.now(), cost: null });
    localStorage.setItem('repairs', JSON.stringify(repairs));
    alert('Заявка добавлена');
  };

  return (
    <div className="container mt-5">
      <h2>Форма приёма оборудования</h2>
      {['name', 'phone', 'equipment', 'serial', 'date', 'technician', 'notes'].map(field => (
        <input
          className="form-control my-2"
          key={field}
          name={field}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
        />
      ))}
      <select name="city" className="form-control my-2" value={form.city} onChange={handleChange}>
        <option value="Астана">Астана</option>
        <option value="Алматы">Алматы</option>
      </select>
      <button className="btn btn-success" onClick={handleSubmit}>Сохранить</button>
    </div>
  );
};

export default Form;