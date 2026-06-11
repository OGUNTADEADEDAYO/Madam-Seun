const express = require('express');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }

    const admin = await Admin.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
    }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = signToken(admin._id);

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin
    }
  });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, setupKey } = req.body;

    if (setupKey !== process.env.SETUP_KEY) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ error: 'Admin already exists.' });

    const admin = await Admin.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: 'superadmin'
    });

    const token = signToken(admin._id);
    res.status(201).json({ token, message: 'Admin created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
