// src/components/OrderCard.js
import React, { useState } from 'react';
import { generatePDF } from '../utils/generatePDF';

const OrderCard = ({ order, index, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [updated, setUpdated] = useState(order);
  const [showModal, setShowModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdated({ ...updated, [name]: value });
  };

  const handleEquipmentChange = (i, field, value) => {
    const updatedEquipment = [...updated.equipment];
    updatedEquipment[i][field] = value;
    setUpdated({ ...updated, equipment: updatedEquipment });
  };

  const handleSave = () => {
    onUpdate(index, updated);
    setEditing(false);
  };

  const handleConfirmDelete = () => {
    if (deleteCode === '0000') {
      onDelete(index);
      setShowModal(false);
      setDeleteCode('');
      setError('');
    } else {
      setError('Неверный код. Попробуйте снова.');
    }
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        {editing ? (
          <>
            <h6>Общая информация</h6>
            <label className="form-label">Заметки</label>
            <textarea
              className="form-control mb-3"
              name="notes"
              value={updated.notes}
              onChange={handleChange}
            />

            <h6 className="mt-3">Оборудование</h6>
            {updated.equipment.map((eq, i) => (
              <div key={i} className="border rounded p-3 mb-3">
                <p><b>{eq.customType || eq.type}</b> – {eq.name} – SN: {eq.serial}</p>

                <label className="form-label">Статус ремонта</label>
                <select
                  className="form-select mb-2"
                  value={eq.status || 'Диагностика'}
                  onChange={(e) => handleEquipmentChange(i, 'status', e.target.value)}
                >
                  <option value="Диагностика">Диагностика</option>
                  <option value="Ремонт">Ремонт</option>
                  <option value="Готово">Готово</option>
                </select>

                {eq.status === 'Готово' && (
                  <>
                    <label className="form-label">Проведённые услуги</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Например: Замена платы"
                      value={eq.services || ''}
                      onChange={(e) => handleEquipmentChange(i, 'services', e.target.value)}
                    />

                    <label className="form-label">Стоимость ремонта</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Сумма"
                      value={eq.price || ''}
                      onChange={(e) => handleEquipmentChange(i, 'price', e.target.value)}
                    />

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={eq.guarantee || false}
                        onChange={(e) => handleEquipmentChange(i, 'guarantee', e.target.checked)}
                      />
                      <label className="form-check-label">Гарантийный ремонт</label>
                    </div>
                  </>
                )}
              </div>
            ))}

            <button className="btn btn-success btn-sm me-2" onClick={handleSave}>
              Сохранить
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
              Отмена
            </button>
          </>
        ) : (
          <>
            <p><b>Клиент:</b> {order.clientName} ({order.phone})</p>
            <p><b>Город:</b> {order.city}</p>
            <p><b>Дата:</b> {order.date}</p>
            <p><b>Техник:</b> {order.technician}</p>
            <p><b>Заметки:</b> {order.notes}</p>

            <b>Оборудование:</b>
            <ul>
              {order.equipment.map((eq, i) => (
                <li key={i}>
                  <div><b>{eq.customType || eq.type}</b> – {eq.name} – SN: {eq.serial}</div>
                  <div><small>Статус: {eq.status || 'Диагностика'}</small></div>
                  {eq.services && <div><small>Услуги: {eq.services}</small></div>}
                  {eq.price && <div><small>Стоимость: {eq.price} тг</small></div>}
                  {eq.guarantee && <div><small>Гарантия: Да</small></div>}
                </li>
              ))}
            </ul>

            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => setEditing(true)}>
              Редактировать
            </button>
            <button className="btn btn-outline-success btn-sm me-2" onClick={() => generatePDF(order)}>
              Скачать АВР
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => setShowModal(true)}>
              Удалить
            </button>
          </>
        )}
      </div>

      {/* Модальное окно удаления */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Подтверждение удаления</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Введите код для подтверждения удаления заявки:</p>
                <input
                  type="password"
                  className="form-control"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  placeholder="Введите код"
                />
                {error && <div className="text-danger mt-2">{error}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                  Удалить
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  setShowModal(false);
                  setDeleteCode('');
                  setError('');
                }}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
