import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, MenuItem, Paper, List, ListItem
} from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const technicianList = ['Мади', 'Ермахан'];
const DISPLAY_TYPE_NAMES = {
  labelPrint: 'Принтер этикеток',
  posSystem: 'POS-система',
  scanner: 'Сканер штрихкодов',
  scale: 'Весы',
  // добавь другие типы по мере необходимости
};
const DefectRepairs = () => {
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [partUsed, setPartUsed] = useState('');
  const [technician, setTechnician] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [equipmentData, setEquipmentData] = useState({});

  const fetchEquipmentData = async () => {
    const snapshot = await getDocs(collection(db, 'equipmentData'));
    const data = {};
    snapshot.forEach(doc => {
      const docData = doc.data();
      for (const [typeKey, typeValue] of Object.entries(docData)) {
        data[typeKey] = typeValue;
      }
    });
    console.log('Загруженные данные оборудования:', data);
    setEquipmentData(data);
  };

  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSerial, setFilterSerial] = useState('');

  const handleSubmit = async () => {
    if (!type || !model || !serial || !partUsed || !technician) return;
    const retailPrice = equipmentData[type]?.[model]?.[0] ?? null;

    const newRepair = {
      type,
      model,
      serial,
      partUsed,
      technician,
      date: new Date().toISOString(),
      retailPrice
    };

    await addDoc(collection(db, 'defectRepairs'), newRepair);

    setType('');
    setModel('');
    setSerial('');
    setPartUsed('');
    setTechnician('');
    fetchRepairs();
  };

  const fetchRepairs = async () => {
    const snapshot = await getDocs(collection(db, 'defectRepairs'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRepairs(list);
    setFilteredRepairs(list);
  };

  const equipmentTypes = Object.keys(equipmentData);
  const getFilteredModels = () => {
    if (!type || !equipmentData[type]) return [];
    return Object.keys(equipmentData[type]);
  };

  const applyFilters = () => {
    let filtered = repairs;
    if (filterTechnician) {
      filtered = filtered.filter(r => r.technician === filterTechnician);
    }
    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType);
    }
    if (filterSerial) {
      filtered = filtered.filter(r => r.serial.toLowerCase().includes(filterSerial.toLowerCase()));
    }
    setFilteredRepairs(filtered);
  };

  const resetFilters = () => {
    setFilterTechnician('');
    setFilterType('');
    setFilterSerial('');
    setFilteredRepairs(repairs);
  };

  const formatTypeName = (key) => DISPLAY_TYPE_NAMES[key] || key;
  
  useEffect(() => {
    fetchRepairs();
    fetchEquipmentData();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>Ремонты с брак-склада</Typography>

      <TextField
        select fullWidth label="Тип оборудования" value={type}
        onChange={e => {
          setType(e.target.value);
          setModel('');
        }} sx={{ mb: 2 }}
      >

        {equipmentTypes.map((type, i) => (
          
          <MenuItem key={i} value={type}>{formatTypeName(type)}</MenuItem>

        ))}
      </TextField>

      {type && (
        <TextField
          select fullWidth label="Название модели"
          value={model} onChange={e => setModel(e.target.value)} sx={{ mb: 2 }}
        >

          {getFilteredModels().map((modelName, i) => (
            <MenuItem key={i} value={modelName}>{modelName}</MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth label="Серийный номер"
        value={serial} onChange={e => setSerial(e.target.value)} sx={{ mb: 2 }}
      />

      <TextField
        fullWidth label="Использованная запчасть"
        value={partUsed} onChange={e => setPartUsed(e.target.value)} sx={{ mb: 2 }}
      />

      <TextField
        select fullWidth label="ФИО техника"
        value={technician} onChange={e => setTechnician(e.target.value)} sx={{ mb: 2 }}
      >
        {technicianList.map((name, i) => (
          <MenuItem key={i} value={name}>{name}</MenuItem>
        ))}
      </TextField>

      <Button variant="contained" onClick={handleSubmit} fullWidth sx={{ mb: 3 }}>
        Зафиксировать ремонт
      </Button>

      <Button variant="outlined" onClick={() => setShowHistory(!showHistory)} sx={{ mb: 2 }}>
        {showHistory ? 'Скрыть историю ремонтов' : 'Показать историю ремонтов'}
      </Button>

      {showHistory && (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select label="ФИО техника" value={filterTechnician}
              onChange={e => setFilterTechnician(e.target.value)} sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Все</MenuItem>
              {technicianList.map((name, i) => (
                <MenuItem key={i} value={name}>{name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select label="Тип оборудования" value={filterType}
              onChange={e => setFilterType(e.target.value)} sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Все</MenuItem>
              {equipmentTypes.map((type, i) => (
                <MenuItem key={i} value={type}>{formatTypeName(type)}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Поиск по серийному номеру"
              value={filterSerial}
              onChange={e => setFilterSerial(e.target.value)} sx={{ minWidth: 200 }}
            />

            <Button variant="contained" onClick={applyFilters}>Фильтровать</Button>
            <Button variant="text" onClick={resetFilters}>Сбросить фильтры</Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 1 }}>История ремонтов</Typography>
<Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
  {filteredRepairs.length === 0 ? (
    <Typography sx={{ p: 2 }}>Ничего не найдено</Typography>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0' }}>
        <tr>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Дата</th>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Тип</th>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Модель</th>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Серийный №</th>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Запчасть</th>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Техник</th>
          <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Цена</th>
        </tr>
      </thead>
      <tbody>
        {filteredRepairs.map((item, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>{item.date?.slice(0, 10)}</td>
            <td style={{ padding: '8px' }}>{formatTypeName(item.type)}</td>
            <td style={{ padding: '8px' }}>{item.model}</td>
            <td style={{ padding: '8px' }}>{item.serial}</td>
            <td style={{ padding: '8px' }}>{item.partUsed}</td>
            <td style={{ padding: '8px' }}>{item.technician}</td>
            <td style={{ padding: '8px' }}>{item.retailPrice ? `${item.retailPrice}₸` : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</Paper>

        </>
      )}
    </Box>
  );
};

export default DefectRepairs;
