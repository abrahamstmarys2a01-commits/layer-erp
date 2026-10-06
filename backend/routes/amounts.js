import express from 'express';
import { getCollection, findById, insert, update, remove, readDB, writeDB } from '../database/db.js';

const router = express.Router();

const generateAmountId = () => {
  const amounts = getCollection('amounts');
  const maxNum = amounts.reduce((max, a) => {
    const match = (a.id || '').match(/\d+/);
    return match ? Math.max(max, parseInt(match[0], 10)) : max;
  }, 1000);
  return `TXN-${maxNum + 1}`;
};

// GET /api/amounts
router.get('/', (req, res) => {
  const { search, mode, date } = req.query;
  let items = getCollection('amounts');

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (a) =>
        a.caseId.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        (a.receiptNo && a.receiptNo.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }

  if (mode) {
    items = items.filter((a) => a.paymentMode === mode);
  }

  if (date) {
    items = items.filter((a) => a.paymentDate && a.paymentDate.startsWith(date));
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  res.json({
    success: true,
    count: items.length,
    totalAmount,
    data: items
  });
});

// POST /api/amounts
router.post('/', (req, res) => {
  const { caseId, clientName, amount, paymentDate, paymentMode, description, addedBy } = req.body;

  if (!caseId || !clientName || !amount) {
    return res.status(400).json({ success: false, message: 'Case ID, client name and amount are required.' });
  }

  const amountVal = Number(amount);
  if (isNaN(amountVal) || amountVal <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid positive amount.' });
  }

  const newAmount = {
    id: generateAmountId(),
    caseId,
    clientName,
    amount: amountVal,
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    paymentMode: paymentMode || 'UPI',
    description: description || '',
    addedBy: addedBy || 'Admin',
    receiptNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`
  };

  insert('amounts', newAmount);

  // Auto update Case paidAmount and status
  const db = readDB();
  db.cases = (db.cases || []).map((c) => {
    if (c.id === caseId) {
      const updatedPaid = (c.paidAmount || 0) + amountVal;
      const updatedStatus =
        updatedPaid >= (c.totalFee || 50000)
          ? 'Paid'
          : updatedPaid > 0
          ? 'Partial'
          : 'Pending';
      return {
        ...c,
        paidAmount: updatedPaid,
        amountStatus: updatedStatus
      };
    }
    return c;
  });
  writeDB(db);

  res.status(201).json({ success: true, message: 'Amount entry recorded successfully', data: newAmount });
});

// PUT /api/amounts/:id
router.put('/:id', (req, res) => {
  const updated = update('amounts', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Amount entry not found' });
  }
  res.json({ success: true, message: 'Amount entry updated successfully', data: updated });
});

// DELETE /api/amounts/:id
router.delete('/:id', (req, res) => {
  const success = remove('amounts', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Amount entry not found' });
  }
  res.json({ success: true, message: 'Amount entry deleted successfully' });
});

export default router;
