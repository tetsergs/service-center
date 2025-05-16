import React from 'react';

const Report = () => {
  const repairs = JSON.parse(localStorage.getItem('repairs')) || [];

  const total = repairs.reduce((sum, r) => {
    if (!isNaN(r.cost)) return sum + parseFloat(r.cost);
    return sum;
  }, 0);

  const byTechnician = {};
  repairs.forEach(r => {
    if (!byTechnician[r.technician]) byTechnician[r.technician] = 0;
    byTechnician[r.technician]++;
  });

  return (
    <div className="container mt-5">
      <h2>Отчёты</h2>
      <p><b>Общая сумма ремонтов:</b> {total} тг</p>
      <h4>Ремонты по техникам:</h4>
      <ul>
        {Object.entries(byTechnician).map(([tech, count]) => (
          <li key={tech}>{tech}: {count} ремонтов</li>
        ))}
      </ul>
    </div>
  );
};

export default Report;