import React, { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, 'orders'));
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    data.sort((a, b) => {
      const aPr = Math.min(...a.equipment.map(eq => statusPriorityValue(eq.status)));
      const bPr = Math.min(...b.equipment.map(eq => statusPriorityValue(eq.status)));
      return aPr - bPr;
    });
    setOrders(data);
    applyFilters(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = async (index, updatedOrder) => {
    await setDoc(doc(db, 'orders', updatedOrder.id || `order-${index}`), updatedOrder);
    const updated = [...orders];
    updated[index] = updatedOrder;
    setOrders(updated);
    applyFilters(updated);
  };

  const handleDelete = async (index) => {
    const order = orders[index];
    if (order.id) {
      await deleteDoc(doc(db, 'orders', order.id));
    }
    const updated = [...orders];
    updated.splice(index, 1);
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
    let result = [...data];

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
        ? { ...order, filteredEquipment: filteredEquip }
        : null;
    })
    .filter(Boolean);
}


    result.sort((a, b) => {
      const aPr = Math.min(...a.equipment.map(eq => statusPriorityValue(eq.status)));
      const bPr = Math.min(...b.equipment.map(eq => statusPriorityValue(eq.status)));
      return aPr - bPr;
    });

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
        filtered.map((order) => (
          <OrderCard
            key={order.id}           // Используем уникальный id вместо index
            order={order}
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
