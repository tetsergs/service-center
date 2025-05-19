import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const OrderCard = ({ order, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(order);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, editedOrder);
      onUpdate(editedOrder); // Передаём обновлённый объект обратно
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить эту заявку?')) {
      try {
        await deleteDoc(doc(db, 'orders', order.id));
        onDelete(order.id);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        {isEditing ? (
          <>
            <input
              className="form-control mb-2"
              name="clientName"
              value={editedOrder.clientName}
              onChange={handleChange}
            />
            <input
              className="form-control mb-2"
              name="phone"
              value={editedOrder.phone}
              onChange={handleChange}
            />
            <select
              className="form-control mb-2"
              name="status"
              value={editedOrder.status}
              onChange={handleChange}
            >
              <option>Диагностика</option>
              <option>В работе</option>
              <option>Завершено</option>
            </select>
            <button onClick={handleSave} className="btn btn-success btn-sm me-2">
              💾 Сохранить
            </button>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">
              ❌ Отмена
            </button>
          </>
        ) : (
          <>
            <h5 className="card-title">{order.clientName}</h5>
            <p className="card-text">
              <strong>Телефон:</strong> {order.phone}<br />
              <strong>Техник:</strong> {order.technician}<br />
              <strong>Статус:</strong> {order.status}
            </p>
            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm me-2">
              ✏️ Редактировать
            </button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm">
              🗑 Удалить
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
