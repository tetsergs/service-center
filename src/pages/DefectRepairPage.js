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
  'Моноблок': [
    'AT810 i3',
    'AT810 i5',
    'AT709 Celeron',
    'AT709 DUAL',
    'AT7810 DUAL'
  ],
  'Принт чеков': [
    'XP58 USB',
    'XP58 USB+Blue',
    'XP80C USB',
    'XP80C USB+LAN',
    'XP80C USB+LAN+COM',
    'XP80C USB+WiFi'
  ],
  'Принт этикеток': [
    'XP-365B USB',
    'XP-365B USB+Blue',
    'XP-237B USB',
    'XP-420B USB',
    'XP-TT424B USB'
  ],
  'Сканер ШК': [
    'AT830W',
    'AT830RX',
    'Zebra2802',
    'A1W',
    'A1'
  ],
  'ТСД': [],
  'Прочее': []
};

const DefectRepairs = () => {
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [partUsed, setPartUsed] = useState('');
  const [technician, setTechnician] = useState('');
  const [repairs, setRepairs] = useState([]);
  const technicianList = [
    'Мади', 
    'Ермахан', 
  ];

  const handleSubmit = async () => {
    if (!type || !model || !serial || !partUsed || !technician) return;

    const newRepair = {
      type,
      model,
      serial,
      partUsed,
      technician,
      date: new Date().toISOString(),
      retailPrice: null // Зарезервировано под будущую цену
    };

    await addDoc(collection(db, 'defectRepairs'), newRepair);
    setType('');
    setModel('');
    setSerial('');
    setPartUsed('');
    setTechnician('');
    fetchRepairs();
  };

  const getFilteredModels = () => {
    return equipmentName[type] || [];
  };
  const fetchRepairs = async () => {
    const snapshot = await getDocs(collection(db, 'defectRepairs'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRepairs(list);
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>Ремонты с брак-склада</Typography>

      <TextField
        select
        fullWidth
        label="Тип оборудования"
        value={type}
        onChange={e => setType(e.target.value)}
        sx={{ mb: 2 }}
      >
        {equipmentTypes.map((opt, i) => (
          <MenuItem key={i} value={opt}>{opt}</MenuItem>
        ))}
      </TextField>

      {type === 'Прочее' ? (
        <TextField
          fullWidth
          label="Название модели"
          value={model}
          onChange={e => setModel(e.target.value)}
          sx={{ mb: 2 }}
        />
      ) : (
        <TextField
          select
          fullWidth
          label="Название модели"
          value={model}
          onChange={e => setModel(e.target.value)}
          sx={{ mb: 2 }}
        >
          {getFilteredModels().map((opt, i) => (
            <MenuItem key={i} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        label="Серийный номер"
        value={serial}
        onChange={e => setSerial(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Использованная запчасть"
        value={partUsed}
        onChange={e => setPartUsed(e.target.value)}
        sx={{ mb: 2 }}
      />

<TextField
  select
  fullWidth
  label="ФИО техника"
  value={technician}
  onChange={e => setTechnician(e.target.value)}
  sx={{ mb: 2 }}
>
  {technicianList.map((name, i) => (
    <MenuItem key={i} value={name}>{name}</MenuItem>
  ))}
</TextField>

      <Button variant="contained" onClick={handleSubmit} fullWidth sx={{ mb: 3 }}>
        Зафиксировать ремонт
      </Button>

      <Typography variant="h6" sx={{ mb: 1 }}>История ремонтов</Typography>
      <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
        <List dense>
          {repairs.map((item, i) => (
            <ListItem key={i}>
              {item.date?.slice(0, 10)} — {item.type} {item.model}, SN: {item.serial}, запчасть: {item.partUsed}, техник: {item.technician}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DefectRepairs;
