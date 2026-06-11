const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  items: [{
    name: String,
    qty: Number,
    price: Number,
    size: String
  }],
  total: { type: Number, required: true },
  shippingFee: { type: String, required: true },
  locCode: { type: String, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'out_for_delivery', 'rider_close', 'completed'],
    default: 'confirmed'
  },
  manualStatus: { type: Boolean, default: false },
  completionEmailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
