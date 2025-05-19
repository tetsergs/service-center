import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';

const OrderCard = ({ order, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState({ ...order });

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
      onUpdate(editedOrder); // передаём новый объект
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить заявку?')) {
      try {
        await deleteDoc(doc(db, 'orders', order.id));
        onDelete(order.id);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const downloadPDF = () => {
    const docPdf = new jsPDF();
    docPdf.text(`Акт выполненных работ`, 20, 20);
    docPdf.text(`Клиент: ${order.clientName}`, 20, 30);
    docPdf.text(`Телефон: ${order.phone}`, 20, 40);
    docPdf.text(`Город: ${order.city}`, 20, 50);
    docPdf.text(`Техник: ${order.technician}`, 20, 60);
    docPdf.text(`Дата: ${order.date}`, 20, 70);
    docPdf.text(`Статус: ${order.status}`, 20, 80);
    docPdf.text(`Заметки: ${order.notes}`, 20, 90);

    docPdf.text(`Оборудование:`, 20, 110);
    order.equipment.forEach((item, index) => {
      const type = item.type === 'Другое' ? item.customType : item.type;
      docPdf.text(`${index + 1}. ${type}, ${item.name}, SN: ${item.serial}`, 25, 120 + index * 10);
    });

    docPdf.save(`Заявка_${order.clientName}.pdf`);
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        {isEditing ? (
          <>
            <div className="mb-2">
              <label>Имя клиента</label>
              <input
                className="form-control"
                name="clientName"
                value={editedOrder.clientName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Телефон</label>
              <input
                className="form-control"
                name="phone"
                value={editedOrder.phone}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Статус</label>
              <select
                className="form-control"
                name="status"
                value={editedOrder.status}
                onChange={handleChange}
              >
                <option value="Диагностика">Диагностика</option>
                <option value="В работе">В работе</option>
                <option value="Завершено">Завершено</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Заметки</label>
              <textarea
                className="form-control"
                name="notes"
                value={editedOrder.notes}
                onChange={handleChange}
              />
            </div>

            <button onClick={handleSave} className="btn btn-success btn-sm me-2">
              💾 Сохранить
            </button>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm me-2">
              ❌ Отмена
            </button>
          </>
        ) : (
          <>
            <h5 className="card-title">{order.clientName}</h5>
            <p className="card-text">
              <strong>Телефон:</strong> {order.phone} <br />
              <strong>Город:</strong> {order.city} <br />
              <strong>Дата:</strong> {order.date} <br />
              <strong>Техник:</strong> {order.technician} <br />
              <strong>Статус:</strong> {order.status} <br />
              <strong>Заметки:</strong> {order.notes}
            </p>

            {order.equipment && order.equipment.length > 0 && (
              <div className="mb-3">
                <strong>Оборудование:</strong>
                <ul className="mt-2">
                  {order.equipment.map((item, index) => (
                    <li key={index}>
                      {item.type === 'Другое' ? item.customType : item.type} — {item.name} (SN: {item.serial})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm me-2">
              ✏️ Редактировать
            </button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm me-2">
              🗑 Удалить
            </button>
            <button onClick={downloadPDF} className="btn btn-outline-secondary btn-sm">
              📄 Скачать АВР
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
