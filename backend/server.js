// ═══════════════════════════════════════════════
//  MADAM SEUN — Backend API Server
//  Node.js + Express + MongoDB Atlas
// ═══════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');
const notifyRoutes = require('./routes/notify');
const { router: newsletterRoutes } = require('./routes/newsletter');
const bundleRoutes = require('./routes/bundles');
const orderRoutes = require('./routes/orders');
const questionRoutes = require('./routes/questions');

const app = express();

app.set('trust proxy', 1);

// ── Security Middleware ────────────────────────
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'null',
  'https://seunadmin.vercel.app',
  process.env.ADMIN_ORIGIN
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ──────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── Database Connection ────────────────────────
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => { console.error('❌ MongoDB connection error:', err.message); });

// ── Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/questions', questionRoutes);

// ── Health Check ───────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ───────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Madam Seun API running on port ${PORT}`));

module.exports = app;
