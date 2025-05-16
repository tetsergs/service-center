// src/pages/OrdersPage.js
import React, { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';
import { getOrders, saveOrders } from '../utils/firebaseUtils';
import FilterPanel from '../components/FilterPanel';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    technician: '',
    status: '',
  });
  const [filtered, setFiltered] = useState([]);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      const data = await getOrders();
      setOrders(data);
    };
    fetchData();
  }, []);

  // Применение фильтров
  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const applyFilters = () => {
    let result = [...orders];

    if (filters.city) {
      result = result.filter((order) =>
        order.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.technician) {
      result = result.filter((order) =>
        order.technician.toLowerCase().includes(filters.technician.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((order) =>
        order.equipment.some((eq) => eq.status === filters.status)
      );
    }

    setFiltered(result);
  };

  const handleUpdate = (index, updatedOrder) => {
    const updated = [...orders];
    updated[index] = updatedOrder;
    setOrders(updated);
    saveOrders(updated);
  };

  const handleDelete = (index) => {
    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
    saveOrders(updated);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Список заявок</h2>
      <FilterPanel filters={filters} setFilters={setFilters} />

      {filtered.length === 0 ? (
        <p className="text-muted">Заявки не найдены.</p>
      ) : (
        filtered.map((order, index) => (
          <OrderCard
            key={index}
            order={order}
            index={index}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default OrdersPage;
