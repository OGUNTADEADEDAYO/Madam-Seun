const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalProducts,
      soldOutProducts,
      lowStockProducts,
      totalOrders,
      ordersToday,
      ordersThisMonth,
      ordersThisYear
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'sold_out' }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: firstDayOfYear } })
    ]);

    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const topSelling = await Product.find()
      .sort({ totalSold: -1 })
      .limit(5)
      .select('name totalSold images price');

    res.json({
      inventory: {
        total: totalProducts,
        soldOut: soldOutProducts,
        lowStock: lowStockProducts
      },
      orders: {
        total: totalOrders,
        today: ordersToday,
        thisMonth: ordersThisMonth,
        thisYear: ordersThisYear
      },
      financial: {
        totalRevenue
      },
      topSelling
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
