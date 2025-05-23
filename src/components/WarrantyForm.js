// src/components/WarrantyForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Button, Typography, Box, Paper, List, ListItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, IconButton, Stack, useMediaQuery
} from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Html5Qrcode } from 'html5-qrcode';
import logo from '../assets/logo.png';

const WarrantyForm = () => {
  const [serials, setSerials] = useState([]);
  const [input, setInput] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleAddSerial = () => {
    if (input.trim()) {
      setSerials(prev => [...prev, input.trim()]);
      setInput('');
    }
  };

  const handleScanKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSerial();
    }
  };

  const generatePDF = async () => {
    const date = new Date().toLocaleDateString();
    const warranty = {
      phone: clientPhone,
      serials,
      date: new Date().toISOString(),
    };

    await addDoc(collection(db, 'warranties'), warranty);

    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, 'PNG', 80, 10, 50, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Гарантийный талон', 105, 40, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Дата выдачи: ${date}`, 14, 50);
      doc.text('Серийные номера оборудования:', 14, 60);

      autoTable(doc, {
        startY: 65,
        head: [['№', 'Серийный номер']],
        body: serials.map((s, i) => [i + 1, s]),
      });

      doc.text('Гарантийные условия:', 14, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.text('Этот текст будет заменён позже на актуальные условия.', 14, doc.lastAutoTable.finalY + 20);
      doc.save('warranty.pdf');
    };

    setSerials([]);
    setClientPhone('');
  };

  const searchBySerial = async () => {
    const q = query(collection(db, 'warranties'));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = all.filter(w => w.serials.some(s => s.includes(searchQuery)));
    setSearchResult(filtered);
  };

  const searchByPhone = async () => {
    const q = query(collection(db, 'warranties'));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = all.filter(w => w.phone.includes(searchQuery));
    setSearchResult(filtered);
  };

  useEffect(() => {
    let html5QrCode;
    if (isScannerOpen && scannerRef.current) {
      html5QrCode = new Html5Qrcode("scanner");
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
          html5QrCode.start(
            devices[0].id,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            decodedText => {
              setSerials(prev => [...prev, decodedText]);
              setIsScannerOpen(false);
              html5QrCode.stop();
            },
            () => {}
          );
        }
      }).catch(console.error);
    }
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
      }
    };
  }, [isScannerOpen]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Выдача гарантийных талонов</Typography>

      <Stack spacing={2}>
        <TextField
          label="Сканируйте ШК или введите вручную"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleScanKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setIsScannerOpen(true)}>
                  <QrCodeScanner />
                </IconButton>
              </InputAdornment>
            )
          }}
          fullWidth
        />

        <TextField
          label="Номер телефона клиента"
          value={clientPhone}
          onChange={e => setClientPhone(e.target.value)}
          fullWidth
        />

        <List component={Paper} sx={{ maxHeight: 200, overflow: 'auto' }}>
          {serials.map((s, i) => (
            <ListItem key={i}>{s}</ListItem>
          ))}
        </List>

        <Button variant="contained" onClick={generatePDF} disabled={!serials.length || !clientPhone}>
          Сгенерировать ГТ
        </Button>

        <Typography variant="h6">Поиск по серийному номеру или телефону</Typography>
        <TextField
          label="Введите часть серийного номера или телефона"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={searchBySerial}>По серийному</Button>
                <Button onClick={searchByPhone}>По телефону</Button>
              </InputAdornment>
            )
          }}
          fullWidth
        />

        {searchResult.map((res, i) => (
          <Paper key={i} sx={{ p: 2 }}>
            <Typography>Телефон: {res.phone}</Typography>
            <Typography>Дата: {new Date(res.date).toLocaleDateString()}</Typography>
            <Typography>Серийники: {res.serials.join(', ')}</Typography>
          </Paper>
        ))}
      </Stack>

      <Dialog open={isScannerOpen} onClose={() => setIsScannerOpen(false)} fullScreen={isMobile} fullWidth maxWidth="sm">
        <DialogTitle>Сканируйте QR/Штрихкод</DialogTitle>
        <DialogContent>
          <Box id="scanner" ref={scannerRef} sx={{ width: '100%', height: 300 }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default WarrantyForm;
