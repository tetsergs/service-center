import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, MenuItem, Paper, List, ListItem
} from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const equipmentTypes = [
  'Моноблок',
  'Принт чеков',
  'Принт этикеток',
  'Сканер ШК',
  'ТСД',
  'Прочее'
];

const equipmentName = {
  'Моноблок': ['AT810 i3', 'AT810 i5', 'AT709 Celeron', 'AT709 DUAL', 'AT7810 DUAL'],
  'Принт чеков': ['XP58 USB', 'XP58 USB+Blue', 'XP80C USB', 'XP80C USB+LAN', 'XP80C USB+LAN+COM', 'XP80C USB+WiFi'],
  'Принт этикеток': ['XP-365B USB'],
  'Сканер ШК': [],
  'ТСД': [],
  'Прочее': [],
};

const technicianList = ['Мади', 'Ермахан'];

const DefectRepairs = () => {
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [partUsed, setPartUsed] = useState('');
  const [technician, setTechnician] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Фильтры
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSerial, setFilterSerial] = useState('');

  const handleSubmit = async () => {
    if (!type || !model || !serial || !partUsed || !technician) return;

    const newRepair = {
      type,
      model,
      serial,
      partUsed,
      technician,
      date: new Date().toISOString(),
      retailPrice: null
    };

    await addDoc(collection(db, 'defectRepairs'), newRepair);
    setType('');
    setModel('');
    setSerial('');
    setPartUsed('');
    setTechnician('');
    fetchRepairs(); // обновить список после добавления
  };

  const fetchRepairs = async () => {
    const snapshot = await getDocs(collection(db, 'defectRepairs'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRepairs(list);
    setFilteredRepairs(list);
  };

  const getFilteredModels = () => {
    return equipmentName[type] || [];
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

  useEffect(() => {
    fetchRepairs();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>Ремонты с брак-склада</Typography>

      {/* Ввод */}
      <TextField
        select fullWidth label="Тип оборудования" value={type}
        onChange={e => setType(e.target.value)} sx={{ mb: 2 }}
      >
        {equipmentTypes.map((opt, i) => (
          <MenuItem key={i} value={opt}>{opt}</MenuItem>
        ))}
      </TextField>

      {type === 'Прочее' ? (
        <TextField
          fullWidth label="Название модели"
          value={model} onChange={e => setModel(e.target.value)} sx={{ mb: 2 }}
        />
      ) : (
        <TextField
          select fullWidth label="Название модели"
          value={model} onChange={e => setModel(e.target.value)} sx={{ mb: 2 }}
        >
          {getFilteredModels().map((opt, i) => (
            <MenuItem key={i} value={opt}>{opt}</MenuItem>
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

      {/* Показать / скрыть историю */}
      <Button variant="outlined" onClick={() => setShowHistory(!showHistory)} sx={{ mb: 2 }}>
        {showHistory ? 'Скрыть историю ремонтов' : 'Показать историю ремонтов'}
      </Button>

      {showHistory && (
        <>
          {/* Фильтры */}
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
                <MenuItem key={i} value={type}>{type}</MenuItem>
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
          <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
            <List dense>
              {filteredRepairs.length === 0 ? (
                <ListItem>Ничего не найдено</ListItem>
              ) : (
                filteredRepairs.map((item, i) => (
                  <ListItem key={i}>
                    {item.date?.slice(0, 10)} — {item.type} {item.model}, SN: {item.serial}, запчасть: {item.partUsed}, техник: {item.technician}
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DefectRepairs;
