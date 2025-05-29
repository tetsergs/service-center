import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,
  TextField, Typography, Snackbar, Alert, IconButton
} from '@mui/material';
import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PIN_CODE = '0000';

const EditPrices = () => {
  const [equipmentData, setEquipmentData] = useState({});
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchEquipmentData = async () => {
    const snapshot = await getDocs(collection(db, 'equipmentData'));
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    setEquipmentData(result);

    const types = Object.entries(result).flatMap(([docId, value]) => Object.keys(value));
    const uniqueTypes = [...new Set(types)];
    setTypeOptions(uniqueTypes);
  };

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const handleEditClick = (type, model, price) => {
    setSelectedType(type);
    setSelectedModel(model);
    setNewPrice(price.toString());
    setPendingAction('edit');
    setPinDialogOpen(true);
  };

  const handleDeleteClick = (type, model) => {
    setSelectedType(type);
    setSelectedModel(model);
    setPendingAction('delete');
    setPinDialogOpen(true);
  };

  const handleConfirmPIN = async () => {
    if (pinInput !== PIN_CODE) {
      setSnackbar({ open: true, message: 'Неверный PIN-код', severity: 'error' });
      return;
    }

    const targetDocId = Object.keys(equipmentData).find(docId =>
      equipmentData[docId][selectedType]?.[selectedModel]
    );

    if (!targetDocId) {
      setSnackbar({ open: true, message: 'Элемент не найден в базе', severity: 'error' });
      setPinDialogOpen(false);
      return;
    }

    const docRef = doc(db, 'equipmentData', targetDocId);
    const updatedDoc = { ...equipmentData[targetDocId] };

    if (pendingAction === 'edit') {
      updatedDoc[selectedType][selectedModel][0] = Number(newPrice);
      await updateDoc(docRef, updatedDoc);
      setSnackbar({ open: true, message: 'Цена успешно обновлена', severity: 'success' });
    }

    if (pendingAction === 'delete') {
      delete updatedDoc[selectedType][selectedModel];
      if (Object.keys(updatedDoc[selectedType]).length === 0) delete updatedDoc[selectedType];
      await updateDoc(docRef, updatedDoc);
      setSnackbar({ open: true, message: 'Модель удалена', severity: 'info' });
    }

    setPinDialogOpen(false);
    setPinInput('');
    setPendingAction(null);
    setSelectedModel('');
    setNewPrice('');
    fetchEquipmentData();
  };

  const rows = Object.entries(equipmentData).flatMap(([docId, types]) =>
    Object.entries(types).flatMap(([type, models]) =>
      Object.entries(models).map(([model, priceArray]) => ({
        id: `${docId}-${type}-${model}`,
        type,
        model,
        price: priceArray[0]
      }))
    )
  );

  const filteredRows = selectedType
    ? rows.filter(row => row.type === selectedType)
    : rows;

  const columns = [
    { field: 'type', headerName: 'Тип оборудования', flex: 1 },
    { field: 'model', headerName: 'Модель', flex: 1 },
    { field: 'price', headerName: 'Цена (₸)', flex: 0.5, type: 'number' },
    {
      field: 'actions',
      headerName: '',
      flex: 0.3,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEditClick(params.row.type, params.row.model, params.row.price)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.type, params.row.model)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>Изменение цен на оборудование</Typography>

      <TextField
        select
        label="Фильтр по типу"
        fullWidth
        sx={{ mb: 2 }}
        value={selectedType}
        onChange={e => setSelectedType(e.target.value)}
      >
        <MenuItem value="">Все типы</MenuItem>
        {typeOptions.map(type => (
          <MenuItem key={type} value={type}>{type}</MenuItem>
        ))}
      </TextField>

      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </Box>

      <Dialog open={pinDialogOpen} onClose={() => setPinDialogOpen(false)}>
        <DialogTitle>Введите PIN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="PIN"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmPIN}>Подтвердить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EditPrices;
