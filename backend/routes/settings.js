import express from 'express';
import { readDB, writeDB } from '../database/db.js';

const router = express.Router();

// GET /api/settings
router.get('/', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.settings || {} });
});

// PUT /api/settings
router.put('/', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Chamber settings updated successfully', data: db.settings });
});

export default router;
