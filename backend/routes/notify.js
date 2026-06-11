const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const router = express.Router();

const notifySchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const NotifyMe = mongoose.model('NotifyMe', notifySchema);

router.post('/', async (req, res) => {
  try {
    const { email, productId, productName } = req.body;
    if (!email || !productId) {
      return res.status(400).json({ error: 'Email and product ID are required.' });
    }
    
    const existing = await NotifyMe.findOne({ email, productId, notified: false });
    if (existing) {
      return res.status(409).json({ message: 'You are already on the waitlist for this item.' });
    }
    
    await NotifyMe.create({ email, productId, productName });
    res.status(201).json({ success: true, message: 'We will notify you when it arrives!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const requests = await NotifyMe.find({ notified: false }).sort({ createdAt: -1 }).populate('productId', 'name images stock');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/mark-notified', protect, async (req, res) => {
  try {
    const reqItem = await NotifyMe.findByIdAndUpdate(req.params.id, { notified: true }, { new: true });
    if (!reqItem) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, item: reqItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
