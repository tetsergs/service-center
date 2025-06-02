import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Divider,
} from '@mui/material';
import { Download, Delete, Edit, Check, Close } from '@mui/icons-material';
import { generatePDF } from '../utils/generatePDF';

const statusColor = {
  Диагностика: 'default',
  Ремонт: 'warning',
  Готово: 'success',
};

const statusBadge = (status) => (
  <Chip label={status || 'Неизвестно'} color={statusColor[status] || 'default'} size="small" />
);

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
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" gutterBottom>
              {order.clientName}
            </Typography>
            {order.clientPhone && (
              <Typography variant="body2" color="text.secondary">
                📞 {order.clientPhone}
              </Typography>
            )}
            {order.city && (
              <Typography variant="body2" color="text.secondary">
                📍 {order.city}
              </Typography>
            )}
            {order.technician && (
              <Typography variant="body2" color="text.secondary">
                👨‍🔧 Техник: {order.technician}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              🕒{' '}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString('ru-RU')
                : 'Дата не указана'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={{ xs: 2, sm: 0 }}>
              <Button size="small" variant="outlined" color="success" onClick={() => generatePDF(order)} startIcon={<Download />}>
                АВР
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={handleDeleteWithPIN} startIcon={<Delete />}>
                Удалить
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          🛠️ Оборудование
        </Typography>

        {order.equipment.map((eq, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}
          >
            <Grid container justifyContent="space-between" alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <Typography variant="body2"><strong>Тип:</strong> {eq.customType || eq.type}</Typography>
                <Typography variant="body2"><strong>Серийный:</strong> {eq.serial}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                {editingIndex === index ? (
                  <>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                      <InputLabel>Статус</InputLabel>
                      <Select
                        value={equipmentState[index].status}
                        label="Статус"
                        onChange={(e) => updateEquipmentField(index, 'status', e.target.value)}
                      >
                        <MenuItem value="Диагностика">Диагностика</MenuItem>
                        <MenuItem value="Ремонт">Ремонт</MenuItem>
                        <MenuItem value="Готово">Готово</MenuItem>
                      </Select>
                    </FormControl>

                    {equipmentState[index].status === 'Готово' && (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={equipmentState[index].warranty || false}
                              onChange={(e) =>
                                updateEquipmentField(index, 'warranty', e.target.checked)
                              }
                            />
                          }
                          label="Гарантийный ремонт"
                          sx={{ mb: 1 }}
                        />
                        {!equipmentState[index].warranty && (
                          <>
                            <TextField
                              size="small"
                              fullWidth
                              label="Услуга"
                              value={equipmentState[index].repairDetails || ''}
                              onChange={(e) =>
                                updateEquipmentField(index, 'repairDetails', e.target.value)
                              }
                              sx={{ mb: 1 }}
                            />
                            <TextField
                              size="small"
                              fullWidth
                              label="Сумма"
                              type="number"
                              value={equipmentState[index].repairCost || ''}
                              onChange={(e) =>
                                updateEquipmentField(index, 'repairCost', e.target.value)
                              }
                              sx={{ mb: 1 }}
                            />
                          </>
                        )}
                      </>
                    )}

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton color="success" onClick={() => handleSave(index)}>
                        <Check />
                      </IconButton>
                      <IconButton color="default" onClick={() => setEditingIndex(null)}>
                        <Close />
                      </IconButton>
                    </Stack>
                  </>
                ) : (
                  <Stack spacing={1} alignItems="flex-end">
                    {statusBadge(eq.status)}
                    {eq.status === 'Готово' && (
                      <>
                        <Typography variant="body2"><strong>Услуга:</strong> {eq.repairDetails || '—'}</Typography>
                        <Typography variant="body2">
                          <strong>Стоимость:</strong>{' '}
                          {eq.warranty ? 'Гарантия' : `${eq.repairCost || 0} ₸`}
                        </Typography>
                      </>
                    )}
                    <IconButton size="small" onClick={() => startEditing(index)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Card>
        ))}

        <Typography align="right" fontWeight="bold" sx={{ mt: 2 }}>
          Итого: {getTotalCost()} ₸
        </Typography>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
