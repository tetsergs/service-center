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
    phone: '',
    serial: '',
    sort: 'desc',
  });

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

    if (applied.phone) {
      result = result.filter((order) =>
        order.clientPhone?.toLowerCase().includes(applied.phone.toLowerCase())
      );
    }

    if (applied.serial) {
      result = result.filter((order) =>
        order.equipment.some((eq) =>
          eq.serial?.toLowerCase().includes(applied.serial.toLowerCase())
        )
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return applied.sort === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFiltered(result);
  };

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      setOrders(data);
      applyFilters(data);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = async (updatedOrder) => {
    try {
      await setDoc(doc(db, 'orders', updatedOrder.id), updatedOrder);
      const updatedOrders = orders.map((o) =>
        o.id === updatedOrder.id ? updatedOrder : o
      );
      setOrders(updatedOrders);
      applyFilters(updatedOrders, filters);
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
      const updated = orders.filter(order => order.id !== id);
      setOrders(updated);
      applyFilters(updated, filters);
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const equipmentTypes = Array.from(
    new Set(
      orders.flatMap((o) =>
        o.equipment.map((eq) => eq.customType || eq.type).filter(Boolean)
      )
    )
  );

  const handleResetFilters = () => {
  const reset = {
    city: '',
    equipmentType: '',
    technician: '',
    status: '',
    phone: '',
    serial: '',
    sort: 'desc',
  };
  setFilters(reset);
  applyFilters(orders, reset);
};

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
            <select name="city" className="form-select" value={filters.city} onChange={handleFilterChange}>
              <option value="">Все города</option>
              <option value="Астана">Астана</option>
              <option value="Алматы">Алматы</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Тип оборудования</label>
            <select name="equipmentType" className="form-select" value={filters.equipmentType} onChange={handleFilterChange}>
              <option value="">Все типы</option>
              {equipmentTypes.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label>Техник</label>
            <select name="technician" className="form-select" value={filters.technician} onChange={handleFilterChange}>
              <option value="">Все техники</option>
              <option value="Ермахан">Ермахан</option>
              <option value="Мади">Мади</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Статус ремонта</label>
            <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
              <option value="">Все статусы</option>
              <option value="Диагностика">Диагностика</option>
              <option value="Ремонт">Ремонт</option>
              <option value="Готово">Готово</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Номер телефона</label>
            <input type="text" name="phone" className="form-control" placeholder="Часть номера клиента" value={filters.phone} onChange={handleFilterChange} />
          </div>

          <div className="col-md-3">
            <label>Серийный номер</label>
            <input type="text" name="serial" className="form-control" placeholder="Часть серийника" value={filters.serial} onChange={handleFilterChange} />
          </div>

          <div className="col-md-3">
            <label>Сортировка по дате</label>
            <select name="sort" className="form-select" value={filters.sort} onChange={handleFilterChange}>
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>

<div className="col-md-3 d-flex align-items-end gap-2">
  <button className="btn btn-primary w-50" onClick={() => applyFilters(orders, filters)}>
    🔍 Поиск
  </button>
  <button className="btn btn-outline-secondary w-50" onClick={handleResetFilters}>
    ↩️ Сброс
  </button>
</div>

          
        </div>
      </div>

      {filtered.length > 0 ? (
        filtered.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdate={handleUpdate}
            onDelete={() => handleDelete(order.id)}
          />
        ))
      ) : (
        <div className="alert alert-info">Заявки не найдены.</div>
      )}
    </div>
  );
};

export default OrdersPage;
