import express from 'express';
import { getCollection, setCollection, readDB, writeDB } from '../database/db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const trimmedUser = (username || '').trim().toLowerCase();
  const trimmedPass = (password || '').trim();

  const users = getCollection('users');
  const user = users.find(
    (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
  );

  if (user) {
    const { password: _, ...userSafe } = user;
    return res.json({
      success: true,
      message: 'Login successful',
      user: userSafe,
      token: 'layer_erp_jwt_session_token_2026'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Incorrect username or password.'
    });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const users = getCollection('users');
  const user = users[0];
  if (user) {
    const { password: _, ...userSafe } = user;
    return res.json({ success: true, user: userSafe });
  }
  return res.status(404).json({ success: false, message: 'User not found' });
});

// PATCH /api/auth/profile (Update Admin Profile & Photo)
router.patch('/profile', (req, res) => {
  const { name, email, avatar, role, mobile } = req.body;
  const users = getCollection('users');
  if (users.length > 0) {
    if (name !== undefined) users[0].name = name;
    if (email !== undefined) users[0].email = email;
    if (avatar !== undefined) users[0].avatar = avatar;
    if (role !== undefined) users[0].role = role;
    if (mobile !== undefined) users[0].mobile = mobile;
    
    setCollection('users', users);

    // Also update settings profile in database
    const db = readDB();
    if (db.settings && db.settings.profile) {
      if (name !== undefined) db.settings.profile.adminName = name;
      if (email !== undefined) db.settings.profile.email = email;
      if (mobile !== undefined) db.settings.profile.mobile = mobile;
      if (role !== undefined) db.settings.profile.role = role;
      if (avatar !== undefined) db.settings.profile.profileImage = avatar;
      writeDB(db);
    }
    
    const { password: _, ...userSafe } = users[0];
    return res.json({
      success: true,
      message: 'Admin profile & avatar updated successfully',
      user: userSafe
    });
  }
  return res.status(404).json({ success: false, message: 'User not found' });
});

// POST /api/auth/change-password
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const users = getCollection('users');
  const user = users[0];

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const trimmedCurrent = (currentPassword || '').trim();
  const trimmedNew = (newPassword || '').trim();

  if (!trimmedNew || trimmedNew.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
  }

  if (user.password !== trimmedCurrent) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  // Save new password permanently to database
  user.password = trimmedNew;
  setCollection('users', users);

  return res.json({
    success: true,
    message: 'Admin password updated successfully in database. You can now login with your new password.'
  });
});

export default router;
