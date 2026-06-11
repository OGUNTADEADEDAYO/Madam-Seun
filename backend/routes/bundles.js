const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const router = express.Router();

const bundleStoreSchema = new mongoose.Schema({
  bundles: { type: Array, default: [] }
}, { timestamps: true });
const BundleStore = mongoose.model('BundleStore', bundleStoreSchema);

router.get('/', async (req, res) => {
  try {
    let store = await BundleStore.findOne();
    if (!store) {
      store = await BundleStore.create({ bundles: [] });
    }
    res.json(store.bundles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    let store = await BundleStore.findOne();
    if (!store) store = await BundleStore.create({ bundles: [] });
    
    store.bundles = req.body;
    await store.save();
    
    res.json({ message: 'Bundles saved', bundles: store.bundles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
