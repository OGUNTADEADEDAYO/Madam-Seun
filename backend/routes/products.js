const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { Category } = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const {
            search, category, status, featured,
            sort = 'createdAt', order = 'desc',
            page = 1, limit = 50,
            adminView
        } = req.query;

        const query = {};

        if (!adminView) query.status = { $ne: 'hidden' };
        if (status && adminView) query.status = status;
        
        if (category && category !== 'all' && category !== '') {
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = category;
            } else {
                const cat = await Category.findOne({ name: new RegExp(`^${category.trim()}$`, 'i') });
                if (cat) {
                    query.category = cat._id;
                } else {
                    query.category = new mongoose.Types.ObjectId();
                }
            }
        }
        if (featured) query.featured = true;

        if (search) {
            query.$text = { $search: search };
        }

        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [rawProducts, total] = await Promise.all([
            Product.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Product.countDocuments(query)
        ]);

        const products = await Promise.all(rawProducts.map(async p => {
            if (!p.category) return { ...p, category: null };

            if (!mongoose.Types.ObjectId.isValid(p.category)) {
                const cat = await Category.findOne({ name: new RegExp(`^${p.category}$`, 'i') }).lean();
                if (cat) {
                    await Product.findByIdAndUpdate(p._id, { category: cat._id });
                    return { ...p, category: { _id: cat._id, name: cat.name, slug: cat.slug, icon: cat.icon } };
                }
                return { ...p, category: null };
            }

            const cat = await Category.findById(p.category).select('name slug icon').lean();
            return { ...p, category: cat || null };
        }));

        const productsWithFlags = products.map(p => ({
            ...p,
            isLowStock: p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)
        }));

        res.json({
            products: productsWithFlags,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', protect, async (req, res) => {
    try {
        const [total, inStock, preOrder, soldOut, hidden, lowStock, topViewed] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ status: 'in_stock' }),
            Product.countDocuments({ status: 'pre_order' }),
            Product.countDocuments({ status: 'sold_out' }),
            Product.countDocuments({ status: 'hidden' }),
            Product.countDocuments({
                stock: { $gt: 0, $lte: 5 },
                status: 'in_stock'
            }),
            Product.find({ status: { $ne: 'hidden' } })
                .sort({ views: -1 })
                .limit(5)
                .select('name views totalSold images')
                .lean()
        ]);
        res.json({ total, inStock, preOrder, soldOut, hidden, lowStock, topViewed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        if (product.category && !mongoose.Types.ObjectId.isValid(product.category)) {
            const cat = await Category.findOne({ name: new RegExp(`^${product.category}$`, 'i') });
            if (cat) {
                await Product.findByIdAndUpdate(product._id, { category: cat._id });
                product.category = cat;
            } else {
                product.category = null;
            }
        } else if (product.category) {
            const cat = await Category.findById(product.category).select('name slug icon').lean();
            product.category = cat || null;
        }

        res.json({ product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const {
            name, description, price, compareAtPrice,
            category, size, badge, images, stock, lowStockThreshold,
            status, featured, tags, sku
        } = req.body;

        let categoryId = category;
        if (!mongoose.Types.ObjectId.isValid(category)) {
            const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
            if (!cat) return res.status(400).json({ error: `Category "${category}" not found.` });
            categoryId = cat._id;
        } else {
            const catExists = await Category.findById(category);
            if (!catExists) return res.status(400).json({ error: 'Category ID not found.' });
        }

        const product = await Product.create({
            name, description, price, compareAtPrice,
            category: categoryId, size, badge, images, stock: stock || 0,
            lowStockThreshold, featured, tags, sku,
            status: status || 'in_stock',
            manualStatusOverride: ['pre_order', 'hidden'].includes(status) || (status === 'sold_out' && (stock || 0) > 0)
        });

        await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } });

        const populated = await product.populate('category', 'name slug icon');
        res.status(201).json({ product: populated, message: 'Product created.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A product with this name or SKU already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const {
            name, description, price, compareAtPrice,
            category, size, badge, images, stock, lowStockThreshold,
            status, featured, tags, sku
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        const oldCategory = product.category.toString();

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
        if (size !== undefined) product.size = size;
        if (badge !== undefined) product.badge = badge;
        if (category !== undefined) product.category = category;
        if (images !== undefined) product.images = images;
        if (stock !== undefined) product.stock = stock;
        if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
        if (featured !== undefined) product.featured = featured;
        if (tags !== undefined) product.tags = tags;
        if (sku !== undefined) product.sku = sku;

        if (status !== undefined) {
            product.manualStatusOverride = ['pre_order', 'hidden'].includes(status) || (status === 'sold_out' && product.stock > 0);
            product.status = status;
        }

        await product.save();

        if (category !== undefined) {
            let categoryId = category;
            if (!mongoose.Types.ObjectId.isValid(category)) {
                const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
                if (!cat) return res.status(400).json({ error: `Category "${category}" not found.` });
                categoryId = cat._id;
            }
            
            if (categoryId.toString() !== oldCategory) {
                product.category = categoryId;
                await Category.findByIdAndUpdate(oldCategory, { $inc: { productCount: -1 } });
                await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } });
            }
        }

        const populated = await product.populate('category', 'name slug icon');
        res.json({ product: populated, message: 'Product updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/stock', protect, async (req, res) => {
    try {
        const { action, quantity = 1 } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        if (action === 'decrement') {
            if (product.stock < quantity) {
                return res.status(400).json({ error: `Only ${product.stock} units available.` });
            }
            product.stock -= quantity;
            product.totalSold += quantity;
        } else if (action === 'increment') {
            product.stock += quantity;
        } else if (action === 'set') {
            product.stock = quantity;
        } else {
            return res.status(400).json({ error: 'Invalid action.' });
        }

        if (!product.manualStatusOverride) {
            product.status = product.stock <= 0 ? 'sold_out' : 'in_stock';
        }

        await product.save();

        const alert = product.stock > 0 && product.stock <= product.lowStockThreshold
            ? `⚠️ Low stock alert: only ${product.stock} units remaining!`
            : null;

        res.json({ product, alert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/view', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
