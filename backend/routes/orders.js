const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    let order = await Order.findOne({ trackId: orderData.trackId });
    if (!order) {
      order = await Order.create(orderData);
    }
    
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:trackId', async (req, res) => {
  try {
    const trackId = req.params.trackId;
    let order = await Order.findOne({ trackId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.manualStatus) {
      const hoursPassed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      const daysPassed = hoursPassed / 24;
      const locCode = order.locCode;
      
      let computedStatus = 'confirmed';
      
      if (locCode === 'LOS') {
        if (daysPassed >= 2) computedStatus = 'completed';
        else if (hoursPassed >= 5) computedStatus = 'rider_close';
        else if (hoursPassed >= 1) computedStatus = 'out_for_delivery';
      } else {
        if (daysPassed >= 5) computedStatus = 'completed';
        else if (daysPassed >= 2) computedStatus = 'rider_close';
        else if (daysPassed >= 1) computedStatus = 'out_for_delivery';
      }
      
      if (order.status !== computedStatus) {
        order.status = computedStatus;
        await order.save();
      }
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:trackId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'out_for_delivery', 'rider_close', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Order.findOneAndUpdate(
      { trackId: req.params.trackId },
      { status, manualStatus: true },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
