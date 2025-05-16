import React, { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filters, setFilters] = useState({
    city: '',
    equipmentType: '',
    technician: '',
    status: '',
  });

  const statusPriorityValue = (status) => {
    const map = {
      'Диагностика': 0,
      'Ремонт': 1,
      'Готово': 2,
    };
    return map[status] ?? 99;
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('repairs') || '[]');
    saved.sort((a, b) => new Date(b.date) - new Date(a.date));

    const statusPriority = (order) => {
      const priorities = order.equipment.map(eq => statusPriorityValue(eq.status));
      return Math.min(...priorities);
    };

    saved.sort((a, b) => statusPriority(a) - statusPriority(b));

    setOrders(saved);
    setFiltered(saved);
  }, []);

  const handleUpdate = (index, updatedOrder) => {
    const updated = [...orders];
    updated[index] = updatedOrder;
    localStorage.setItem('repairs', JSON.stringify(updated));
    setOrders(updated);
    applyFilters(updated);
  };

  const handleDelete = (index) => {
    const updated = [...orders];
    updated.splice(index, 1);
    localStorage.setItem('repairs', JSON.stringify(updated));
    setOrders(updated);
    applyFilters(updated);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(orders, newFilters);
  };

  const applyFilters = (data, applied = filters) => {
    let result = data;

    if (applied.city) {
      result = result.filter((o) => o.city === applied.city);
    }

    if (applied.technician) {
      result = result.filter((o) => o.technician === applied.technician);
    }

    if (applied.equipmentType) {
      result = result.filter((o) =>
        o.equipment.some(
          (eq) =>
            eq.type === applied.equipmentType ||
            eq.customType === applied.equipmentType
        )
      );
    }

    if (applied.status) {
      result = result
        .map((order) => {
          const filteredEquip = order.equipment.filter(
            (eq) => eq.status === applied.status
          );
          return filteredEquip.length > 0
            ? { ...order, equipment: filteredEquip }
            : null;
        })
        .filter(Boolean);
    }

    const statusPriority = (order) => {
      const priorities = order.equipment.map(eq => statusPriorityValue(eq.status));
      return Math.min(...priorities);
    };

    result.sort((a, b) => statusPriority(a) - statusPriority(b));

    setFiltered(result);
  };

  const equipmentTypes = Array.from(
    new Set(
      orders.flatMap((o) =>
        o.equipment.map((eq) => eq.customType || eq.type).filter(Boolean)
      )
    )
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>📦 Список заявок</h4>
        <span className="badge bg-primary fs-6">
          Кол-во заявок: {filtered.length}
        </span>
      </div>

      <div className="card p-3 mb-4 shadow-sm">
        <h5>Фильтрация заявок</h5>
        <div className="row g-3 mt-2">
          <div className="col-md-3">
            <label>Город</label>
            <select
              name="city"
              className="form-select"
              value={filters.city}
              onChange={handleFilterChange}
            >
              <option value="">Все города</option>
              <option value="Астана">Астана</option>
              <option value="Алматы">Алматы</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Тип оборудования</label>
            <select
              name="equipmentType"
              className="form-select"
              value={filters.equipmentType}
              onChange={handleFilterChange}
            >
              <option value="">Все типы</option>
              {equipmentTypes.map((type, i) => (
                <option key={i} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label>Техник</label>
            <select
              name="technician"
              className="form-select"
              value={filters.technician}
              onChange={handleFilterChange}
            >
              <option value="">Все техники</option>
              <option value="Ермахан">Ермахан</option>
              <option value="Мади">Мади</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Статус ремонта</label>
            <select
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Все статусы</option>
              <option value="Диагностика">Диагностика</option>
              <option value="Ремонт">Ремонт</option>
              <option value="Готово">Готово</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        filtered.map((order, index) => (
          <OrderCard
            key={index}
            order={order}
            index={index}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <div className="alert alert-info">Заявки не найдены.</div>
      )}
    </div>
  );
};

export default OrdersPage;
