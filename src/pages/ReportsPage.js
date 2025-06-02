// ReportsPage.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Box, Typography, List, ListItem  } from '@mui/material';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const ReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [previousPeriodData, setPreviousPeriodData] = useState([]);
  const [equipmentTypesOptions, setEquipmentTypesOptions] = useState([]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
  const [startDate, setStartDate] = useState(dayjs().startOf('month').toDate());
  const [endDate, setEndDate] = useState(dayjs().endOf('month').toDate());

  const [defectRepairs, setDefectRepairs] = useState([]);
  const [defectReport, setDefectReport] = useState(null);

  const fetchDefectRepairs = async () => {
    const snapshot = await getDocs(collection(db, 'defectRepairs'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDefectRepairs(data);
    return data;
  };
  
const analyzeDefectRepairs = (repairs, startDate, endDate) => {
  const filtered = repairs.filter(r => {
    const date = new Date(r.date);
    return date >= startDate && date <= endDate;
  });

  const totalCount = filtered.length;
  const byTechnician = {};
  const byType = {};
  const bonusByTechnician = {};
  const partsUsage = {};

  filtered.forEach(r => {
    byTechnician[r.technician] = (byTechnician[r.technician] || 0) + 1;
    byType[r.type] = (byType[r.type] || 0) + 1;

    const bonus = r.retailPrice ? r.retailPrice * 0.04 : 0;
    if (bonus) {
      bonusByTechnician[r.technician] = (bonusByTechnician[r.technician] || 0) + bonus;
    }

    if (r.partUsed) {
      partsUsage[r.partUsed] = (partsUsage[r.partUsed] || 0) + 1;
    }
  });

  return {
    totalCount,
    byTechnician,
    byType,
    bonusByTechnician,
    partsUsage
  };
};

  useEffect(() => {
    const loadDefectReports = async () => {
      const repairs = await fetchDefectRepairs();
      const result = analyzeDefectRepairs(repairs, startDate, endDate);
      setDefectReport(result);
    };

    loadDefectReports();
  }, [startDate, endDate]);


  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    city: '',
    technician: '',
    equipmentTypes: [],
    warrantyOnly: false,
  });

  const fetchOrders = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'orders'));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Сортировка по дате
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    setOrders(data);

    const types = Array.from(
      new Set(data.flatMap((o) =>
        o.equipment.map((eq) => eq.customType || eq.type).filter(Boolean)
      ))
    ).map((type) => ({ label: type, value: type }));

    setEquipmentTypesOptions(types);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const types = filters.equipmentTypes.map((t) => t.value);
      const currentFiltered = [];

      orders.forEach((o) => {
        const created = new Date(o.date);
        const inRange = created >= filters.startDate && created <= filters.endDate;
        const cityMatch = !filters.city || o.city === filters.city;
        const techMatch = !filters.technician || o.technician === filters.technician;

        if (inRange && cityMatch && techMatch) {
          o.equipment.forEach((eq) => {
            const typeMatch = types.length === 0 || types.includes(eq.customType || eq.type);
            const warrantyMatch = !filters.warrantyOnly || eq.warranty === true;

            if (typeMatch && warrantyMatch && eq.status === 'Готово') {
              currentFiltered.push({
                ...eq,
                technician: o.technician,
                city: o.city,
                date: o.date,
              });
            }
          });
        }
      });

      currentFiltered.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFilteredEquipment(currentFiltered);

      // Предыдущий период
      const rangeMs = filters.endDate - filters.startDate;
      const previousStart = new Date(filters.startDate.getTime() - rangeMs);
      const previousEnd = new Date(filters.startDate.getTime());

      const prevFiltered = [];

      orders.forEach((o) => {
        const created = new Date(o.date);
        const inRange = created >= previousStart && created < previousEnd;
        const cityMatch = !filters.city || o.city === filters.city;
        const techMatch = !filters.technician || o.technician === filters.technician;

        if (inRange && cityMatch && techMatch) {
          o.equipment.forEach((eq) => {
            const typeMatch = types.length === 0 || types.includes(eq.customType || eq.type);
            const warrantyMatch = !filters.warrantyOnly || eq.warranty === true;

            if (typeMatch && warrantyMatch && eq.status === 'Готово') {
              prevFiltered.push({
                ...eq,
                technician: o.technician,
                city: o.city,
                date: o.date,
              });
            }
          });
        }
      });

      prevFiltered.sort((a, b) => new Date(a.date) - new Date(b.date));
      setPreviousPeriodData(prevFiltered);
    }
  }, [filters, orders]);

  const countStats = (data) => {
    const total = data.length;
    const warranty = data.filter((e) => e.warranty).length;
    const paid = total - warranty;
    const sum = data.reduce((acc, e) => {
      const cost = parseFloat(e.repairCost);
      return acc + (!e.warranty && !isNaN(cost) ? cost : 0);
    }, 0);
    return { total, warranty, paid, sum };
  };

  const calculateTechnicianStats = (data) => {
    const stats = {};
    data.forEach((eq) => {
      const tech = eq.technician || 'Не указан';
      if (!stats[tech]) stats[tech] = { total: 0, warranty: 0, paid: 0, sum: 0 };
      stats[tech].total += 1;
      if (eq.warranty) stats[tech].warranty += 1;
      else {
        stats[tech].paid += 1;
        const cost = parseFloat(eq.repairCost);
        if (!isNaN(cost)) stats[tech].sum += cost;
      }
    });
    return Object.entries(stats).map(([technician, data]) => ({ technician, ...data }));
  };

  const groupByDay = (data, label) => {
    const grouped = {};
    data.forEach((eq) => {
      const date = new Date(eq.date).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, [label]: 0 };
      grouped[date][label]++;
    });
    return grouped;
  };

  const mergedDailyData = () => {
    const current = groupByDay(filteredEquipment, 'Текущий');
    const previous = groupByDay(previousPeriodData, 'Предыдущий');
    const allDates = new Set([...Object.keys(current), ...Object.keys(previous)]);
    return Array.from(allDates).sort().map(date => ({
      date,
      'Текущий': current[date]?.['Текущий'] || 0,
      'Предыдущий': previous[date]?.['Предыдущий'] || 0,
    }));
  };

  const currentStats = countStats(filteredEquipment);
  const previousStats = countStats(previousPeriodData);
  const technicianStats = calculateTechnicianStats(filteredEquipment);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEquipment);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчет');
    XLSX.writeFile(wb, 'report.xlsx');
  };
 
  return (
    <div className="container mt-4">
      <h4 className="mb-3">📊 Отчёты по ремонтам</h4>

      <div className="card p-3 shadow-sm mb-4">
        <h5>Фильтры</h5>
        <div className="row g-3 mt-2">
          <div className="col-md-3">
            <label>Начальная дата</label>
            <input type="date" className="form-control" value={filters.startDate.toISOString().split('T')[0]} onChange={(e) => setFilters({ ...filters, startDate: new Date(e.target.value) })} />
          </div>
          <div className="col-md-3">
            <label>Конечная дата</label>
            <input type="date" className="form-control" value={filters.endDate.toISOString().split('T')[0]} onChange={(e) => setFilters({ ...filters, endDate: new Date(e.target.value) })} />
          </div>
          <div className="col-md-3">
            <label>Город</label>
            <select className="form-select" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
              <option value="">Все города</option>
              <option value="Астана">Астана</option>
              <option value="Алматы">Алматы</option>
            </select>
          </div>
          <div className="col-md-3">
            <label>Техник</label>
            <select className="form-select" value={filters.technician} onChange={(e) => setFilters({ ...filters, technician: e.target.value })}>
              <option value="">Все техники</option>
              <option value="Ермахан">Ермахан</option>
              <option value="Мади">Мади</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Тип оборудования</label>
            <Select
              options={equipmentTypesOptions}
              isMulti
              value={filters.equipmentTypes}
              onChange={(selected) => setFilters({ ...filters, equipmentTypes: selected })}
              placeholder="Выберите тип оборудования"
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="warrantyOnly" checked={filters.warrantyOnly} onChange={(e) => setFilters({ ...filters, warrantyOnly: e.target.checked })} />
              <label className="form-check-label" htmlFor="warrantyOnly">Только гарантийные</label>
            </div>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-success w-100" onClick={exportToExcel}>📥 Скачать Excel</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5"><ClipLoader size={50} color="#007bff" /></div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-6">
              <div className="card p-3 shadow-sm mb-4">
                <h5>Общая статистика</h5>
                <p>Всего ремонтов: {currentStats.total}</p>
                <p>Гарантийных: {currentStats.warranty}</p>
                <p>Платных: {currentStats.paid}</p>
                <p>Сумма платных ремонтов: {currentStats.sum.toLocaleString('ru-RU')} ₸</p>

                <PieChart width={300} height={250}>
                  <Pie data={[
                    { name: 'Гарантия', value: currentStats.warranty },
                    { name: 'Платные', value: currentStats.paid },
                  ]} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 shadow-sm mb-4">
                <h5>Сравнение с предыдущим периодом</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Ремонты', Текущий: currentStats.total, Предыдущий: previousStats.total },
                    { name: 'Гарантийные', Текущий: currentStats.warranty, Предыдущий: previousStats.warranty },
                    { name: 'Платные', Текущий: currentStats.paid, Предыдущий: previousStats.paid },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Текущий" fill="#00C49F" />
                    <Bar dataKey="Предыдущий" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-3 shadow-sm mb-4">
              <h5>📋 Отчет по техникам</h5>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Техник</th>
                      <th>Всего ремонтов</th>
                      <th>Гарантийные</th>
                      <th>Платные</th>
                      <th>Сумма (₸)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicianStats.map((t) => (
                      <tr key={t.technician}>
                        <td>{t.technician}</td>
                        <td>{t.total}</td>
                        <td>{t.warranty}</td>
                        <td>{t.paid}</td>
                        <td>{t.sum.toLocaleString('ru-RU')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-3 shadow-sm mb-4">
              <h5>📈 Динамика ремонтов по дням</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mergedDailyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Текущий" stroke="#00C49F" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Предыдущий" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
        {defectReport && (
        <Box className="card p-4 shadow-sm mt-4">
          <Typography variant="h6" gutterBottom>
            🧰 Ремонт с брак склада
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            За выбранный период: <strong>{defectReport.totalCount}</strong> ремонтов
          </Typography>

          <Box className="row">
            <Box className="col-md-6 mb-4">
              <Typography variant="subtitle1" gutterBottom>
                Ремонт по техникам
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(defectReport.byTechnician).map(([technician, count]) => ({ technician, count }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="technician" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Количество ремонтов" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box className="col-md-6 mb-4">
              <Typography variant="subtitle1" gutterBottom>
                Сумма бонусов (4%)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(defectReport.bonusByTechnician).map(([technician, bonus]) => ({
                      name: technician,
                      value: parseFloat(bonus.toFixed(2))
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label
                  >
                    {Object.entries(defectReport.bonusByTechnician).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} ₸`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          <Box className="mt-4">
            <Typography variant="subtitle1" gutterBottom>
              Распределение по типу оборудования
            </Typography>
            <List dense>
              {Object.entries(defectReport.byType).map(([type, count]) => (
                <ListItem key={type}>
                  <Typography variant="body2">
                    <strong>{type}</strong>: {count} шт.
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      )}
      {defectReport?.partsUsage && (
  <Box className="card p-3 mt-4">
    <Typography variant="h6">Использованные запчасти</Typography>
    <List>
      {Object.entries(defectReport.partsUsage).map(([part, count]) => (
        <ListItem key={part}>{part}: {count}</ListItem>
      ))}
    </List>
  </Box>
)}
<Box className="card p-3 mt-4">
  <Typography variant="h6">Сравнение по дням</Typography>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={mergedDailyData()}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Текущий" stroke="#8884d8" />
      <Line type="monotone" dataKey="Предыдущий" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
</Box>

      </div>
  );
};

export default ReportsPage;