import React, { useState } from 'react';
import { db } from '../firebase'; // путь зависит от расположения firebase.js
import { setDoc, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';


const ReceptionPage = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    city: 'Астана',
    equipment: [{ type: '', customType: '', name: '', serial: '' }],
    date: '',
    technician: '',
    status: 'Диагностика',
    notes: '',
  });

  const handleEquipmentChange = (index, field, value) => {
    const updated = [...formData.equipment];
    updated[index][field] = value;
    setFormData({ ...formData, equipment: updated });
  };

  const handleRemoveEquipment = (index) => {
    const updated = [...formData.equipment];
    updated.splice(index, 1);
    setFormData({ ...formData, equipment: updated });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, { type: '', customType: '', name: '', serial: '' }],
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const orderWithId = {
    ...formData,
    id: uuidv4(), // генерируем уникальный ID
  };

  try {
    await setDoc(doc(db, 'orders', orderWithId.id), orderWithId);
    alert('Заявка сохранена!');
  } catch (error) {
    console.error('Ошибка при сохранении заявки:', error);
    alert('Ошибка при сохранении!');
    return;
  }

  // Очистка формы
  setFormData({
    clientName: '',
    phone: '',
    city: 'Астана',
    equipment: [{ type: '', customType: '', name: '', serial: '' }],
    date: '',
    technician: '',
    status: 'Диагностика',
    notes: '',
  });
};


  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">📋 Приём оборудования</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Имя клиента</label>
                <input
                  type="text"
                  name="clientName"
                  className="form-control"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Город</label>
                <select
                  name="city"
                  className="form-select"
                  value={formData.city}
                  onChange={handleChange}
                >
                  <option>Астана</option>
                  <option>Алматы</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Дата приёма</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Имя техника</label>
                <input
                  type="text"
                  name="technician"
                  className="form-control"
                  value={formData.technician}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Заметки</label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <hr className="my-4" />

              <div className="col-12">
                <h5 className="mb-3">🛠 Оборудование</h5>

                {formData.equipment.map((item, index) => (
                  <div key={index} className="border p-2 mb-2 rounded">
                    <div className="row">
                      <div className="col-md-4">
                        <label>Тип оборудования</label>
                        <select
                          className="form-control"
                          value={item.type}
                          onChange={(e) =>
                            handleEquipmentChange(index, 'type', e.target.value)
                          }
                        >
                          <option value="">Выберите...</option>
                          <option value="Моноблок">Моноблок</option>
                          <option value="Сканер ШК">Сканер ШК</option>
                          <option value="Принтер Ч">Принтер Ч</option>
                          <option value="Принтер Э">Принтер Э</option>
                          <option value="Электронные весы">Электронные весы</option>
                          <option value="Другое">Другое</option>
                        </select>
                        {item.type === 'Другое' && (
                          <input
                            type="text"
                            className="form-control mt-2"
                            placeholder="Укажите тип"
                            value={item.customType}
                            onChange={(e) =>
                              handleEquipmentChange(index, 'customType', e.target.value)
                            }
                          />
                        )}
                      </div>
                      <div className="col-md-4">
                        <label>Название</label>
                        <input
                          className="form-control"
                          value={item.name}
                          onChange={(e) =>
                            handleEquipmentChange(index, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label>Серийный номер</label>
                        <input
                          className="form-control"
                          value={item.serial}
                          onChange={(e) =>
                            handleEquipmentChange(index, 'serial', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-1 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveEquipment(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addEquipment}
                >
                  + Добавить оборудование
                </button>
              </div>

              <div className="col-12 mt-4">
                <button type="submit" className="btn btn-success w-100">
                  💾 Сохранить заявку
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceptionPage;
