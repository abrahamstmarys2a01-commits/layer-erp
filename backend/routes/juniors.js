import express from 'express';
import { getCollection, findById, insert, update, remove } from '../database/db.js';

const router = express.Router();

// Generate unique Junior ID
const generateJuniorId = () => {
  const juniors = getCollection('juniors');
  const maxNum = juniors.reduce((max, j) => {
    const match = (j.id || '').match(/\d+/);
    return match ? Math.max(max, parseInt(match[0], 10)) : max;
  }, 100);
  return `JUN-${maxNum + 1}`;
};

// GET /api/juniors
router.get('/', (req, res) => {
  const { search, status } = req.query;
  let items = getCollection('juniors');

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.mobile.includes(q) ||
        j.email.toLowerCase().includes(q) ||
        (j.specialization && j.specialization.toLowerCase().includes(q))
    );
  }

  if (status) {
    items = items.filter((j) => j.status === status);
  }

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/juniors/:id
router.get('/:id', (req, res) => {
  const junior = findById('juniors', req.params.id);
  if (!junior) {
    return res.status(404).json({ success: false, message: 'Junior advocate not found' });
  }

  // Also include assigned cases from cases collection
  const cases = getCollection('cases');
  const assignedCases = cases.filter(
    (c) => c.assignedJunior && c.assignedJunior.toLowerCase().includes(junior.name.toLowerCase().replace('adv. ', ''))
  );

  res.json({
    success: true,
    data: {
      ...junior,
      assignedCasesList: assignedCases,
      calculatedActiveCases: assignedCases.filter((c) => c.caseStatus === 'Active' || c.caseStatus === 'New').length,
      calculatedClosedCases: assignedCases.filter((c) => c.caseStatus === 'Closed').length
    }
  });
});

// POST /api/juniors
router.post('/', (req, res) => {
  const { name, mobile, email, address, specialization, barCouncilNo, status, joinedDate } = req.body;

  if (!name || !mobile || !email) {
    return res.status(400).json({ success: false, message: 'Name, mobile and email are required.' });
  }

  const newJunior = {
    id: generateJuniorId(),
    name: name.trim(),
    mobile: mobile.trim(),
    email: email.trim(),
    address: address || '',
    specialization: specialization || 'Civil & Property Law',
    barCouncilNo: barCouncilNo || '',
    status: status || 'Active',
    joinedDate: joinedDate || new Date().toISOString().split('T')[0],
    assignedCases: 0,
    activeCases: 0,
    closedCases: 0
  };

  insert('juniors', newJunior);
  res.status(201).json({ success: true, message: 'Junior advocate registered successfully', data: newJunior });
});

// PUT /api/juniors/:id
router.put('/:id', (req, res) => {
  const updated = update('juniors', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Junior advocate not found' });
  }
  res.json({ success: true, message: 'Junior advocate updated successfully', data: updated });
});

// PATCH /api/juniors/:id/status
router.patch('/:id/status', (req, res) => {
  const junior = findById('juniors', req.params.id);
  if (!junior) {
    return res.status(404).json({ success: false, message: 'Junior advocate not found' });
  }

  const newStatus = junior.status === 'Active' ? 'Inactive' : 'Active';
  const updated = update('juniors', req.params.id, { status: newStatus });
  res.json({ success: true, message: `Junior advocate is now ${newStatus}`, data: updated });
});

// DELETE /api/juniors/:id
router.delete('/:id', (req, res) => {
  const success = remove('juniors', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Junior advocate not found' });
  }
  res.json({ success: true, message: 'Junior advocate deleted successfully' });
});

export default router;
