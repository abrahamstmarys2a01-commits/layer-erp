import express from 'express';
import { getCollection, findById, insert, update, remove, readDB, writeDB } from '../database/db.js';

const router = express.Router();

const generateHearingId = () => {
  const hearings = getCollection('hearings');
  const maxNum = hearings.reduce((max, h) => {
    const match = (h.id || '').match(/\d+/);
    return match ? Math.max(max, parseInt(match[0], 10)) : max;
  }, 500);
  return `HRG-${maxNum + 1}`;
};

// GET /api/hearings
router.get('/', (req, res) => {
  const { search, junior, court, status, date } = req.query;
  let items = getCollection('hearings');

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (h) =>
        h.caseId.toLowerCase().includes(q) ||
        h.clientName.toLowerCase().includes(q) ||
        (h.notes && h.notes.toLowerCase().includes(q))
    );
  }

  if (junior) {
    items = items.filter((h) => h.junior === junior);
  }

  if (court) {
    items = items.filter((h) => h.court === court);
  }

  if (status) {
    items = items.filter((h) => h.status === status);
  }

  if (date) {
    items = items.filter((h) => h.hearingDate && h.hearingDate.startsWith(date));
  }

  res.json({ success: true, count: items.length, data: items });
});

// POST /api/hearings
router.post('/', (req, res) => {
  const { caseId, clientName, clientMobile, junior, court, hearingDate, time, hearingType, status, courtHall, notes, nextHearingDate } = req.body;

  if (!caseId || !clientName || !hearingDate) {
    return res.status(400).json({ success: false, message: 'Case ID, client name and hearing date are required.' });
  }

  const newHearing = {
    id: generateHearingId(),
    caseId,
    clientName,
    clientMobile: clientMobile || '',
    junior: junior || '',
    court: court || 'Madras High Court',
    hearingDate,
    time: time || '10:30 AM',
    hearingType: hearingType || 'Arguments',
    status: status || 'Upcoming',
    courtHall: courtHall || 'Court Hall No. 4',
    notes: notes || '',
    nextHearingDate: nextHearingDate || '-'
  };

  insert('hearings', newHearing);

  // Update Case nextHearingDate
  const db = readDB();
  db.cases = (db.cases || []).map((c) => {
    if (c.id === caseId) {
      return { ...c, nextHearingDate: hearingDate };
    }
    return c;
  });
  writeDB(db);

  res.status(201).json({ success: true, message: 'Court hearing scheduled successfully', data: newHearing });
});

// PUT /api/hearings/:id
router.put('/:id', (req, res) => {
  const updated = update('hearings', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Hearing record not found' });
  }
  res.json({ success: true, message: 'Hearing schedule updated successfully', data: updated });
});

// DELETE /api/hearings/:id
router.delete('/:id', (req, res) => {
  const success = remove('hearings', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Hearing record not found' });
  }
  res.json({ success: true, message: 'Hearing record deleted successfully' });
});

// POST /api/hearings/:id/whatsapp-reminder
router.post('/:id/whatsapp-reminder', (req, res) => {
  const hearing = findById('hearings', req.params.id);
  if (!hearing) {
    return res.status(404).json({ success: false, message: 'Hearing record not found' });
  }

  // Simulated WhatsApp notification response
  res.json({
    success: true,
    message: `WhatsApp reminder dispatched to ${hearing.clientName} (+91 ${hearing.clientMobile || '9876543210'}) for case ${hearing.caseId}`,
    hearingId: hearing.id,
    timestamp: new Date().toISOString()
  });
});

export default router;
