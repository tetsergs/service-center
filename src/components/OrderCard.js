import React, { useState } from 'react';
import { generatePDF } from '../utils/generatePDF';

const statusBadge = (status) => {
  switch (status) {
    case 'Диагностика':
      return <span className="badge bg-secondary">Диагностика</span>;
    case 'Ремонт':
      return <span className="badge bg-warning text-dark">Ремонт</span>;
    case 'Готово':
      return <span className="badge bg-success">Готово</span>;
    default:
      return <span className="badge bg-light text-dark">Неизвестно</span>;
  }
};

const OrderCard = ({ order, onUpdate, onDelete }) => {
  const [equipmentState, setEquipmentState] = useState(order.equipment);
  const [editingIndex, setEditingIndex] = useState(null);

  const startEditing = (index) => {
    setEquipmentState(order.equipment);
    setEditingIndex(index);
  };

  const updateEquipmentField = (index, field, value) => {
    const updated = [...equipmentState];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'warranty' && value) {
      updated[index].repairCost = '';
      updated[index].repairDetails = '';
    }

    setEquipmentState(updated);
  };

  const handleSave = (index) => {
    const updatedOrder = {
      ...order,
      equipment: equipmentState,
    };
    onUpdate(updatedOrder);
    setEditingIndex(null);
  };

  const handleDeleteWithPIN = () => {
    const pin = prompt('Введите PIN-код для удаления:');
    if (pin === '0000') {
      onDelete();
    } else {
      alert('Неверный PIN-код. Удаление отменено.');
    }
  };

  const getTotalCost = () =>
    order.equipment.reduce((sum, eq) => {
      if (eq.status === 'Готово' && !eq.warranty) {
        return sum + Number(eq.repairCost || 0);
      }
      return sum;
    }, 0);

  return (
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
  <h5 className="mb-1">
    <i className="bi bi-person-fill me-2"></i>{order.clientName}
  </h5>
  
  {order.clientPhone && (
    <p className="mb-1 text-muted">
      <i className="bi bi-telephone me-1"></i>{order.clientPhone}
    </p>
  )}

  {order.city && (
    <p className="mb-1 text-muted">
      <i className="bi bi-geo-alt me-1"></i>{order.city}
    </p>
  )}

  {order.technician && (
    <p className="mb-1 text-muted">
      <i className="bi bi-person-badge me-1"></i>Техник: {order.technician}
    </p>
  )}

  <small className="text-muted">
    <i className="bi bi-clock me-1"></i>
    {order.createdAt
      ? new Date(order.createdAt).toLocaleString('ru-RU')
      : 'Дата не указана'}
  </small>
</div>


          <div className="d-flex flex-column align-items-end gap-1">
            <button className="btn btn-sm btn-outline-success" onClick={() => generatePDF(order)}>
              <i className="bi bi-download me-1"></i>Скачать АВР
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteWithPIN}>
              <i className="bi bi-trash me-1"></i>Удалить
            </button>
          </div>
        </div>

        <hr />

        <h6 className="mb-3">
          <i className="bi bi-tools me-2"></i>Оборудование
        </h6>

        {order.equipment.map((eq, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-light-subtle">
            <div className="d-flex justify-content-between">
              <div>
                <div><strong>Тип:</strong> {eq.customType || eq.type}</div>
                <div><strong>Серийный:</strong> {eq.serial}</div>
              </div>

              <div className="text-end">
                {editingIndex === index ? (
                  <>
                    <select
                      className="form-select form-select-sm mb-2"
                      value={equipmentState[index].status}
                      onChange={(e) => updateEquipmentField(index, 'status', e.target.value)}
                    >
                      <option value="Диагностика">Диагностика</option>
                      <option value="Ремонт">Ремонт</option>
                      <option value="Готово">Готово</option>
                    </select>

                    {equipmentState[index].status === 'Готово' && (
                      <>
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`warranty-${index}`}
                            checked={equipmentState[index].warranty || false}
                            onChange={(e) =>
                              updateEquipmentField(index, 'warranty', e.target.checked)
                            }
                          />
                          <label htmlFor={`warranty-${index}`} className="form-check-label">
                            Гарантийный ремонт
                          </label>
                        </div>

                        {!equipmentState[index].warranty && (
                          <>
                            <input
                              type="text"
                              className="form-control form-control-sm mb-1"
                              placeholder="Услуга"
                              value={equipmentState[index].repairDetails || ''}
                              onChange={(e) =>
                                updateEquipmentField(index, 'repairDetails', e.target.value)
                              }
                            />
                            <input
                              type="number"
                              className="form-control form-control-sm mb-2"
                              placeholder="Сумма"
                              value={equipmentState[index].repairCost || ''}
                              onChange={(e) =>
                                updateEquipmentField(index, 'repairCost', e.target.value)
                              }
                            />
                          </>
                        )}
                      </>
                    )}

                    <div className="d-flex gap-2 justify-content-end">
                      <button className="btn btn-sm btn-success" onClick={() => handleSave(index)}>
                        <i className="bi bi-check-circle"></i>
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditingIndex(null)}>
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-1">{statusBadge(eq.status)}</div>
                    {eq.status === 'Готово' && (
                      <>
                        <div><strong>Услуга:</strong> {eq.repairDetails || '—'}</div>
                        <div>
                          <strong>Стоимость:</strong>{' '}
                          {eq.warranty ? 'Гарантия' : `${eq.repairCost || 0} ₸`}
                        </div>
                      </>
                    )}
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => startEditing(index)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="text-end mt-2">
          <strong>Итого: {getTotalCost()} ₸</strong>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
