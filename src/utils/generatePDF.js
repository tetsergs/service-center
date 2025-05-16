// src/utils/generatePDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 

export function generatePDF(order) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Акт выполненных работ', 14, 20);

  doc.setFontSize(12);
  doc.text(`Клиент: ${order.clientName || '-'}`, 14, 30);
  doc.text(`Телефон: ${order.phone || '-'}`, 14, 36);
  doc.text(`Город: ${order.city || '-'}`, 14, 42);
  doc.text(`Дата: ${order.date || '-'}`, 14, 48);
  doc.text(`Техник: ${order.technician || '-'}`, 14, 54);
  doc.text(`Статус: ${order.status || '-'}`, 14, 60);

  const equipmentData = order.equipment?.map((item, index) => [
    index + 1,
    item.type || '',
    item.name || '',
    item.serial || '',
  ]) || [];

  if (equipmentData.length > 0) {
    doc.autoTable({
      head: [['#', 'Тип', 'Название', 'Серийный номер']],
      body: equipmentData,
      startY: 70,
    });
  }

  const notesY = (doc.autoTable?.previous?.finalY || 80) + 10;
  doc.text(`Заметки: ${order.notes || '-'}`, 14, notesY);

  doc.save(`АВР_${order.clientName || 'client'}.pdf`);
}
