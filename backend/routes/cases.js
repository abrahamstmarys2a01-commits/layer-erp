import express from 'express';
import { getCollection, findById, insert, update, remove, readDB, writeDB } from '../database/db.js';

const router = express.Router();

const generateCaseId = () => {
  const cases = getCollection('cases');
  const maxNum = cases.reduce((max, c) => {
    const match = (c.id || '').match(/\d+/);
    return match ? Math.max(max, parseInt(match[0], 10)) : max;
  }, 1000);
  return `CASE-${maxNum + 1}`;
};

// GET /api/cases
router.get('/', (req, res) => {
  const { search, junior, status, type, court, hearingDate } = req.query;
  let items = getCollection('cases');

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        (c.clientMobile && c.clientMobile.includes(q)) ||
        (c.caseNumber && c.caseNumber.toLowerCase().includes(q))
    );
  }

  if (junior) {
    items = items.filter((c) => c.assignedJunior === junior);
  }

  if (status) {
    items = items.filter((c) => c.caseStatus === status);
  }

  if (type) {
    items = items.filter((c) => c.caseType === type);
  }

  if (court) {
    items = items.filter((c) => c.court === court);
  }

  if (hearingDate) {
    items = items.filter((c) => c.nextHearingDate && c.nextHearingDate.startsWith(hearingDate));
  }

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/cases/:id
router.get('/:id', (req, res) => {
  const foundCase = findById('cases', req.params.id);
  if (!foundCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const amounts = getCollection('amounts').filter((a) => a.caseId === foundCase.id);
  const hearings = getCollection('hearings').filter((h) => h.caseId === foundCase.id);

  res.json({
    success: true,
    data: {
      ...foundCase,
      payments: amounts,
      hearings: hearings
    }
  });
});

// POST /api/cases
router.post('/', (req, res) => {
  const {
    clientName,
    clientMobile,
    clientEmail,
    caseNumber,
    caseType,
    court,
    assignedJunior,
    caseStatus,
    totalFee,
    paidAmount,
    nextHearingDate,
    description,
    opposingParty,
    opposingAdvocate
  } = req.body;

  if (!clientName || !clientMobile) {
    return res.status(400).json({ success: false, message: 'Client name and mobile are required.' });
  }

  const feeVal = Number(totalFee) || 50000;
  const paidVal = Number(paidAmount) || 0;
  const amountStatus = paidVal >= feeVal ? 'Paid' : paidVal > 0 ? 'Partial' : 'Pending';

  const newCase = {
    id: generateCaseId(),
    clientName: clientName.trim(),
    clientMobile: clientMobile.trim(),
    clientEmail: clientEmail || '',
    caseNumber: caseNumber || '',
    caseType: caseType || 'Civil',
    court: court || 'Madras High Court',
    assignedJunior: assignedJunior || '',
    caseStatus: caseStatus || 'Active',
    amountStatus,
    totalFee: feeVal,
    paidAmount: paidVal,
    nextHearingDate: nextHearingDate || '-',
    description: description || '',
    filingDate: new Date().toISOString().split('T')[0],
    opposingParty: opposingParty || '',
    opposingAdvocate: opposingAdvocate || '',
    documents: [],
    notes: []
  };

  insert('cases', newCase);

  // If next hearing date is provided, create initial hearing entry
  if (nextHearingDate && nextHearingDate !== '-') {
    const hearings = getCollection('hearings');
    const maxNum = hearings.reduce((max, h) => {
      const match = (h.id || '').match(/\d+/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 500);

    const newHearing = {
      id: `HRG-${maxNum + 1}`,
      caseId: newCase.id,
      clientName: newCase.clientName,
      clientMobile: newCase.clientMobile,
      junior: newCase.assignedJunior,
      court: newCase.court,
      hearingDate: nextHearingDate,
      time: '10:30 AM',
      hearingType: 'First Hearing',
      status: 'Upcoming',
      courtHall: 'Court Hall No. 1',
      notes: `Initial listing for ${newCase.id}`
    };
    insert('hearings', newHearing);
  }

  // Update junior assigned case count
  if (assignedJunior) {
    const db = readDB();
    db.juniors = (db.juniors || []).map((j) => {
      if (j.name === assignedJunior) {
        return {
          ...j,
          assignedCases: (j.assignedCases || 0) + 1,
          activeCases: (j.activeCases || 0) + 1
        };
      }
      return j;
    });
    writeDB(db);
  }

  res.status(201).json({ success: true, message: 'Legal case created successfully', data: newCase });
});

// PUT /api/cases/:id
router.put('/:id', (req, res) => {
  const updated = update('cases', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  res.json({ success: true, message: 'Case updated successfully', data: updated });
});

// DELETE /api/cases/:id
router.delete('/:id', (req, res) => {
  const success = remove('cases', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  res.json({ success: true, message: 'Case deleted successfully' });
});

// POST /api/cases/:id/notes
router.post('/:id/notes', (req, res) => {
  const foundCase = findById('cases', req.params.id);
  if (!foundCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const { text, author } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Note text is required' });
  }

  const newNote = {
    id: `note-${Date.now()}`,
    text: text.trim(),
    author: author || 'Admin',
    date: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };

  const updatedNotes = [newNote, ...(foundCase.notes || [])];
  update('cases', req.params.id, { notes: updatedNotes });

  res.status(201).json({ success: true, message: 'Note added successfully', data: newNote });
});

// POST /api/cases/:id/documents
router.post('/:id/documents', (req, res) => {
  const foundCase = findById('cases', req.params.id);
  if (!foundCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const { title, category, fileSize, description, uploadDate, uploadedBy, previewType } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Document title is required' });
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    title: title.trim(),
    category: category || 'General Legal Document',
    fileType: title.endsWith('.pdf') ? 'PDF' : title.endsWith('.docx') ? 'DOCX' : 'IMG',
    fileSize: fileSize || '2.1 MB',
    uploadDate: uploadDate || new Date().toISOString().split('T')[0],
    uploadedBy: uploadedBy || 'Admin',
    description: description || 'Case legal document record.',
    previewType: previewType || (title.toLowerCase().includes('fir') ? 'fir' : title.toLowerCase().includes('agreement') ? 'agreement' : title.toLowerCase().includes('aadhaar') ? 'aadhaar' : title.toLowerCase().includes('court') ? 'court_order' : 'custom')
  };

  const updatedDocs = [newDoc, ...(foundCase.documents || [])];
  update('cases', req.params.id, { documents: updatedDocs });

  res.status(201).json({ success: true, message: 'Document attached successfully', data: newDoc });
});

// DELETE /api/cases/:id/documents/:docId
router.delete('/:id/documents/:docId', (req, res) => {
  const foundCase = findById('cases', req.params.id);
  if (!foundCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const updatedDocs = (foundCase.documents || []).filter((d) => d.id !== req.params.docId);
  update('cases', req.params.id, { documents: updatedDocs });

  res.json({ success: true, message: 'Document deleted successfully' });
});

export default router;
