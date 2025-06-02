import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const cities = ["Астана", "Алматы"];
const technicians = ["Мади", "Ермахан"];

const ReceptionPage = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    city: "Астана",
    date: "",
    technician: "",
    notes: "",
    equipment: [{ type: "", name: "", serial: "" }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEquipmentChange = (index, field, value) => {
    const updated = [...formData.equipment];
    updated[index][field] = value;
    setFormData({ ...formData, equipment: updated });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, { type: "", name: "", serial: "" }],
    });
  };

  const removeEquipment = (index) => {
    const updated = [...formData.equipment];
    updated.splice(index, 1);
    setFormData({ ...formData, equipment: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Отправка:", formData);
    // отправка в Firestore, если нужно
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" gutterBottom>
          📋 Приём оборудования
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Клиент */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Имя клиента"
                name="clientName"
                fullWidth
                required
                value={formData.clientName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Телефон"
                name="phone"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            {/* Приём */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Город</InputLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  label="Город"
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Дата приёма"
                type="date"
                name="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl maxWidth={4}>
                <InputLabel>Техник</InputLabel>
                <Select
                  name="technician"
                  value={formData.technician}
                  onChange={handleChange}
                  label="Техник"
                >
                  {technicians.map((tech) => (
                    <MenuItem key={tech} value={tech}>
                      {tech}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
<Container>
            {/* Заметки */}
            <Grid item xs={12}>
              <TextField
                label="Заметки"
                name="notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
</Container>
            {/* Оборудование */}
      <Container>
            <Grid item xs={12}>
              <Typography variant="h6">⚙️ Оборудование</Typography>
            </Grid>
      </Container>
            {formData.equipment.map((item, index) => (
              <React.Fragment key={index}>
                 <Container>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Тип"
                    maxWidth={3}
                    value={item.type}
                    onChange={(e) =>
                      handleEquipmentChange(index, "type", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Название"
                    maxWidth={4}
                    value={item.name}
                    onChange={(e) =>
                      handleEquipmentChange(index, "name", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Серийный номер"
                    maxWidth={5}
                    value={item.serial}
                    onChange={(e) =>
                      handleEquipmentChange(index, "serial", e.target.value)
                    }
                  />
                </Grid>
                
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => removeEquipment(index)}
                    disabled={formData.equipment.length === 1}
                  >
                    <Delete />
                  </IconButton>
                  
                </Grid>
                </Container>
              </React.Fragment>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addEquipment}
              >
                Добавить оборудование
              </Button>
            </Grid>

            {/* Кнопка */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
              >
                Сохранить заявку
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ReceptionPage;
