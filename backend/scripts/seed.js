const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const { Category } = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI;

const RAW_PRODUCTS = [
  { id: 'jm-pear-1', name: 'Jo Malone English Pear', price: 24500, image: 'jo malone perfume 1.webp', size: '100ml', categories: ['best-sellers', 'women', 'all'], description: 'A timeless English fragrance.' },
  { id: 'prada-milano-1', name: 'Prada Milano', price: 28000, image: 'Prada milano 3 1.webp', size: '100ml', categories: ['best-sellers', 'men', 'all'], description: 'Sophisticated and bold.' },
  { id: 'zara-gold-1', name: 'Zara Gold', price: 15500, image: 'zara perfume 2 1.webp', size: '75ml', categories: ['best-sellers', 'unisex', 'all'], description: 'A fresh and vibrant everyday fragrance.' },
  { id: 'jm-intense-1', name: 'Jo Malone Intense', price: 30000, image: 'jo malone 2 1.webp', size: '50ml', categories: ['new-arrivals', 'women', 'all'], description: 'Deep, luxurious evening fragrance.' },
  { id: 'prada-ocean-1', name: 'Prada Ocean', price: 26000, image: 'prada milano 3.webp', size: '75ml', categories: ['new-arrivals', 'men', 'all'], description: 'A modern marine twist.' },
  { id: 'zara-night-1', name: 'Zara Night Pour Homme', price: 12500, image: 'zara perfume 3 1.webp', size: '50ml', categories: ['men', 'all'], description: 'Spicy cardamom and cedarwood.' },
  { id: 'jm-sage-1', name: 'Jo Malone Wood Sage', price: 19000, image: 'jo malone 3 1.webp', size: '50ml', categories: ['unisex', 'all'], description: 'Fresh, mineral, and utterly addictive.' },
  { id: 'prada-candy-1', name: 'Prada Candy', price: 25000, image: 'perfume 1.webp', size: '75ml', categories: ['women', 'all'], description: 'A playful exploration of caramel and vanilla.' },
  { id: 'zara-giftset-1', name: 'Zara Discovery Set', price: 30000, image: 'perfume 2.webp', size: '3 × 50ml', categories: ['gift-sets', 'all'], description: 'Three popular fragrances in one premium box.' },
  { id: 'jm-velvet-1', name: 'Jo Malone Velvet Rose', price: 35000, image: 'perfume 3.webp', size: '100ml', categories: ['brands', 'women', 'all'], description: 'Velvet rose and oud intertwine.' }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create main categories
    const categories = ['Best Sellers', 'New Arrivals', 'Men', 'Women', 'Unisex', 'Gift Sets', 'Brands'];
    const catMap = {};
    for (const name of categories) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({ name });
      }
      catMap[name.toLowerCase().replace(/\s+/g, '-')] = cat._id;
    }
    
    // Fallback category
    if (!catMap['all']) {
      let allCat = await Category.findOne({ name: 'All' });
      if (!allCat) allCat = await Category.create({ name: 'All' });
      catMap['all'] = allCat._id;
    }

    let inserted = 0;
    for (const raw of RAW_PRODUCTS) {
      const exists = await Product.findOne({ sku: raw.id });
      if (!exists) {
        // Find primary category (first valid one)
        let primaryCatId = catMap['all'];
        for (const c of raw.categories) {
           if (catMap[c] && c !== 'all') {
               primaryCatId = catMap[c];
               break;
           }
        }
        
        // "new-arrivals-tab" is basically "new-arrivals"
        if (raw.categories.includes('new-arrivals-tab')) {
            primaryCatId = catMap['new-arrivals'];
        }

        await Product.create({
          sku: raw.id,
          name: raw.name,
          price: raw.price,
          description: raw.description,
          size: raw.size,
          badge: raw.badge,
          images: [{ url: '/' + raw.image, isPrimary: true }],
          category: primaryCatId,
          tags: raw.categories,
          stock: 50,
          status: 'in_stock'
        });
        inserted++;
      }
    }

    console.log(`Successfully seeded ${inserted} new products.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
