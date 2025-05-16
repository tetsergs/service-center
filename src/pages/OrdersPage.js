import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = querySnapshot.docs.map((doc) => doc.data());
        setOrders(ordersData);
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mt-5">
      <h3>📦 Список заявок</h3>
      {orders.length === 0 ? (
        <p>Заявок пока нет.</p>
      ) : (
        <div className="list-group">
          {orders.map((order) => (
            <div key={order.id} className="list-group-item">
              <h5>{order.clientName} — {order.city}</h5>
              <p><strong>Телефон:</strong> {order.phone}</p>
              <p><strong>Дата:</strong> {order.date}</p>
              <p><strong>Техник:</strong> {order.technician}</p>
              <p><strong>Статус:</strong> {order.status}</p>
              <p><strong>Заметки:</strong> {order.notes}</p>
              <div>
                <strong>Оборудование:</strong>
                <ul>
                  {order.equipment.map((item, i) => (
                    <li key={i}>
                      {item.type === 'Другое' ? item.customType : item.type} — {item.name} ({item.serial})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
